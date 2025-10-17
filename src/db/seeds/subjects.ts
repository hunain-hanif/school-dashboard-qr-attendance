import { db } from '@/db';
import { subjects } from '@/db/schema';

async function main() {
    const sampleSubjects = [
        // Class 1 (Grade 9-A) subjects
        {
            name: 'Mathematics',
            description: 'Fundamental mathematics including algebra, geometry, and basic calculus concepts.',
            classId: 1,
            teacherId: 2,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Science',
            description: 'General science covering physics, chemistry, and biology principles.',
            classId: 1,
            teacherId: 2,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'English',
            description: 'English language and literature focusing on grammar, composition, and literary analysis.',
            classId: 1,
            teacherId: 2,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'History',
            description: 'World and national history exploring significant events and their impacts.',
            classId: 1,
            teacherId: 2,
            createdAt: new Date().toISOString(),
        },
        // Class 2 (Grade 9-B) subjects
        {
            name: 'Mathematics',
            description: 'Fundamental mathematics including algebra, geometry, and basic calculus concepts.',
            classId: 2,
            teacherId: 3,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Science',
            description: 'General science covering physics, chemistry, and biology principles.',
            classId: 2,
            teacherId: 3,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'English',
            description: 'English language and literature focusing on grammar, composition, and literary analysis.',
            classId: 2,
            teacherId: 3,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'History',
            description: 'World and national history exploring significant events and their impacts.',
            classId: 2,
            teacherId: 3,
            createdAt: new Date().toISOString(),
        },
        // Class 3 (Grade 10-A) subjects
        {
            name: 'Mathematics',
            description: 'Advanced mathematics including trigonometry, advanced algebra, and pre-calculus.',
            classId: 3,
            teacherId: 4,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Science',
            description: 'Advanced science with deeper focus on physics, chemistry, and biological systems.',
            classId: 3,
            teacherId: 4,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'English',
            description: 'Advanced English literature and composition with critical thinking emphasis.',
            classId: 3,
            teacherId: 4,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'History',
            description: 'In-depth study of historical periods and their cultural significance.',
            classId: 3,
            teacherId: 4,
            createdAt: new Date().toISOString(),
        },
        // Class 4 (Grade 10-B) subjects
        {
            name: 'Mathematics',
            description: 'Advanced mathematics including trigonometry, advanced algebra, and pre-calculus.',
            classId: 4,
            teacherId: 2,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Science',
            description: 'Advanced science with deeper focus on physics, chemistry, and biological systems.',
            classId: 4,
            teacherId: 2,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'English',
            description: 'Advanced English literature and composition with critical thinking emphasis.',
            classId: 4,
            teacherId: 2,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'History',
            description: 'In-depth study of historical periods and their cultural significance.',
            classId: 4,
            teacherId: 2,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(subjects).values(sampleSubjects);
    
    console.log('✅ Subjects seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});