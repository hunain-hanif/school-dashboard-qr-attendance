import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        // Principal (1 user)
        {
            clerkId: 'clerk_principal_001',
            email: 'admin@school.com',
            fullName: 'Dr. Sarah Johnson',
            role: 'principal',
            qrCode: null,
            createdAt: new Date('2024-01-05').toISOString(),
        },
        
        // Teachers (3 users)
        {
            clerkId: 'clerk_teacher_001',
            email: 'teacher1@school.com',
            fullName: 'Michael Brown',
            role: 'teacher',
            qrCode: null,
            createdAt: new Date('2024-01-08').toISOString(),
        },
        {
            clerkId: 'clerk_teacher_002',
            email: 'teacher2@school.com',
            fullName: 'Emily Davis',
            role: 'teacher',
            qrCode: null,
            createdAt: new Date('2024-01-08').toISOString(),
        },
        {
            clerkId: 'clerk_teacher_003',
            email: 'teacher3@school.com',
            fullName: 'James Wilson',
            role: 'teacher',
            qrCode: null,
            createdAt: new Date('2024-01-08').toISOString(),
        },
        
        // Students (15 users)
        {
            clerkId: 'clerk_student_001',
            email: 'student1@school.com',
            fullName: 'Alex Thompson',
            role: 'student',
            qrCode: 'QR-STU-001',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            clerkId: 'clerk_student_002',
            email: 'student2@school.com',
            fullName: 'Emma Martinez',
            role: 'student',
            qrCode: 'QR-STU-002',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            clerkId: 'clerk_student_003',
            email: 'student3@school.com',
            fullName: 'Oliver Chen',
            role: 'student',
            qrCode: 'QR-STU-003',
            createdAt: new Date('2024-01-11').toISOString(),
        },
        {
            clerkId: 'clerk_student_004',
            email: 'student4@school.com',
            fullName: 'Sophia Rodriguez',
            role: 'student',
            qrCode: 'QR-STU-004',
            createdAt: new Date('2024-01-11').toISOString(),
        },
        {
            clerkId: 'clerk_student_005',
            email: 'student5@school.com',
            fullName: 'Liam Anderson',
            role: 'student',
            qrCode: 'QR-STU-005',
            createdAt: new Date('2024-01-12').toISOString(),
        },
        {
            clerkId: 'clerk_student_006',
            email: 'student6@school.com',
            fullName: 'Ava Johnson',
            role: 'student',
            qrCode: 'QR-STU-006',
            createdAt: new Date('2024-01-12').toISOString(),
        },
        {
            clerkId: 'clerk_student_007',
            email: 'student7@school.com',
            fullName: 'Noah Williams',
            role: 'student',
            qrCode: 'QR-STU-007',
            createdAt: new Date('2024-01-13').toISOString(),
        },
        {
            clerkId: 'clerk_student_008',
            email: 'student8@school.com',
            fullName: 'Isabella Garcia',
            role: 'student',
            qrCode: 'QR-STU-008',
            createdAt: new Date('2024-01-13').toISOString(),
        },
        {
            clerkId: 'clerk_student_009',
            email: 'student9@school.com',
            fullName: 'Ethan Taylor',
            role: 'student',
            qrCode: 'QR-STU-009',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            clerkId: 'clerk_student_010',
            email: 'student10@school.com',
            fullName: 'Mia Lee',
            role: 'student',
            qrCode: 'QR-STU-010',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            clerkId: 'clerk_student_011',
            email: 'student11@school.com',
            fullName: 'Lucas Smith',
            role: 'student',
            qrCode: 'QR-STU-011',
            createdAt: new Date('2024-01-16').toISOString(),
        },
        {
            clerkId: 'clerk_student_012',
            email: 'student12@school.com',
            fullName: 'Charlotte Davis',
            role: 'student',
            qrCode: 'QR-STU-012',
            createdAt: new Date('2024-01-16').toISOString(),
        },
        {
            clerkId: 'clerk_student_013',
            email: 'student13@school.com',
            fullName: 'Mason White',
            role: 'student',
            qrCode: 'QR-STU-013',
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            clerkId: 'clerk_student_014',
            email: 'student14@school.com',
            fullName: 'Amelia Harris',
            role: 'student',
            qrCode: 'QR-STU-014',
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            clerkId: 'clerk_student_015',
            email: 'student15@school.com',
            fullName: 'Benjamin Clark',
            role: 'student',
            qrCode: 'QR-STU-015',
            createdAt: new Date('2024-01-20').toISOString(),
        },
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});