import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { classes, users } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single class by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const classRecord = await db.select({
        id: classes.id,
        name: classes.name,
        gradeLevel: classes.gradeLevel,
        teacherId: classes.teacherId,
        createdAt: classes.createdAt,
        teacher: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          role: users.role
        }
      })
        .from(classes)
        .leftJoin(users, eq(classes.teacherId, users.id))
        .where(eq(classes.id, parseInt(id)))
        .limit(1);

      if (classRecord.length === 0) {
        return NextResponse.json({ 
          error: 'Class not found',
          code: "CLASS_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(classRecord[0], { status: 200 });
    }

    // List classes with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const gradeLevel = searchParams.get('gradeLevel');
    const teacherId = searchParams.get('teacherId');

    let whereConditions = [];

    // Search filter
    if (search) {
      whereConditions.push(like(classes.name, `%${search}%`));
    }

    // Grade level filter
    if (gradeLevel && !isNaN(parseInt(gradeLevel))) {
      whereConditions.push(eq(classes.gradeLevel, parseInt(gradeLevel)));
    }

    // Teacher ID filter
    if (teacherId && !isNaN(parseInt(teacherId))) {
      whereConditions.push(eq(classes.teacherId, parseInt(teacherId)));
    }

    let query = db.select({
      id: classes.id,
      name: classes.name,
      gradeLevel: classes.gradeLevel,
      teacherId: classes.teacherId,
      createdAt: classes.createdAt,
      teacher: {
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role
      }
    })
      .from(classes)
      .leftJoin(users, eq(classes.teacherId, users.id))
      .orderBy(desc(classes.createdAt))
      .limit(limit)
      .offset(offset);

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }

    const results = await query;

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, gradeLevel, teacherId } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: "Name is required and cannot be empty",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!gradeLevel) {
      return NextResponse.json({ 
        error: "Grade level is required",
        code: "MISSING_GRADE_LEVEL" 
      }, { status: 400 });
    }

    // Validate grade level
    const gradeLevelInt = parseInt(gradeLevel);
    if (isNaN(gradeLevelInt) || gradeLevelInt < 1 || gradeLevelInt > 12) {
      return NextResponse.json({ 
        error: "Grade level must be a positive integer between 1 and 12",
        code: "INVALID_GRADE_LEVEL" 
      }, { status: 400 });
    }

    // Validate teacher ID if provided
    if (teacherId) {
      const teacherIdInt = parseInt(teacherId);
      if (isNaN(teacherIdInt)) {
        return NextResponse.json({ 
          error: "Teacher ID must be a valid integer",
          code: "INVALID_TEACHER_ID" 
        }, { status: 400 });
      }

      // Check if teacher exists and has role 'teacher'
      const teacher = await db.select()
        .from(users)
        .where(and(
          eq(users.id, teacherIdInt),
          eq(users.role, 'teacher')
        ))
        .limit(1);

      if (teacher.length === 0) {
        return NextResponse.json({ 
          error: "Teacher not found or user is not a teacher",
          code: "INVALID_TEACHER" 
        }, { status: 400 });
      }
    }

    // Create new class
    const newClass = await db.insert(classes)
      .values({
        name: name.trim(),
        gradeLevel: gradeLevelInt,
        teacherId: teacherId ? parseInt(teacherId) : null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newClass[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if class exists
    const existingClass = await db.select()
      .from(classes)
      .where(eq(classes.id, parseInt(id)))
      .limit(1);

    if (existingClass.length === 0) {
      return NextResponse.json({ 
        error: 'Class not found',
        code: "CLASS_NOT_FOUND" 
      }, { status: 404 });
    }

    const body = await request.json();
    const { name, gradeLevel, teacherId } = body;

    const updates: any = {};

    // Validate and add name if provided
    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json({ 
          error: "Name cannot be empty",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    // Validate and add grade level if provided
    if (gradeLevel !== undefined) {
      const gradeLevelInt = parseInt(gradeLevel);
      if (isNaN(gradeLevelInt) || gradeLevelInt < 1 || gradeLevelInt > 12) {
        return NextResponse.json({ 
          error: "Grade level must be a positive integer between 1 and 12",
          code: "INVALID_GRADE_LEVEL" 
        }, { status: 400 });
      }
      updates.gradeLevel = gradeLevelInt;
    }

    // Validate and add teacher ID if provided
    if (teacherId !== undefined) {
      if (teacherId === null) {
        updates.teacherId = null;
      } else {
        const teacherIdInt = parseInt(teacherId);
        if (isNaN(teacherIdInt)) {
          return NextResponse.json({ 
            error: "Teacher ID must be a valid integer",
            code: "INVALID_TEACHER_ID" 
          }, { status: 400 });
        }

        // Check if teacher exists and has role 'teacher'
        const teacher = await db.select()
          .from(users)
          .where(and(
            eq(users.id, teacherIdInt),
            eq(users.role, 'teacher')
          ))
          .limit(1);

        if (teacher.length === 0) {
          return NextResponse.json({ 
            error: "Teacher not found or user is not a teacher",
            code: "INVALID_TEACHER" 
          }, { status: 400 });
        }

        updates.teacherId = teacherIdInt;
      }
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATES" 
      }, { status: 400 });
    }

    // Update class
    const updatedClass = await db.update(classes)
      .set(updates)
      .where(eq(classes.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedClass[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if class exists
    const existingClass = await db.select()
      .from(classes)
      .where(eq(classes.id, parseInt(id)))
      .limit(1);

    if (existingClass.length === 0) {
      return NextResponse.json({ 
        error: 'Class not found',
        code: "CLASS_NOT_FOUND" 
      }, { status: 404 });
    }

    // Delete class
    const deletedClass = await db.delete(classes)
      .where(eq(classes.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Class deleted successfully',
      deletedClass: deletedClass[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}