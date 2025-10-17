import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { assignments, subjects, users } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single assignment by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const assignment = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, parseInt(id)))
        .limit(1);

      if (assignment.length === 0) {
        return NextResponse.json(
          { error: 'Assignment not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(assignment[0], { status: 200 });
    }

    // List assignments with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const subjectId = searchParams.get('subjectId');
    const teacherId = searchParams.get('teacherId');

    let query = db.select().from(assignments);

    // Build conditions array
    const conditions = [];

    // Search condition
    if (search) {
      conditions.push(
        or(
          like(assignments.title, `%${search}%`),
          like(assignments.description, `%${search}%`)
        )
      );
    }

    // Filter by subjectId
    if (subjectId) {
      if (isNaN(parseInt(subjectId))) {
        return NextResponse.json(
          { error: 'Valid subject ID is required', code: 'INVALID_SUBJECT_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(assignments.subjectId, parseInt(subjectId)));
    }

    // Filter by teacherId
    if (teacherId) {
      if (isNaN(parseInt(teacherId))) {
        return NextResponse.json(
          { error: 'Valid teacher ID is required', code: 'INVALID_TEACHER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(assignments.teacherId, parseInt(teacherId)));
    }

    // Apply conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(assignments.createdAt))
      .limit(limit)
      .offset(offset);

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
    const { title, description, subjectId, teacherId, dueDate, totalPoints } = body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required and cannot be empty', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!dueDate) {
      return NextResponse.json(
        { error: 'Due date is required', code: 'MISSING_DUE_DATE' },
        { status: 400 }
      );
    }

    if (totalPoints === undefined || totalPoints === null) {
      return NextResponse.json(
        { error: 'Total points is required', code: 'MISSING_TOTAL_POINTS' },
        { status: 400 }
      );
    }

    // Validate dueDate is a valid ISO timestamp
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Due date must be a valid ISO timestamp', code: 'INVALID_DUE_DATE' },
        { status: 400 }
      );
    }

    // Validate totalPoints is a positive integer
    if (!Number.isInteger(totalPoints) || totalPoints <= 0) {
      return NextResponse.json(
        { error: 'Total points must be a positive integer', code: 'INVALID_TOTAL_POINTS' },
        { status: 400 }
      );
    }

    // Validate subjectId exists if provided
    if (subjectId !== undefined && subjectId !== null) {
      if (!Number.isInteger(subjectId)) {
        return NextResponse.json(
          { error: 'Subject ID must be an integer', code: 'INVALID_SUBJECT_ID' },
          { status: 400 }
        );
      }

      const subject = await db
        .select()
        .from(subjects)
        .where(eq(subjects.id, subjectId))
        .limit(1);

      if (subject.length === 0) {
        return NextResponse.json(
          { error: 'Subject not found', code: 'SUBJECT_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Validate teacherId exists and has role='teacher' if provided
    if (teacherId !== undefined && teacherId !== null) {
      if (!Number.isInteger(teacherId)) {
        return NextResponse.json(
          { error: 'Teacher ID must be an integer', code: 'INVALID_TEACHER_ID' },
          { status: 400 }
        );
      }

      const teacher = await db
        .select()
        .from(users)
        .where(eq(users.id, teacherId))
        .limit(1);

      if (teacher.length === 0) {
        return NextResponse.json(
          { error: 'Teacher not found', code: 'TEACHER_NOT_FOUND' },
          { status: 400 }
        );
      }

      if (teacher[0].role !== 'teacher') {
        return NextResponse.json(
          { error: 'User must have teacher role', code: 'INVALID_TEACHER_ROLE' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData: any = {
      title: title.trim(),
      dueDate: dueDateObj.toISOString(),
      totalPoints,
      createdAt: new Date().toISOString(),
    };

    if (description !== undefined && description !== null) {
      insertData.description = description.trim();
    }

    if (subjectId !== undefined && subjectId !== null) {
      insertData.subjectId = subjectId;
    }

    if (teacherId !== undefined && teacherId !== null) {
      insertData.teacherId = teacherId;
    }

    // Insert assignment
    const newAssignment = await db
      .insert(assignments)
      .values(insertData)
      .returning();

    return NextResponse.json(newAssignment[0], { status: 201 });
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

    // Check if assignment exists
    const existing = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Assignment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, subjectId, teacherId, dueDate, totalPoints } = body;

    const updates: any = {};

    // Validate and add title if provided
    if (title !== undefined) {
      if (title.trim() === '') {
        return NextResponse.json(
          { error: 'Title cannot be empty', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    // Add description if provided
    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    // Validate and add dueDate if provided
    if (dueDate !== undefined) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return NextResponse.json(
          { error: 'Due date must be a valid ISO timestamp', code: 'INVALID_DUE_DATE' },
          { status: 400 }
        );
      }
      updates.dueDate = dueDateObj.toISOString();
    }

    // Validate and add totalPoints if provided
    if (totalPoints !== undefined) {
      if (!Number.isInteger(totalPoints) || totalPoints <= 0) {
        return NextResponse.json(
          { error: 'Total points must be a positive integer', code: 'INVALID_TOTAL_POINTS' },
          { status: 400 }
        );
      }
      updates.totalPoints = totalPoints;
    }

    // Validate and add subjectId if provided
    if (subjectId !== undefined) {
      if (subjectId !== null) {
        if (!Number.isInteger(subjectId)) {
          return NextResponse.json(
            { error: 'Subject ID must be an integer', code: 'INVALID_SUBJECT_ID' },
            { status: 400 }
          );
        }

        const subject = await db
          .select()
          .from(subjects)
          .where(eq(subjects.id, subjectId))
          .limit(1);

        if (subject.length === 0) {
          return NextResponse.json(
            { error: 'Subject not found', code: 'SUBJECT_NOT_FOUND' },
            { status: 400 }
          );
        }
      }
      updates.subjectId = subjectId;
    }

    // Validate and add teacherId if provided
    if (teacherId !== undefined) {
      if (teacherId !== null) {
        if (!Number.isInteger(teacherId)) {
          return NextResponse.json(
            { error: 'Teacher ID must be an integer', code: 'INVALID_TEACHER_ID' },
            { status: 400 }
          );
        }

        const teacher = await db
          .select()
          .from(users)
          .where(eq(users.id, teacherId))
          .limit(1);

        if (teacher.length === 0) {
          return NextResponse.json(
            { error: 'Teacher not found', code: 'TEACHER_NOT_FOUND' },
            { status: 400 }
          );
        }

        if (teacher[0].role !== 'teacher') {
          return NextResponse.json(
            { error: 'User must have teacher role', code: 'INVALID_TEACHER_ROLE' },
            { status: 400 }
          );
        }
      }
      updates.teacherId = teacherId;
    }

    // If no fields to update, return error
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    // Update assignment
    const updated = await db
      .update(assignments)
      .set(updates)
      .where(eq(assignments.id, parseInt(id)))
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

    // Check if assignment exists
    const existing = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Assignment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete assignment
    const deleted = await db
      .delete(assignments)
      .where(eq(assignments.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Assignment deleted successfully',
        assignment: deleted[0],
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