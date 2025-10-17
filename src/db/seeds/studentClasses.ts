import { db } from '@/db';
import { studentClasses } from '@/db/schema';

async function main() {
    const enrollmentData = [
        // Class 1 enrollments
        {
            studentId: 5,
            classId: 1,
            enrolledAt: new Date('2024-01-15T08:00:00').toISOString(),
        },
        {
            studentId: 6,
            classId: 1,
            enrolledAt: new Date('2024-01-15T08:15:00').toISOString(),
        },
        {
            studentId: 7,
            classId: 1,
            enrolledAt: new Date('2024-01-15T08:30:00').toISOString(),
        },
        {
            studentId: 8,
            classId: 1,
            enrolledAt: new Date('2024-01-15T08:45:00').toISOString(),
        },
        // Class 2 enrollments
        {
            studentId: 9,
            classId: 2,
            enrolledAt: new Date('2024-01-16T09:00:00').toISOString(),
        },
        {
            studentId: 10,
            classId: 2,
            enrolledAt: new Date('2024-01-16T09:15:00').toISOString(),
        },
        {
            studentId: 11,
            classId: 2,
            enrolledAt: new Date('2024-01-16T09:30:00').toISOString(),
        },
        {
            studentId: 12,
            classId: 2,
            enrolledAt: new Date('2024-01-16T09:45:00').toISOString(),
        },
        // Class 3 enrollments
        {
            studentId: 13,
            classId: 3,
            enrolledAt: new Date('2024-01-17T10:00:00').toISOString(),
        },
        {
            studentId: 14,
            classId: 3,
            enrolledAt: new Date('2024-01-17T10:15:00').toISOString(),
        },
        {
            studentId: 15,
            classId: 3,
            enrolledAt: new Date('2024-01-17T10:30:00').toISOString(),
        },
        {
            studentId: 16,
            classId: 3,
            enrolledAt: new Date('2024-01-17T10:45:00').toISOString(),
        },
        // Class 4 enrollments
        {
            studentId: 17,
            classId: 4,
            enrolledAt: new Date('2024-01-18T11:00:00').toISOString(),
        },
        {
            studentId: 18,
            classId: 4,
            enrolledAt: new Date('2024-01-18T11:15:00').toISOString(),
        },
        {
            studentId: 19,
            classId: 4,
            enrolledAt: new Date('2024-01-18T11:30:00').toISOString(),
        },
    ];

    await db.insert(studentClasses).values(enrollmentData);
    
    console.log('✅ Student classes enrollment seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});