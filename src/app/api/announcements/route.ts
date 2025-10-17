import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { announcements, users, classes } from '@/db/schema';
import { eq, or, like, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single announcement by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const announcement = await db
        .select()
        .from(announcements)
        .where(eq(announcements.id, parseInt(id)))
        .limit(1);

      if (announcement.length === 0) {
        return NextResponse.json(
          { error: 'Announcement not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(announcement[0], { status: 200 });
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const targetAudience = searchParams.get('targetAudience');
    const authorId = searchParams.get('authorId');
    const classId = searchParams.get('classId');

    let query = db.select().from(announcements);

    // Build filter conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(announcements.title, `%${search}%`),
          like(announcements.content, `%${search}%`)
        )
      );
    }

    if (targetAudience) {
      conditions.push(eq(announcements.targetAudience, targetAudience));
    }

    if (authorId && !isNaN(parseInt(authorId))) {
      conditions.push(eq(announcements.authorId, parseInt(authorId)));
    }

    if (classId && !isNaN(parseInt(classId))) {
      conditions.push(eq(announcements.classId, parseInt(classId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(announcements.createdAt))
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
    const { title, content, authorId, targetAudience, classId } = body;

    // Validation: title is required
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    // Validation: content is required
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required', code: 'MISSING_CONTENT' },
        { status: 400 }
      );
    }

    // Validation: targetAudience is required
    if (!targetAudience) {
      return NextResponse.json(
        { error: 'Target audience is required', code: 'MISSING_TARGET_AUDIENCE' },
        { status: 400 }
      );
    }

    // Validation: targetAudience must be valid value
    const validAudiences = ['all', 'teachers', 'students'];
    if (!validAudiences.includes(targetAudience) && isNaN(parseInt(targetAudience))) {
      return NextResponse.json(
        {
          error: 'Target audience must be "all", "teachers", "students", or a valid class ID',
          code: 'INVALID_TARGET_AUDIENCE',
        },
        { status: 400 }
      );
    }

    // Validation: if authorId provided, verify it exists in users table
    if (authorId) {
      if (isNaN(parseInt(authorId))) {
        return NextResponse.json(
          { error: 'Author ID must be a valid number', code: 'INVALID_AUTHOR_ID' },
          { status: 400 }
        );
      }

      const author = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(authorId)))
        .limit(1);

      if (author.length === 0) {
        return NextResponse.json(
          { error: 'Author ID does not exist', code: 'AUTHOR_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Validation: if targetAudience is numeric or classId provided, verify class exists
    const targetIsClassId = !isNaN(parseInt(targetAudience));
    const classIdToValidate = targetIsClassId ? parseInt(targetAudience) : (classId ? parseInt(classId) : null);

    if (classIdToValidate) {
      const classRecord = await db
        .select()
        .from(classes)
        .where(eq(classes.id, classIdToValidate))
        .limit(1);

      if (classRecord.length === 0) {
        return NextResponse.json(
          { error: 'Class ID does not exist', code: 'CLASS_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Create announcement
    const newAnnouncement = await db
      .insert(announcements)
      .values({
        title: title.trim(),
        content: content.trim(),
        authorId: authorId ? parseInt(authorId) : null,
        targetAudience: targetAudience,
        classId: classIdToValidate || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newAnnouncement[0], { status: 201 });
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

    // Validation: ID is required
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if announcement exists
    const existing = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Announcement not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, content, targetAudience, classId } = body;

    // Validation: if title provided, must not be empty
    if (title !== undefined && title.trim() === '') {
      return NextResponse.json(
        { error: 'Title cannot be empty', code: 'INVALID_TITLE' },
        { status: 400 }
      );
    }

    // Validation: if content provided, must not be empty
    if (content !== undefined && content.trim() === '') {
      return NextResponse.json(
        { error: 'Content cannot be empty', code: 'INVALID_CONTENT' },
        { status: 400 }
      );
    }

    // Validation: if targetAudience provided, must be valid
    if (targetAudience !== undefined) {
      const validAudiences = ['all', 'teachers', 'students'];
      if (!validAudiences.includes(targetAudience) && isNaN(parseInt(targetAudience))) {
        return NextResponse.json(
          {
            error: 'Target audience must be "all", "teachers", "students", or a valid class ID',
            code: 'INVALID_TARGET_AUDIENCE',
          },
          { status: 400 }
        );
      }
    }

    // Validation: if classId provided or targetAudience is numeric, verify class exists
    const targetIsClassId = targetAudience && !isNaN(parseInt(targetAudience));
    const classIdToValidate = targetIsClassId ? parseInt(targetAudience) : (classId ? parseInt(classId) : null);

    if (classIdToValidate) {
      const classRecord = await db
        .select()
        .from(classes)
        .where(eq(classes.id, classIdToValidate))
        .limit(1);

      if (classRecord.length === 0) {
        return NextResponse.json(
          { error: 'Class ID does not exist', code: 'CLASS_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updates: any = {};

    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content.trim();
    if (targetAudience !== undefined) updates.targetAudience = targetAudience;
    if (classId !== undefined) updates.classId = classId ? parseInt(classId) : null;
    if (classIdToValidate) updates.classId = classIdToValidate;

    // Update announcement
    const updated = await db
      .update(announcements)
      .set(updates)
      .where(eq(announcements.id, parseInt(id)))
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

    // Validation: ID is required
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if announcement exists
    const existing = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Announcement not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete announcement
    const deleted = await db
      .delete(announcements)
      .where(eq(announcements.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Announcement deleted successfully',
        announcement: deleted[0],
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