import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { attendance, users, classes } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(attendance)
        .where(eq(attendance.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Attendance record not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and filters
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '100'),
      500
    );
    const offset = parseInt(searchParams.get('offset') || '0');
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = db.select().from(attendance);

    // Build filter conditions
    const conditions = [];

    if (studentId) {
      if (isNaN(parseInt(studentId))) {
        return NextResponse.json(
          { error: 'Valid studentId is required', code: 'INVALID_STUDENT_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(attendance.studentId, parseInt(studentId)));
    }

    if (classId) {
      if (isNaN(parseInt(classId))) {
        return NextResponse.json(
          { error: 'Valid classId is required', code: 'INVALID_CLASS_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(attendance.classId, parseInt(classId)));
    }

    if (date) {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return NextResponse.json(
          {
            error: 'Date must be in ISO format (YYYY-MM-DD)',
            code: 'INVALID_DATE_FORMAT',
          },
          { status: 400 }
        );
      }
      conditions.push(eq(attendance.date, date));
    }

    if (status) {
      const validStatuses = ['present', 'absent', 'late'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: 'Status must be one of: present, absent, late',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
      conditions.push(eq(attendance.status, status));
    }

    if (startDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate)) {
        return NextResponse.json(
          {
            error: 'startDate must be in ISO format (YYYY-MM-DD)',
            code: 'INVALID_START_DATE_FORMAT',
          },
          { status: 400 }
        );
      }
      conditions.push(gte(attendance.date, startDate));
    }

    if (endDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(endDate)) {
        return NextResponse.json(
          {
            error: 'endDate must be in ISO format (YYYY-MM-DD)',
            code: 'INVALID_END_DATE_FORMAT',
          },
          { status: 400 }
        );
      }
      conditions.push(lte(attendance.date, endDate));
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
    const { studentId, classId, date, status, markedBy } = body;

    // Validate required fields
    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required', code: 'MISSING_STUDENT_ID' },
        { status: 400 }
      );
    }

    if (!classId) {
      return NextResponse.json(
        { error: 'classId is required', code: 'MISSING_CLASS_ID' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'status is required', code: 'MISSING_STATUS' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        {
          error: 'date must be in ISO format (YYYY-MM-DD)',
          code: 'INVALID_DATE_FORMAT',
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['present', 'absent', 'late'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: 'status must be one of: present, absent, late',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Validate studentId exists and is a student
    const student = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(studentId)))
      .limit(1);

    if (student.length === 0) {
      return NextResponse.json(
        { error: 'Student not found', code: 'STUDENT_NOT_FOUND' },
        { status: 400 }
      );
    }

    if (student[0].role !== 'student') {
      return NextResponse.json(
        { error: 'User must have role student', code: 'INVALID_STUDENT_ROLE' },
        { status: 400 }
      );
    }

    // Validate classId exists
    const classRecord = await db
      .select()
      .from(classes)
      .where(eq(classes.id, parseInt(classId)))
      .limit(1);

    if (classRecord.length === 0) {
      return NextResponse.json(
        { error: 'Class not found', code: 'CLASS_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Validate markedBy if provided
    if (markedBy) {
      const teacher = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(markedBy)))
        .limit(1);

      if (teacher.length === 0) {
        return NextResponse.json(
          { error: 'Teacher not found', code: 'TEACHER_NOT_FOUND' },
          { status: 400 }
        );
      }

      if (teacher[0].role !== 'teacher') {
        return NextResponse.json(
          {
            error: 'markedBy user must have role teacher',
            code: 'INVALID_TEACHER_ROLE',
          },
          { status: 400 }
        );
      }
    }

    // Check for duplicate attendance record
    const existingAttendance = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.studentId, parseInt(studentId)),
          eq(attendance.classId, parseInt(classId)),
          eq(attendance.date, date)
        )
      )
      .limit(1);

    if (existingAttendance.length > 0) {
      return NextResponse.json(
        {
          error:
            'Attendance record already exists for this student, class, and date',
          code: 'DUPLICATE_ATTENDANCE',
        },
        { status: 400 }
      );
    }

    // Create attendance record
    const newAttendance = await db
      .insert(attendance)
      .values({
        studentId: parseInt(studentId),
        classId: parseInt(classId),
        date: date,
        status: status,
        markedBy: markedBy ? parseInt(markedBy) : null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newAttendance[0], { status: 201 });
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

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(attendance)
      .where(eq(attendance.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Attendance record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, markedBy } = body;

    // Validate status if provided
    if (status) {
      const validStatuses = ['present', 'absent', 'late'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: 'status must be one of: present, absent, late',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
    }

    // Validate markedBy if provided
    if (markedBy !== undefined && markedBy !== null) {
      const teacher = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(markedBy)))
        .limit(1);

      if (teacher.length === 0) {
        return NextResponse.json(
          { error: 'Teacher not found', code: 'TEACHER_NOT_FOUND' },
          { status: 400 }
        );
      }

      if (teacher[0].role !== 'teacher') {
        return NextResponse.json(
          {
            error: 'markedBy user must have role teacher',
            code: 'INVALID_TEACHER_ROLE',
          },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updates: any = {};
    if (status) updates.status = status;
    if (markedBy !== undefined) {
      updates.markedBy = markedBy !== null ? parseInt(markedBy) : null;
    }

    // Update the record
    const updated = await db
      .update(attendance)
      .set(updates)
      .where(eq(attendance.id, parseInt(id)))
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

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(attendance)
      .where(eq(attendance.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Attendance record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the record
    const deleted = await db
      .delete(attendance)
      .where(eq(attendance.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Attendance record deleted successfully',
        deleted: deleted[0],
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