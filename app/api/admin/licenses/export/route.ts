// app/api/admin/licenses/export/route.ts
// API endpoint để export licenses (CSV format)
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
    const status = searchParams.get('status');
    const toolType = searchParams.get('toolType');
    const type = searchParams.get('type');

    // Build filter
    const baseFilters: any = {};
    if (status) baseFilters.status = status;
    if (toolType) baseFilters.toolType = toolType;

    // Build where clause
    let where: any = {};
    
    // If user is RESELLER, only show licenses they created (KHÔNG bao gồm TRIAL)
    if (admin.role === 'RESELLER') {
      // Reseller CHỈ được export license mà họ tạo (không bao gồm TRIAL licenses)
      // Nếu type filter là TRIAL, trả về empty (reseller không có quyền export TRIAL)
      if (type === 'TRIAL') {
        // Return empty result for reseller when filtering by TRIAL
        where = { id: 'never-match-this-id' }; // Force empty result
      } else {
        where = {
          ...baseFilters,
          metadata: {
            contains: `"resellerEmail":"${admin.email}"`,
          }
        };
        
        // If type filter is set and not TRIAL, filter by type
        if (type) {
          where.type = type;
        }
      }
    } else {
      // Admin sees all licenses
      where = { ...baseFilters };
      if (type) where.type = type;
    }

    // Get all licenses (no pagination for export)
    const licenses = await prisma.license.findMany({
      where,
      include: {
        device: true,
      },
      orderBy: { issuedAt: 'desc' },
    });

    // Generate CSV
    const csvHeader = 'License ID,Device ID,Hostname,License Key,Tool Type,Type,Status,Owner,Issued At,Expires At,Last Used\n';
    const csvRows = licenses.map(license => {
      const escapeCSV = (str: any) => {
        if (str === null || str === undefined) return '';
        const s = String(str);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      return [
        license.id,
        license.deviceId,
        license.device?.hostname || '',
        license.licenseKey,
        license.toolType,
        license.type,
        license.status,
        license.owner || '',
        license.issuedAt.toISOString().split('T')[0],
        license.expiresAt.toISOString().split('T')[0],
        license.lastUsed ? license.lastUsed.toISOString().split('T')[0] : '',
      ].map(escapeCSV).join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="licenses_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export licenses error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}









