// app/api/admin/license/create/route.ts
// API endpoint để admin tạo license mới
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signLicense } from '@/lib/crypto';
import { verifyAdmin } from '@/lib/auth';
import { z } from 'zod';

const CreateLicenseSchema = z.object({
  deviceId: z.string().min(1),
  toolType: z.string().min(1),
  owner: z.string().default(''),
  type: z.enum(['TRIAL', 'MONTHLY', 'YEARLY', 'LIFETIME', 'CUSTOM']),
  days: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    const body = await req.json();
    const { deviceId, toolType, owner, type, days } = CreateLicenseSchema.parse(body);

    // Ensure device exists
    await prisma.device.upsert({
      where: { deviceId },
      update: { lastSeen: new Date() },
      create: { deviceId },
    });

    // Calculate expiry based on type
    let daysToAdd: number;
    switch (type) {
      case 'TRIAL':
        daysToAdd = 1;
        break;
      case 'MONTHLY':
        daysToAdd = 30;
        break;
      case 'YEARLY':
        daysToAdd = 365;
        break;
      case 'LIFETIME':
        daysToAdd = 10000; // ~27 years
        break;
      case 'CUSTOM':
        if (!days) {
          return NextResponse.json({
            success: false,
            error: 'Days required for custom license',
          }, { status: 400 });
        }
        daysToAdd = days;
        break;
      default:
        daysToAdd = 30;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysToAdd);
    const expiryDateStr = expiresAt.toISOString().split('T')[0]; // YYYY-MM-DD

    // Sign the license
    const licenseKey = signLicense(deviceId, owner || toolType, expiryDateStr);

    // Check for existing active license
    const existingLicense = await prisma.license.findFirst({
      where: {
        deviceId,
        toolType,
        status: 'ACTIVE',
      },
    });

    if (existingLicense) {
      // Revoke old license
      await prisma.license.update({
        where: { id: existingLicense.id },
        data: { 
          status: 'REVOKED',
          revokedAt: new Date(),
        },
      });
    }

    // Create new license
    const license = await prisma.license.create({
      data: {
        deviceId,
        toolType,
        licenseKey,
        owner: owner || null,
        type,
        status: 'ACTIVE',
        expiresAt,
        issuedAt: new Date(),
      },
    });

    // Log activity với description chi tiết
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'CREATE_LICENSE',
        details: JSON.stringify({
          description: `Admin ${admin.email} created license for Device ID: ${deviceId}, Tool: ${toolType}, Type: ${type}, Duration: ${daysToAdd} days, Expires: ${expiryDateStr}`,
          licenseId: license.id,
          deviceId,
          toolType,
          type,
          days: daysToAdd,
          expiresAt: expiryDateStr,
          owner: owner || null,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      license: {
        id: license.id,
        licenseKey,
        deviceId,
        toolType,
        type,
        owner: license.owner,
        expiresAt,
        daysRemaining: daysToAdd,
      },
    });

  } catch (error) {
    console.error('Create license error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

