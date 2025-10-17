import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { studentClasses, users, classes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');

    // Single enrollment by ID
    if (id) {
      const enrollmentId = parseInt(id);
      if (isNaN(enrollmentId)) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const enrollment = await db
        .select({
          id: studentClasses.id,
          studentId: studentClasses.studentId,
          classId: studentClasses.classId,
          enrolledAt: studentClasses.enrolledAt,
          studentName: users.fullName,
          studentEmail: users.email,
          className: classes.name,
          gradeLevel: classes.gradeLevel,
        })
        .from(studentClasses)
        .leftJoin(users, eq(studentClasses.studentId, users.id))
        .leftJoin(classes, eq(studentClasses.classId, classes.id))
        .where(eq(studentClasses.id, enrollmentId))
        .limit(1);

      if (enrollment.length === 0) {
        return NextResponse.json(
          { error: 'Enrollment not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(enrollment[0], { status: 200 });
    }

    // List enrollments with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db
      .select({
        id: studentClasses.id,
        studentId: studentClasses.studentId,
        classId: studentClasses.classId,
        enrolledAt: studentClasses.enrolledAt,
        studentName: users.fullName,
        studentEmail: users.email,
        className: classes.name,
        gradeLevel: classes.gradeLevel,
      })
      .from(studentClasses)
      .leftJoin(users, eq(studentClasses.studentId, users.id))
      .leftJoin(classes, eq(studentClasses.classId, classes.id));

    // Apply filters
    const conditions = [];
    if (studentId) {
      const studentIdNum = parseInt(studentId);
      if (!isNaN(studentIdNum)) {
        conditions.push(eq(studentClasses.studentId, studentIdNum));
      }
    }
    if (classId) {
      const classIdNum = parseInt(classId);
      if (!isNaN(classIdNum)) {
        conditions.push(eq(studentClasses.classId, classIdNum));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const enrollments = await query.limit(limit).offset(offset);

    return NextResponse.json(enrollments, { status: 200 });
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
    const { studentId, classId } = body;

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

    // Validate studentId is a number
    const studentIdNum = parseInt(studentId);
    if (isNaN(studentIdNum)) {
      return NextResponse.json(
        { error: 'studentId must be a valid number', code: 'INVALID_STUDENT_ID' },
        { status: 400 }
      );
    }

    // Validate classId is a number
    const classIdNum = parseInt(classId);
    if (isNaN(classIdNum)) {
      return NextResponse.json(
        { error: 'classId must be a valid number', code: 'INVALID_CLASS_ID' },
        { status: 400 }
      );
    }

    // Check if student exists and has role 'student'
    const student = await db
      .select()
      .from(users)
      .where(eq(users.id, studentIdNum))
      .limit(1);

    if (student.length === 0) {
      return NextResponse.json(
        { error: 'Student not found', code: 'STUDENT_NOT_FOUND' },
        { status: 400 }
      );
    }

    if (student[0].role !== 'student') {
      return NextResponse.json(
        { error: 'User must have role "student"', code: 'INVALID_STUDENT_ROLE' },
        { status: 400 }
      );
    }

    // Check if class exists
    const classRecord = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classIdNum))
      .limit(1);

    if (classRecord.length === 0) {
      return NextResponse.json(
        { error: 'Class not found', code: 'CLASS_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Check for duplicate enrollment
    const existingEnrollment = await db
      .select()
      .from(studentClasses)
      .where(
        and(
          eq(studentClasses.studentId, studentIdNum),
          eq(studentClasses.classId, classIdNum)
        )
      )
      .limit(1);

    if (existingEnrollment.length > 0) {
      return NextResponse.json(
        {
          error: 'Student is already enrolled in this class',
          code: 'DUPLICATE_ENROLLMENT',
        },
        { status: 400 }
      );
    }

    // Create enrollment
    const newEnrollment = await db
      .insert(studentClasses)
      .values({
        studentId: studentIdNum,
        classId: classIdNum,
        enrolledAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newEnrollment[0], { status: 201 });
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

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    const enrollmentId = parseInt(id);
    if (isNaN(enrollmentId)) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if enrollment exists
    const existingEnrollment = await db
      .select()
      .from(studentClasses)
      .where(eq(studentClasses.id, enrollmentId))
      .limit(1);

    if (existingEnrollment.length === 0) {
      return NextResponse.json(
        { error: 'Enrollment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { studentId, classId } = body;

    const updates: any = {};

    // Validate and update studentId if provided
    if (studentId !== undefined) {
      const studentIdNum = parseInt(studentId);
      if (isNaN(studentIdNum)) {
        return NextResponse.json(
          { error: 'studentId must be a valid number', code: 'INVALID_STUDENT_ID' },
          { status: 400 }
        );
      }

      // Check if student exists and has role 'student'
      const student = await db
        .select()
        .from(users)
        .where(eq(users.id, studentIdNum))
        .limit(1);

      if (student.length === 0) {
        return NextResponse.json(
          { error: 'Student not found', code: 'STUDENT_NOT_FOUND' },
          { status: 400 }
        );
      }

      if (student[0].role !== 'student') {
        return NextResponse.json(
          { error: 'User must have role "student"', code: 'INVALID_STUDENT_ROLE' },
          { status: 400 }
        );
      }

      updates.studentId = studentIdNum;
    }

    // Validate and update classId if provided
    if (classId !== undefined) {
      const classIdNum = parseInt(classId);
      if (isNaN(classIdNum)) {
        return NextResponse.json(
          { error: 'classId must be a valid number', code: 'INVALID_CLASS_ID' },
          { status: 400 }
        );
      }

      // Check if class exists
      const classRecord = await db
        .select()
        .from(classes)
        .where(eq(classes.id, classIdNum))
        .limit(1);

      if (classRecord.length === 0) {
        return NextResponse.json(
          { error: 'Class not found', code: 'CLASS_NOT_FOUND' },
          { status: 400 }
        );
      }

      updates.classId = classIdNum;
    }

    // Check for duplicate enrollment if updating studentId or classId
    if (updates.studentId || updates.classId) {
      const checkStudentId = updates.studentId || existingEnrollment[0].studentId;
      const checkClassId = updates.classId || existingEnrollment[0].classId;

      const duplicateCheck = await db
        .select()
        .from(studentClasses)
        .where(
          and(
            eq(studentClasses.studentId, checkStudentId),
            eq(studentClasses.classId, checkClassId)
          )
        )
        .limit(1);

      if (duplicateCheck.length > 0 && duplicateCheck[0].id !== enrollmentId) {
        return NextResponse.json(
          {
            error: 'Student is already enrolled in this class',
            code: 'DUPLICATE_ENROLLMENT',
          },
          { status: 400 }
        );
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    // Update enrollment
    const updatedEnrollment = await db
      .update(studentClasses)
      .set(updates)
      .where(eq(studentClasses.id, enrollmentId))
      .returning();

    return NextResponse.json(updatedEnrollment[0], { status: 200 });
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

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    const enrollmentId = parseInt(id);
    if (isNaN(enrollmentId)) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if enrollment exists
    const existingEnrollment = await db
      .select()
      .from(studentClasses)
      .where(eq(studentClasses.id, enrollmentId))
      .limit(1);

    if (existingEnrollment.length === 0) {
      return NextResponse.json(
        { error: 'Enrollment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete enrollment
    const deleted = await db
      .delete(studentClasses)
      .where(eq(studentClasses.id, enrollmentId))
      .returning();

    return NextResponse.json(
      {
        message: 'Enrollment deleted successfully',
        enrollment: deleted[0],
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