import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Users table - stores principals, teachers, and students
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clerkId: text('clerk_id').unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull(), // 'principal', 'teacher', or 'student'
  qrCode: text('qr_code').unique(), // unique QR code for attendance (for students)
  createdAt: text('created_at').notNull(),
});

// Classes table
export const classes = sqliteTable('classes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  gradeLevel: integer('grade_level').notNull(),
  teacherId: integer('teacher_id').references(() => users.id),
  createdAt: text('created_at').notNull(),
});

// Subjects table
export const subjects = sqliteTable('subjects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  classId: integer('class_id').references(() => classes.id),
  teacherId: integer('teacher_id').references(() => users.id),
  createdAt: text('created_at').notNull(),
});

// Assignments table
export const assignments = sqliteTable('assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  subjectId: integer('subject_id').references(() => subjects.id),
  teacherId: integer('teacher_id').references(() => users.id),
  dueDate: text('due_date').notNull(),
  totalPoints: integer('total_points').notNull(),
  createdAt: text('created_at').notNull(),
});

// Submissions table
export const submissions = sqliteTable('submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  assignmentId: integer('assignment_id').references(() => assignments.id),
  studentId: integer('student_id').references(() => users.id),
  content: text('content'),
  fileUrl: text('file_url'),
  grade: integer('grade'),
  feedback: text('feedback'),
  submittedAt: text('submitted_at').notNull(),
  gradedAt: text('graded_at'),
});

// Attendance table
export const attendance = sqliteTable('attendance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id').references(() => users.id),
  classId: integer('class_id').references(() => classes.id),
  date: text('date').notNull(),
  status: text('status').notNull(), // 'present', 'absent', 'late'
  markedBy: integer('marked_by').references(() => users.id),
  createdAt: text('created_at').notNull(),
});

// Announcements table
export const announcements = sqliteTable('announcements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id').references(() => users.id),
  targetAudience: text('target_audience').notNull(), // 'all', 'teachers', 'students', or specific class_id
  classId: integer('class_id').references(() => classes.id),
  createdAt: text('created_at').notNull(),
});

// Student Classes junction table (many-to-many relationship)
export const studentClasses = sqliteTable('student_classes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id').references(() => users.id),
  classId: integer('class_id').references(() => classes.id),
  enrolledAt: text('enrolled_at').notNull(),
});