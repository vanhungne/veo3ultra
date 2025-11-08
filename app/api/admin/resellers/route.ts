// app/api/admin/resellers/route.ts
// API endpoint để list resellers
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    // Check if admin has permission
    if (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Only admins can view resellers',
      }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Get resellers
    const [resellers, total] = await Promise.all([
      prisma.admin.findMany({
        where: {
          role: 'RESELLER',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              activities: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.admin.count({
        where: {
          role: 'RESELLER',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: resellers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('List resellers error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

