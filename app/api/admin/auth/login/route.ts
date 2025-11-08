// app/api/admin/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = LoginSchema.parse(body);

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 });
    }

    // Verify password
    const isValid = await comparePassword(password, admin.password);
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 });
    }

    // Generate token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
      }, { status: 400 });
    }

    // Check if it's a database connection error
    if (error?.code === 'P1001' || error?.message?.includes('Can\'t reach database')) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed. Please check SQL Server is running and DATABASE_URL in .env is correct.',
        details: 'See DATABASE_SETUP.md for instructions',
      }, { status: 503 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }, { status: 500 });
  }
}

