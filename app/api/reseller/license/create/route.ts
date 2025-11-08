// app/api/reseller/license/create/route.ts
// API endpoint để reseller tạo license (chỉ với các gói cố định)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signLicense } from '@/lib/crypto';
import { verifyAdmin } from '@/lib/auth';
import { z } from 'zod';

// Reseller chỉ có thể tạo các gói này
const RESELLER_PACKAGES = {
  '1_MONTH': 30,       // 1 tháng
  '3_MONTHS': 90,      // 3 tháng
  '6_MONTHS': 180,     // 6 tháng
  '1_YEAR': 365,        // 1 năm
  '2_YEARS': 730,       // 2 năm
} as const;

const ResellerCreateSchema = z.object({
  deviceId: z.string().min(1),
  toolType: z.enum(['veo', 'voice']),
  owner: z.string().default(''),
  package: z.enum(['1_MONTH', '3_MONTHS', '6_MONTHS', '1_YEAR', '2_YEARS']),
});

export async function POST(req: NextRequest) {
  try {
    // Verify reseller authentication (reseller cũng là admin với role RESELLER)
    const adminPayload = await verifyAdmin(req);
    if (!adminPayload) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    // Get full admin data from database (to get name)
    const admin = await prisma.admin.findUnique({
      where: { id: adminPayload.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Admin not found',
      }, { status: 401 });
    }

    // Check if user is reseller
    if (admin.role !== 'RESELLER') {
      return NextResponse.json({
        success: false,
        error: 'Only resellers can use this endpoint',
      }, { status: 403 });
    }

    const body = await req.json();
    const { deviceId, toolType, owner, package: packageType } = ResellerCreateSchema.parse(body);

    // Get days from package
    const daysToAdd = RESELLER_PACKAGES[packageType];
    if (!daysToAdd) {
      return NextResponse.json({
        success: false,
        error: 'Invalid package type',
      }, { status: 400 });
    }

    // Ensure device exists
    await prisma.device.upsert({
      where: { deviceId },
      update: { lastSeen: new Date() },
      create: { deviceId },
    });

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
        type: 'CUSTOM', // Reseller packages are custom
        status: 'ACTIVE',
        expiresAt,
        issuedAt: new Date(),
        metadata: JSON.stringify({
          createdBy: 'RESELLER',
          resellerEmail: admin.email,
          resellerName: admin.name || admin.email,
          package: packageType,
          days: daysToAdd,
        }),
      },
    });

    // Log activity với description rõ ràng "SELLER_ADD"
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'SELLER_ADD',
        details: JSON.stringify({
          description: `Reseller ${admin.email} (${admin.name || admin.email}) added license for Device ID: ${deviceId}, Tool: ${toolType}, Package: ${packageType} (${daysToAdd} days), Expires: ${expiryDateStr}`,
          licenseId: license.id,
          deviceId,
          toolType,
          package: packageType,
          days: daysToAdd,
          expiresAt: expiresAt.toISOString(),
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
        type: 'CUSTOM',
        package: packageType,
        owner: license.owner,
        expiresAt: expiresAt.toISOString(),
        daysRemaining: daysToAdd,
      },
      message: `License created successfully (${packageType}: ${daysToAdd} days)`,
    });

  } catch (error) {
    console.error('Reseller create license error:', error);
    
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

