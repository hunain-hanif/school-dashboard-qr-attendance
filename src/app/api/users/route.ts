import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, or, like, and, sql } from 'drizzle-orm';

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to generate unique QR code
function generateQRCode(): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `QR-${timestamp}-${randomString}`;
}

// Helper function to validate role
function isValidRole(role: string): boolean {
  return ['principal', 'teacher', 'student'].includes(role);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clerkId = searchParams.get('clerkId');

    // Get single user by ID or clerkId
    if (id || clerkId) {
      let whereCondition;
      
      if (id) {
        if (isNaN(parseInt(id))) {
          return NextResponse.json({ 
            error: "Valid ID is required",
            code: "INVALID_ID" 
          }, { status: 400 });
        }
        whereCondition = eq(users.id, parseInt(id));
      } else if (clerkId) {
        whereCondition = eq(users.clerkId, clerkId);
      }

      const user = await db.select()
        .from(users)
        .where(whereCondition)
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json({ 
          error: 'User not found',
          code: 'USER_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(user[0], { status: 200 });
    }

    // List all users with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const roleFilter = searchParams.get('role');

    let query = db.select().from(users);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(users);

    const conditions = [];

    // Add search condition
    if (search) {
      const searchCondition = or(
        like(users.email, `%${search}%`),
        like(users.fullName, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    // Add role filter
    if (roleFilter) {
      if (!isValidRole(roleFilter)) {
        return NextResponse.json({ 
          error: "Invalid role. Must be 'principal', 'teacher', or 'student'",
          code: "INVALID_ROLE" 
        }, { status: 400 });
      }
      conditions.push(eq(users.role, roleFilter));
    }

    // Apply conditions if any exist
    if (conditions.length > 0) {
      const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }

    // Execute queries
    const results = await query.limit(limit).offset(offset);
    const totalCountResult = await countQuery;
    const totalCount = totalCountResult[0]?.count || 0;

    return NextResponse.json({
      data: results,
      pagination: {
        limit,
        offset,
        total: totalCount
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, role, clerkId, qrCode } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_EMAIL" 
      }, { status: 400 });
    }

    if (!fullName || fullName.trim() === '') {
      return NextResponse.json({ 
        error: "Full name is required and cannot be empty",
        code: "MISSING_FULL_NAME" 
      }, { status: 400 });
    }

    if (!role) {
      return NextResponse.json({ 
        error: "Role is required",
        code: "MISSING_ROLE" 
      }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL_FORMAT" 
      }, { status: 400 });
    }

    // Validate role
    if (!isValidRole(role)) {
      return NextResponse.json({ 
        error: "Invalid role. Must be 'principal', 'teacher', or 'student'",
        code: "INVALID_ROLE" 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingUserByEmail = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingUserByEmail.length > 0) {
      return NextResponse.json({ 
        error: "Email already exists",
        code: "EMAIL_EXISTS" 
      }, { status: 400 });
    }

    // Check if clerkId already exists (if provided)
    if (clerkId) {
      const existingUserByClerkId = await db.select()
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

      if (existingUserByClerkId.length > 0) {
        return NextResponse.json({ 
          error: "Clerk ID already exists",
          code: "CLERK_ID_EXISTS" 
        }, { status: 400 });
      }
    }

    // Generate QR code for students if not provided
    let finalQRCode = qrCode;
    if (role === 'student' && !qrCode) {
      finalQRCode = generateQRCode();
      
      // Ensure QR code is unique
      let isUnique = false;
      while (!isUnique) {
        const existingQR = await db.select()
          .from(users)
          .where(eq(users.qrCode, finalQRCode))
          .limit(1);
        
        if (existingQR.length === 0) {
          isUnique = true;
        } else {
          finalQRCode = generateQRCode();
        }
      }
    }

    // Check if provided QR code already exists
    if (qrCode) {
      const existingQR = await db.select()
        .from(users)
        .where(eq(users.qrCode, qrCode))
        .limit(1);

      if (existingQR.length > 0) {
        return NextResponse.json({ 
          error: "QR code already exists",
          code: "QR_CODE_EXISTS" 
        }, { status: 400 });
      }
    }

    // Create new user
    const newUser = await db.insert(users)
      .values({
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        role,
        clerkId: clerkId || null,
        qrCode: finalQRCode || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { email, fullName, role, clerkId, qrCode } = body;

    const updates: any = {};

    // Validate and add email to updates
    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL_FORMAT" 
        }, { status: 400 });
      }

      // Check if email already exists for another user
      const existingUserByEmail = await db.select()
        .from(users)
        .where(and(
          eq(users.email, email.toLowerCase().trim()),
          sql`${users.id} != ${parseInt(id)}`
        ))
        .limit(1);

      if (existingUserByEmail.length > 0) {
        return NextResponse.json({ 
          error: "Email already exists",
          code: "EMAIL_EXISTS" 
        }, { status: 400 });
      }

      updates.email = email.toLowerCase().trim();
    }

    // Validate and add fullName to updates
    if (fullName !== undefined) {
      if (!fullName || fullName.trim() === '') {
        return NextResponse.json({ 
          error: "Full name cannot be empty",
          code: "INVALID_FULL_NAME" 
        }, { status: 400 });
      }
      updates.fullName = fullName.trim();
    }

    // Validate and add role to updates
    if (role !== undefined) {
      if (!isValidRole(role)) {
        return NextResponse.json({ 
          error: "Invalid role. Must be 'principal', 'teacher', or 'student'",
          code: "INVALID_ROLE" 
        }, { status: 400 });
      }
      updates.role = role;
    }

    // Validate and add clerkId to updates
    if (clerkId !== undefined) {
      if (clerkId !== null) {
        // Check if clerkId already exists for another user
        const existingUserByClerkId = await db.select()
          .from(users)
          .where(and(
            eq(users.clerkId, clerkId),
            sql`${users.id} != ${parseInt(id)}`
          ))
          .limit(1);

        if (existingUserByClerkId.length > 0) {
          return NextResponse.json({ 
            error: "Clerk ID already exists",
            code: "CLERK_ID_EXISTS" 
          }, { status: 400 });
        }
      }
      updates.clerkId = clerkId;
    }

    // Validate and add qrCode to updates
    if (qrCode !== undefined) {
      if (qrCode !== null) {
        // Check if qrCode already exists for another user
        const existingQR = await db.select()
          .from(users)
          .where(and(
            eq(users.qrCode, qrCode),
            sql`${users.id} != ${parseInt(id)}`
          ))
          .limit(1);

        if (existingQR.length > 0) {
          return NextResponse.json({ 
            error: "QR code already exists",
            code: "QR_CODE_EXISTS" 
          }, { status: 400 });
        }
      }
      updates.qrCode = qrCode;
    }

    // Update user
    const updated = await db.update(users)
      .set(updates)
      .where(eq(users.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete user
    const deleted = await db.delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'User deleted successfully',
      user: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}