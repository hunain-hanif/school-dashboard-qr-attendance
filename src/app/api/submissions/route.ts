import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submissions, assignments, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single submission by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const submission = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, parseInt(id)))
        .limit(1);

      if (submission.length === 0) {
        return NextResponse.json(
          { error: 'Submission not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(submission[0], { status: 200 });
    }

    // List submissions with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');

    let query = db.select().from(submissions);

    // Apply filters
    const conditions = [];
    if (assignmentId) {
      if (isNaN(parseInt(assignmentId))) {
        return NextResponse.json(
          { error: 'Valid assignmentId is required', code: 'INVALID_ASSIGNMENT_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(submissions.assignmentId, parseInt(assignmentId)));
    }
    if (studentId) {
      if (isNaN(parseInt(studentId))) {
        return NextResponse.json(
          { error: 'Valid studentId is required', code: 'INVALID_STUDENT_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(submissions.studentId, parseInt(studentId)));
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
    const { assignmentId, studentId, content, fileUrl } = body;

    // Validate required fields
    if (!assignmentId) {
      return NextResponse.json(
        { error: 'assignmentId is required', code: 'MISSING_ASSIGNMENT_ID' },
        { status: 400 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required', code: 'MISSING_STUDENT_ID' },
        { status: 400 }
      );
    }

    // Validate at least one of content or fileUrl is provided
    if (!content && !fileUrl) {
      return NextResponse.json(
        {
          error: 'At least one of content or fileUrl must be provided',
          code: 'MISSING_SUBMISSION_DATA',
        },
        { status: 400 }
      );
    }

    // Validate assignmentId exists
    const assignment = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, parseInt(assignmentId)))
      .limit(1);

    if (assignment.length === 0) {
      return NextResponse.json(
        { error: 'Assignment not found', code: 'ASSIGNMENT_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Validate studentId exists and has role='student'
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

    // Create submission
    const newSubmission = await db
      .insert(submissions)
      .values({
        assignmentId: parseInt(assignmentId),
        studentId: parseInt(studentId),
        content: content?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
        submittedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newSubmission[0], { status: 201 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const existingSubmission = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, parseInt(id)))
      .limit(1);

    if (existingSubmission.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content, fileUrl, grade, feedback, gradedAt } = body;

    // Validate grade if provided
    if (grade !== undefined && grade !== null) {
      const gradeInt = parseInt(grade);
      if (isNaN(gradeInt) || gradeInt < 0) {
        return NextResponse.json(
          {
            error: 'Grade must be a non-negative integer',
            code: 'INVALID_GRADE',
          },
          { status: 400 }
        );
      }
    }

    // Prepare update object
    const updateData: any = {};

    if (content !== undefined) {
      updateData.content = content?.trim() || null;
    }
    if (fileUrl !== undefined) {
      updateData.fileUrl = fileUrl?.trim() || null;
    }
    if (grade !== undefined) {
      updateData.grade = grade !== null ? parseInt(grade) : null;
    }
    if (feedback !== undefined) {
      updateData.feedback = feedback?.trim() || null;
    }
    if (gradedAt !== undefined) {
      updateData.gradedAt = gradedAt?.trim() || null;
    }

    // Auto-set gradedAt if grade is being set and gradedAt is not provided
    if (grade !== undefined && grade !== null && gradedAt === undefined) {
      updateData.gradedAt = new Date().toISOString();
    }

    // Update submission
    const updated = await db
      .update(submissions)
      .set(updateData)
      .where(eq(submissions.id, parseInt(id)))
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const existingSubmission = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, parseInt(id)))
      .limit(1);

    if (existingSubmission.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete submission
    const deleted = await db
      .delete(submissions)
      .where(eq(submissions.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Submission deleted successfully',
        submission: deleted[0],
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