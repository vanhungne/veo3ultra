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
    
    // If user is RESELLER, only show licenses they created
    // BUT: Trial licenses are visible to everyone (managed separately)
    if (admin.role === 'RESELLER') {
      // Build OR conditions: Trial licenses OR reseller's licenses
      const orConditions: any[] = [
        { type: 'TRIAL' }, // Trial licenses - everyone can see
        { 
          metadata: {
            contains: `"resellerEmail":"${admin.email}"`,
          }
        }
      ];

      // If type filter is set and not TRIAL, only show reseller's licenses with that type
      if (type && type !== 'TRIAL') {
        where = {
          ...baseFilters,
          type: type,
          metadata: {
            contains: `"resellerEmail":"${admin.email}"`,
          }
        };
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
        // Show trial licenses OR reseller's licenses, with base filters
        const andConditions: any[] = [
          {
            OR: orConditions
          }
        ];
        
        // Add base filters
        Object.keys(baseFilters).forEach(key => {
          andConditions.push({ [key]: baseFilters[key] });
        });
        
        // Add search filter if exists
        if (searchFilter) {
          andConditions.push(searchFilter);
        }
        
        where = {
          AND: andConditions
        };
        
        // If type filter is set to TRIAL, add it
        if (type === 'TRIAL') {
          where.AND.push({ type: 'TRIAL' });
        }
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

