// app/api/admin/license/extend/route.ts
// API endpoint để admin gia hạn license (update expiresAt)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signLicense } from '@/lib/crypto';
import { verifyAdmin } from '@/lib/auth';
import { z } from 'zod';

const ExtendSchema = z.object({
  licenseId: z.string(),
  days: z.number().int().positive(), // Số ngày thêm vào
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    const body = await req.json();
    const { licenseId, days, reason } = ExtendSchema.parse(body);

    // Find license
    const license = await prisma.license.findUnique({
      where: { id: licenseId },
    });

    if (!license) {
      return NextResponse.json({
        success: false,
        error: 'License not found',
      }, { status: 404 });
    }

    // Trial licenses cannot be extended
    if (license.type === 'TRIAL') {
      return NextResponse.json({
        success: false,
        error: 'Trial licenses cannot be extended',
      }, { status: 400 });
    }

    // Calculate new expiry date
    const currentExpiresAt = new Date(license.expiresAt);
    const newExpiresAt = new Date(currentExpiresAt);
    newExpiresAt.setDate(newExpiresAt.getDate() + days);
    
    const expiryDateStr = newExpiresAt.toISOString().split('T')[0]; // YYYY-MM-DD

    // Generate new license key with updated expiry date
    const newLicenseKey = signLicense(
      license.deviceId,
      license.owner || license.toolType,
      expiryDateStr
    );

    // Update license
    const updatedLicense = await prisma.license.update({
      where: { id: licenseId },
      data: {
        expiresAt: newExpiresAt,
        licenseKey: newLicenseKey, // Update license key với expiry date mới
        metadata: JSON.stringify({
          ...(license.metadata ? JSON.parse(license.metadata) : {}),
          extendedBy: admin.email,
          extendedAt: new Date().toISOString(),
          daysAdded: days,
          previousExpiry: currentExpiresAt.toISOString(),
          reason: reason || 'Admin extended',
        }),
      },
    });

    // Log activity với description chi tiết
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'EXTEND_LICENSE',
        details: JSON.stringify({
          description: `Admin ${admin.email} extended license ID: ${licenseId} for Device ID: ${license.deviceId}, Tool: ${license.toolType}, Added: ${days} days, Previous Expiry: ${currentExpiresAt.toISOString().split('T')[0]}, New Expiry: ${newExpiresAt.toISOString().split('T')[0]}`,
          licenseId,
          deviceId: license.deviceId,
          toolType: license.toolType,
          days,
          previousExpiry: currentExpiresAt.toISOString(),
          newExpiry: newExpiresAt.toISOString(),
          reason,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      license: {
        id: updatedLicense.id,
        licenseKey: newLicenseKey,
        deviceId: updatedLicense.deviceId,
        toolType: updatedLicense.toolType,
        type: updatedLicense.type,
        owner: updatedLicense.owner,
        expiresAt: newExpiresAt.toISOString(),
        daysRemaining: Math.ceil((newExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      },
      message: `License extended by ${days} day${days > 1 ? 's' : ''}`,
    });

  } catch (error) {
    console.error('Extend license error:', error);
    
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

