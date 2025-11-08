// app/api/admin/reseller/create/route.ts
// API endpoint để admin tạo reseller user
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { verifyAdmin } from '@/lib/auth';
import { z } from 'zod';

const CreateResellerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    // Check if admin has permission (only SUPER_ADMIN or ADMIN can create resellers)
    if (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Only admins can create reseller accounts',
      }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, name } = CreateResellerSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Email already exists',
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create reseller
    const reseller = await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name,
        role: 'RESELLER',
      },
    });

    // Log activity với description chi tiết
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'CREATE_RESELLER',
        details: JSON.stringify({
          description: `Admin ${admin.email} created reseller account - Email: ${reseller.email}, Name: ${reseller.name}, Reseller ID: ${reseller.id}`,
          resellerId: reseller.id,
          resellerEmail: reseller.email,
          resellerName: reseller.name,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      reseller: {
        id: reseller.id,
        email: reseller.email,
        name: reseller.name,
        role: reseller.role,
      },
      message: 'Reseller account created successfully',
    });

  } catch (error) {
    console.error('Create reseller error:', error);
    
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

