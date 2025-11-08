// app/api/license/check/route.ts
// API endpoint để check license - được gọi từ app client
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyLicense, signLicense } from '@/lib/crypto';
import { z } from 'zod';

const CheckSchema = z.object({
  deviceId: z.string().min(1),
  toolType: z.string().min(1),
  licenseKey: z.string().optional(),
  hostname: z.string().optional(),
  ipAddress: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, toolType, licenseKey: providedLicenseKey, hostname, ipAddress } = CheckSchema.parse(body);

    // Update or create device record
    const device = await prisma.device.upsert({
      where: { deviceId },
      update: { 
        lastSeen: new Date(),
        hostname,
        ipAddress,
      },
      create: {
        deviceId,
        hostname,
        ipAddress,
        trialUsed: false,
      },
    });

    // If license key provided, verify it
    if (providedLicenseKey) {
      const verification = verifyLicense(providedLicenseKey);
      
      if (!verification.valid) {
        return NextResponse.json({
          success: false,
          error: verification.error || 'Invalid license',
        }, { status: 400 });
      }

      // Check if license exists in DB
      const license = await prisma.license.findUnique({
        where: { licenseKey: providedLicenseKey },
      });

      if (!license) {
        return NextResponse.json({
          success: false,
          error: 'License not found in system',
        }, { status: 404 });
      }

      // Check if license matches device
      if (license.deviceId !== deviceId) {
        return NextResponse.json({
          success: false,
          error: 'License not issued for this device',
        }, { status: 403 });
      }

      // Check if license matches tool
      if (license.toolType !== toolType) {
        return NextResponse.json({
          success: false,
          error: 'License not valid for this tool',
        }, { status: 403 });
      }

      // Check status
      if (license.status !== 'ACTIVE') {
        return NextResponse.json({
          success: false,
          error: `License is ${license.status.toLowerCase()}`,
        }, { status: 403 });
      }

      // Update usage stats
      await prisma.license.update({
        where: { licenseKey: providedLicenseKey },
        data: {
          activations: { increment: 1 },
          lastUsed: new Date(),
          activatedAt: license.activatedAt || new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        license: {
          licenseKey: license.licenseKey,
          type: license.type,
          expiresAt: license.expiresAt.toISOString(),
          owner: license.owner,
          daysRemaining: Math.ceil((license.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        },
      });
    }

    // No license key provided - check for existing valid license or trial
    const existingLicense = await prisma.license.findFirst({
      where: {
        deviceId,
        toolType,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: 'desc' },
    });

    if (existingLicense) {
      return NextResponse.json({
        success: true,
        license: {
          licenseKey: existingLicense.licenseKey,
          type: existingLicense.type,
          expiresAt: existingLicense.expiresAt.toISOString(),
          owner: existingLicense.owner,
          daysRemaining: Math.ceil((existingLicense.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        },
      });
    }

    // Check if trial was already used for this specific toolType
    const existingTrialForTool = await prisma.license.findFirst({
      where: {
        deviceId,
        toolType,
        type: 'TRIAL',
      },
    });

    if (existingTrialForTool) {
      return NextResponse.json({
        success: false,
        error: `Trial period has been used for this device and tool (${toolType})`,
        trialUsed: true,
      }, { status: 403 });
    }

    // Auto-grant 1-day trial (FIRST TIME ONLY)
    const trialDays = parseInt(process.env.TRIAL_DAYS || '1');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + trialDays);
    
    const expiryDateStr = expiresAt.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Generate real license key with RSA signature
    let licenseKey: string;
    try {
      const owner = `AUTO_TRIAL_${toolType}`;
      licenseKey = signLicense(deviceId, owner, expiryDateStr);
      console.log('License key generated successfully');
    } catch (signError) {
      console.error('Error signing license:', signError);
      throw new Error(`Failed to generate license key: ${signError instanceof Error ? signError.message : 'Unknown error'}`);
    }
    
    // Create trial license in database
    let trialLicense;
    try {
      trialLicense = await prisma.license.create({
        data: {
          deviceId,
          toolType,
          licenseKey,
          owner: `Auto Trial - ${toolType}`,
          type: 'TRIAL',
          status: 'ACTIVE',
          expiresAt,
          activatedAt: new Date(),
          issuedAt: new Date(),
        },
      });
      console.log('Trial license created in database');
    } catch (dbError) {
      console.error('Error creating trial license in database:', dbError);
      throw new Error(`Failed to create trial license: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

    // Mark trial as used for this device + toolType combination
    // Check if there's already a trial for this toolType
    const existingTrial = await prisma.license.findFirst({
      where: {
        deviceId,
        toolType,
        type: 'TRIAL',
      },
    });

    // Only mark trialUsed if this is the first trial for this device (any tool)
    const anyTrial = await prisma.license.findFirst({
      where: {
        deviceId,
        type: 'TRIAL',
      },
    });

    if (!anyTrial || anyTrial.id === trialLicense.id) {
      await prisma.device.update({
        where: { deviceId },
        data: { trialUsed: true },
      });
    }

    return NextResponse.json({
      success: true,
      trial: true,
      license: {
        licenseKey, // Return the signed license key
        type: 'TRIAL',
        expiresAt: expiresAt.toISOString(),
        owner: `Auto Trial - ${toolType}`,
        daysRemaining: trialDays,
      },
      message: `Trial version granted (${trialDays} day${trialDays > 1 ? 's' : ''})`,
    });

  } catch (error) {
    console.error('License check error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      }, { status: 400 });
    }

    // Return more detailed error in development
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? { message: errorMessage, stack: error instanceof Error ? error.stack : undefined }
      : undefined;

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      ...(errorDetails && { details: errorDetails }),
    }, { status: 500 });
  }
}

