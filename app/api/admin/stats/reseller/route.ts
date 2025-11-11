// app/api/admin/stats/reseller/route.ts
// API endpoint để lấy statistics cho reseller
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

    // Check if user is reseller
    if (admin.role !== 'RESELLER') {
      return NextResponse.json({
        success: false,
        error: 'Only resellers can access this endpoint',
      }, { status: 403 });
    }

    // Build filter for reseller's licenses (excluding trial)
    const resellerFilter = {
      metadata: {
        contains: `"resellerEmail":"${admin.email}"`,
      }
    };

    // Get statistics
    const [
      totalLicenses,
      activeLicenses,
      expiredLicenses,
      revokedLicenses,
      licensesByPackage,
      licensesByTool,
    ] = await Promise.all([
      // Total licenses created by reseller
      prisma.license.count({ where: resellerFilter }),
      // Active licenses
      prisma.license.count({ where: { ...resellerFilter, status: 'ACTIVE' } }),
      // Expired licenses
      prisma.license.count({ where: { ...resellerFilter, status: 'EXPIRED' } }),
      // Revoked licenses
      prisma.license.count({ where: { ...resellerFilter, status: 'REVOKED' } }),
      // Licenses by package
      prisma.license.groupBy({
        by: ['metadata'],
        where: resellerFilter,
        _count: true,
      }),
      // Licenses by tool type
      prisma.license.groupBy({
        by: ['toolType'],
        where: resellerFilter,
        _count: true,
      }),
    ]);

    // Parse package counts from metadata
    const packageCounts: Record<string, number> = {};
    licensesByPackage.forEach(item => {
      if (item.metadata) {
        try {
          const meta = JSON.parse(item.metadata);
          const pkg = meta.package || 'UNKNOWN';
          packageCounts[pkg] = (packageCounts[pkg] || 0) + item._count;
        } catch (e) {
          // Ignore
        }
      }
    });

    // Tool type counts
    const toolCounts: Record<string, number> = {};
    licensesByTool.forEach(item => {
      toolCounts[item.toolType] = item._count;
    });

    return NextResponse.json({
      success: true,
      data: {
        totalLicenses,
        activeLicenses,
        expiredLicenses,
        revokedLicenses,
        packageCounts,
        toolCounts,
      },
    });

  } catch (error) {
    console.error('Reseller stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}









