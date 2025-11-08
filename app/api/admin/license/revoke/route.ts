// app/api/admin/license/revoke/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { z } from 'zod';

const RevokeSchema = z.object({
  licenseId: z.string(),
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
    const { licenseId, reason } = RevokeSchema.parse(body);

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

    // If user is RESELLER, check if they created this license
    if (admin.role === 'RESELLER') {
      if (!license.metadata) {
        return NextResponse.json({
          success: false,
          error: 'You can only revoke licenses you created',
        }, { status: 403 });
      }

      try {
        const metadata = JSON.parse(license.metadata);
        if (metadata.resellerEmail !== admin.email) {
          return NextResponse.json({
            success: false,
            error: 'You can only revoke licenses you created',
          }, { status: 403 });
        }
      } catch (e) {
        return NextResponse.json({
          success: false,
          error: 'You can only revoke licenses you created',
        }, { status: 403 });
      }
    }

    // Revoke license
    await prisma.license.update({
      where: { id: licenseId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        metadata: JSON.stringify({
          ...(license.metadata ? JSON.parse(license.metadata) : {}),
          revokeReason: reason || 'Admin revoked',
          revokedBy: admin.email,
        }),
      },
    });

    // Log activity với description chi tiết
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'REVOKE_LICENSE',
        details: JSON.stringify({
          description: `${admin.role === 'RESELLER' ? 'Reseller' : 'Admin'} ${admin.email} revoked license ID: ${licenseId} for Device ID: ${license.deviceId}, Tool: ${license.toolType}, Type: ${license.type}, Reason: ${reason || 'No reason provided'}`,
          licenseId,
          deviceId: license.deviceId,
          toolType: license.toolType,
          type: license.type,
          reason: reason || 'No reason provided',
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'License revoked successfully',
    });

  } catch (error) {
    console.error('Revoke license error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

