import { db } from '@/db';
import { classes } from '@/db/schema';

async function main() {
    const sampleClasses = [
        {
            name: 'Grade 9-A',
            gradeLevel: 9,
            teacherId: 2,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Grade 9-B',
            gradeLevel: 9,
            teacherId: 3,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Grade 10-A',
            gradeLevel: 10,
            teacherId: 4,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Grade 10-B',
            gradeLevel: 10,
            teacherId: 2,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(classes).values(sampleClasses);
    
    console.log('✅ Classes seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});