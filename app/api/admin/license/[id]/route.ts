// app/api/admin/license/[id]/route.ts
// API endpoint để lấy chi tiết license
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    const licenseId = params.id;

    // Get license with device info
    const license = await prisma.license.findUnique({
      where: { id: licenseId },
      include: {
        device: true,
      },
    });

    if (!license) {
      return NextResponse.json({
        success: false,
        error: 'License not found',
      }, { status: 404 });
    }

    // Check if reseller can view this license
    if (admin.role === 'RESELLER') {
      // Reseller can view trial licenses OR licenses they created
      if (license.type !== 'TRIAL') {
        if (!license.metadata) {
          return NextResponse.json({
            success: false,
            error: 'Access denied',
          }, { status: 403 });
        }
        try {
          const metadata = JSON.parse(license.metadata);
          if (metadata.resellerEmail !== admin.email) {
            return NextResponse.json({
              success: false,
              error: 'Access denied',
            }, { status: 403 });
          }
        } catch (e) {
          return NextResponse.json({
            success: false,
            error: 'Access denied',
          }, { status: 403 });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: license,
    });

  } catch (error) {
    console.error('Get license details error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}






