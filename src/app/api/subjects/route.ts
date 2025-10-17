import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subjects, classes, users } from '@/db/schema';
import { eq, like, and, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single subject by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const subject = await db
        .select()
        .from(subjects)
        .where(eq(subjects.id, parseInt(id)))
        .limit(1);

      if (subject.length === 0) {
        return NextResponse.json(
          { error: 'Subject not found', code: 'SUBJECT_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(subject[0], { status: 200 });
    }

    // List subjects with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');

    let query = db.select().from(subjects);

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(subjects.name, `%${search}%`),
          like(subjects.description, `%${search}%`)
        )
      );
    }

    if (classId) {
      const parsedClassId = parseInt(classId);
      if (!isNaN(parsedClassId)) {
        conditions.push(eq(subjects.classId, parsedClassId));
      }
    }

    if (teacherId) {
      const parsedTeacherId = parseInt(teacherId);
      if (!isNaN(parsedTeacherId)) {
        conditions.push(eq(subjects.teacherId, parsedTeacherId));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, classId, teacherId } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and cannot be empty', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    // Validate classId if provided
    if (classId !== undefined && classId !== null) {
      const parsedClassId = parseInt(classId);
      if (isNaN(parsedClassId)) {
        return NextResponse.json(
          { error: 'Invalid classId format', code: 'INVALID_CLASS_ID' },
          { status: 400 }
        );
      }

      const classExists = await db
        .select()
        .from(classes)
        .where(eq(classes.id, parsedClassId))
        .limit(1);

      if (classExists.length === 0) {
        return NextResponse.json(
          { error: 'Class not found', code: 'CLASS_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Validate teacherId if provided
    if (teacherId !== undefined && teacherId !== null) {
      const parsedTeacherId = parseInt(teacherId);
      if (isNaN(parsedTeacherId)) {
        return NextResponse.json(
          { error: 'Invalid teacherId format', code: 'INVALID_TEACHER_ID' },
          { status: 400 }
        );
      }

      const teacher = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, parsedTeacherId),
            eq(users.role, 'teacher')
          )
        )
        .limit(1);

      if (teacher.length === 0) {
        return NextResponse.json(
          { error: 'Teacher not found or user is not a teacher', code: 'INVALID_TEACHER' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData: any = {
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    if (description !== undefined && description !== null) {
      insertData.description = description.trim();
    }

    if (classId !== undefined && classId !== null) {
      insertData.classId = parseInt(classId);
    }

    if (teacherId !== undefined && teacherId !== null) {
      insertData.teacherId = parseInt(teacherId);
    }

    const newSubject = await db.insert(subjects).values(insertData).returning();

    return NextResponse.json(newSubject[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id);

    // Check if subject exists
    const existingSubject = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, parsedId))
      .limit(1);

    if (existingSubject.length === 0) {
      return NextResponse.json(
        { error: 'Subject not found', code: 'SUBJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, classId, teacherId } = body;

    const updates: any = {};

    // Validate and prepare name
    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json(
          { error: 'Name cannot be empty', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    // Validate and prepare description
    if (description !== undefined) {
      updates.description = description !== null ? description.trim() : null;
    }

    // Validate classId if provided
    if (classId !== undefined) {
      if (classId !== null) {
        const parsedClassId = parseInt(classId);
        if (isNaN(parsedClassId)) {
          return NextResponse.json(
            { error: 'Invalid classId format', code: 'INVALID_CLASS_ID' },
            { status: 400 }
          );
        }

        const classExists = await db
          .select()
          .from(classes)
          .where(eq(classes.id, parsedClassId))
          .limit(1);

        if (classExists.length === 0) {
          return NextResponse.json(
            { error: 'Class not found', code: 'CLASS_NOT_FOUND' },
            { status: 400 }
          );
        }

        updates.classId = parsedClassId;
      } else {
        updates.classId = null;
      }
    }

    // Validate teacherId if provided
    if (teacherId !== undefined) {
      if (teacherId !== null) {
        const parsedTeacherId = parseInt(teacherId);
        if (isNaN(parsedTeacherId)) {
          return NextResponse.json(
            { error: 'Invalid teacherId format', code: 'INVALID_TEACHER_ID' },
            { status: 400 }
          );
        }

        const teacher = await db
          .select()
          .from(users)
          .where(
            and(
              eq(users.id, parsedTeacherId),
              eq(users.role, 'teacher')
            )
          )
          .limit(1);

        if (teacher.length === 0) {
          return NextResponse.json(
            { error: 'Teacher not found or user is not a teacher', code: 'INVALID_TEACHER' },
            { status: 400 }
          );
        }

        updates.teacherId = parsedTeacherId;
      } else {
        updates.teacherId = null;
      }
    }

    const updated = await db
      .update(subjects)
      .set(updates)
      .where(eq(subjects.id, parsedId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id);

    // Check if subject exists
    const existingSubject = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, parsedId))
      .limit(1);

    if (existingSubject.length === 0) {
      return NextResponse.json(
        { error: 'Subject not found', code: 'SUBJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(subjects)
      .where(eq(subjects.id, parsedId))
      .returning();

    return NextResponse.json(
      {
        message: 'Subject deleted successfully',
        subject: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}