// app/api/admin/devices/route.ts
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const deviceId = searchParams.get('deviceId');

    const where: any = {};
    if (deviceId) {
      where.deviceId = { contains: deviceId };
    }

    // If user is RESELLER, only show devices that have licenses created by this reseller
    if (admin.role === 'RESELLER') {
      // Get device IDs that have licenses created by this reseller
      const resellerLicenses = await prisma.license.findMany({
        where: {
          metadata: {
            contains: `"resellerEmail":"${admin.email}"`,
          },
        },
        select: {
          deviceId: true,
        },
        distinct: ['deviceId'],
      });

      const resellerDeviceIds = resellerLicenses.map(l => l.deviceId);
      
      // Filter devices to only show devices that have licenses created by this reseller
      if (resellerDeviceIds.length > 0) {
        where.deviceId = {
          in: resellerDeviceIds,
          ...(deviceId ? { contains: deviceId } : {}),
        };
      } else {
        // If reseller has no licenses, return empty result
        where.deviceId = 'never-match-this-id';
      }
    }

    const total = await prisma.device.count({ where });

    const devices = await prisma.device.findMany({
      where,
      include: {
        _count: {
          select: { licenses: true },
        },
      },
      orderBy: { lastSeen: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: devices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('List devices error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

