// app/api/admin/licenses/route.ts
// API để list tất cả licenses (with pagination & filters)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Verify admin
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
    const status = searchParams.get('status');
    const toolType = searchParams.get('toolType');
    const deviceId = searchParams.get('deviceId');
    const type = searchParams.get('type');
    const search = searchParams.get('search'); // General search term

    // Build base filters (excluding type for reseller logic)
    const baseFilters: any = {};
    if (status) baseFilters.status = status;
    if (toolType) baseFilters.toolType = toolType;
    if (deviceId) baseFilters.deviceId = { contains: deviceId };
    
    // Advanced search: search by device ID, owner, or license key
    const searchFilter: any = search ? {
      OR: [
        { deviceId: { contains: search } },
        { owner: { contains: search } },
        { licenseKey: { contains: search } },
      ]
    } : null;

    // Build where clause
    let where: any = {};
    
    // If user is RESELLER, only show licenses they created (KHÔNG bao gồm TRIAL)
    if (admin.role === 'RESELLER') {
      // Reseller CHỈ được xem license mà họ tạo (không bao gồm TRIAL licenses)
      where = {
        ...baseFilters,
        metadata: {
          contains: `"resellerEmail":"${admin.email}"`,
        }
      };
      
      // Reseller không được xem TRIAL licenses
      // Nếu type filter là TRIAL, trả về empty (reseller không có quyền xem TRIAL)
      if (type === 'TRIAL') {
        // Return empty result for reseller when filtering by TRIAL
        where = { id: 'never-match-this-id' }; // Force empty result
      } else if (type) {
        // If type filter is set and not TRIAL, filter by type
        where.type = type;
      }
      
      // Add search filter if exists
      if (searchFilter) {
        where = {
          AND: [
            where,
            searchFilter
          ]
        };
      }
    } else {
      // Admin sees all licenses
      where = { ...baseFilters };
      if (type) where.type = type;
      
      // Add search filter if exists
      if (searchFilter) {
        where = {
          AND: [
            where,
            searchFilter
          ]
        };
      }
    }

    // Get total count
    const total = await prisma.license.count({ where });

    // Get licenses
    const licenses = await prisma.license.findMany({
      where,
      include: {
        device: true,
      },
      orderBy: { issuedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: licenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('List licenses error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

