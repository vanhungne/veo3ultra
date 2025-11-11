// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    // Build base filter - if reseller, only show their licenses (KHÔNG bao gồm TRIAL)
    let licenseFilter: any = {};
    if (admin.role === 'RESELLER') {
      // Reseller CHỈ được xem licenses mà họ tạo (không bao gồm TRIAL licenses)
      licenseFilter = {
        metadata: {
          contains: `"resellerEmail":"${admin.email}"`,
        }
      };
    }

    // Get stats
    const [
      totalLicenses,
      activeLicenses,
      expiredLicenses,
      totalDevices,
      recentActivities,
    ] = await Promise.all([
      prisma.license.count({ where: licenseFilter }),
      prisma.license.count({ where: { ...licenseFilter, status: 'ACTIVE' } }),
      prisma.license.count({ where: { ...licenseFilter, status: 'EXPIRED' } }),
      prisma.device.count(),
      // Only show activities for reseller if they are reseller
      admin.role === 'RESELLER'
        ? prisma.activityLog.findMany({
            where: { adminId: admin.id },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { admin: { select: { email: true, name: true } } },
          })
        : prisma.activityLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { admin: { select: { email: true, name: true } } },
          }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalLicenses,
        activeLicenses,
        expiredLicenses,
        totalDevices,
        recentActivities,
      },
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

