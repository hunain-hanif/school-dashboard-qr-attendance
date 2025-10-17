import { db } from '@/db';
import { assignments } from '@/db/schema';

async function main() {
    const currentDate = new Date();
    
    const calculateDueDate = (daysFromNow: number): string => {
        const dueDate = new Date(currentDate);
        dueDate.setDate(dueDate.getDate() + daysFromNow);
        return dueDate.toISOString();
    };

    const sampleAssignments = [
        {
            title: 'Algebra Quiz 1',
            description: 'A comprehensive quiz covering linear equations, quadratic functions, and polynomial operations.',
            subjectId: 1,
            teacherId: 2,
            dueDate: calculateDueDate(7),
            totalPoints: 50,
            createdAt: currentDate.toISOString(),
        },
        {
            title: 'Geometry Problem Set',
            description: 'Problem set focusing on angles, triangles, circles, and geometric proofs.',
            subjectId: 9,
            teacherId: 4,
            dueDate: calculateDueDate(14),
            totalPoints: 100,
            createdAt: currentDate.toISOString(),
        },
        {
            title: 'Trigonometry Test',
            description: 'Test covering trigonometric functions, identities, and their applications.',
            subjectId: 13,
            teacherId: 2,
            dueDate: calculateDueDate(10),
            totalPoints: 75,
            createdAt: currentDate.toISOString(),
        },
        {
            title: 'Chemistry Lab Report',
            description: 'Detailed lab report on chemical reactions and stoichiometry experiments.',
            subjectId: 2,
            teacherId: 2,
            dueDate: calculateDueDate(5),
            totalPoints: 80,
            createdAt: currentDate.toISOString(),
        },
        {
            title: 'Physics Experiment',
            description: 'Experimental analysis of Newton\'s laws of motion with data collection and analysis.',
            subjectId: 10,
            teacherId: 4,
            dueDate: calculateDueDate(12),
            totalPoints: 90,
            createdAt: currentDate.toISOString(),
        },
        {
            title: 'Biology Research Paper',
            description: 'Research paper on cellular biology, focusing on mitosis and meiosis processes.',
            subjectId: 6,
            teacherId: 3,
            dueDate: calculateDueDate(20),
            totalPoints: 100,
            createdAt: currentDate.toISOString(),
        },
        {
            title: 'Essay on Shakespeare',
            description: 'Analytical essay exploring themes and character development in Macbeth.',
            subjectId: 3,
            teacherId: 2,
            dueDate: calculateDueDate(15),
            totalPoints: 100,
            createdAt: currentDate.toISOString(),
        },
        {
            title: 'Poetry Analysis',
            description: 'Critical analysis of romantic poetry, focusing on symbolism and literary devices.',
            subjectId: 11,
            teacherId: 4,
            dueDate: calculateDueDate(8),
            totalPoints: 60,
            createdAt: currentDate.toISOString(),
        },
        {
            title: 'Book Report',
            description: 'Comprehensive book report on To Kill a Mockingbird, including themes and character analysis.',
            subjectId: 7,
            teacherId: 3,
            dueDate: calculateDueDate(18),
            totalPoints: 80,
            createdAt: currentDate.toISOString(),
        },
        {
            title: 'World War II Timeline',
            description: 'Create a detailed timeline of major events during World War II with analysis.',
            subjectId: 4,
            teacherId: 2,
            dueDate: calculateDueDate(6),
            totalPoints: 70,
            createdAt: currentDate.toISOString(),
        },
        {
            title: 'American Revolution Essay',
            description: 'Essay analyzing the causes and consequences of the American Revolution.',
            subjectId: 12,
            teacherId: 4,
            dueDate: calculateDueDate(11),
            totalPoints: 85,
            createdAt: currentDate.toISOString(),
        },
        {
            title: 'Ancient Civilizations Presentation',
            description: 'Multimedia presentation comparing and contrasting ancient Greek and Roman civilizations.',
            subjectId: 8,
            teacherId: 3,
            dueDate: calculateDueDate(25),
            totalPoints: 95,
            createdAt: currentDate.toISOString(),
        }
    ];

    await db.insert(assignments).values(sampleAssignments);
    
    console.log('✅ Assignments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});