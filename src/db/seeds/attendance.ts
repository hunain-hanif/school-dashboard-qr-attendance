import { db } from '@/db';
import { attendance } from '@/db/schema';

async function main() {
    // Generate dates for past 5 school days (excluding weekends)
    const dates: string[] = [];
    const today = new Date();
    let daysAdded = 0;
    let currentDate = new Date(today);
    
    while (daysAdded < 5) {
        currentDate.setDate(currentDate.getDate() - 1);
        const dayOfWeek = currentDate.getDay();
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            dates.push(currentDate.toISOString().split('T')[0]);
            daysAdded++;
        }
    }
    
    dates.reverse(); // Oldest to newest

    // Class enrollments with teacher IDs
    const classEnrollments = [
        { classId: 1, markedBy: 2, students: [5, 6, 7, 8] },
        { classId: 2, markedBy: 3, students: [9, 10, 11, 12] },
        { classId: 3, markedBy: 4, students: [13, 14, 15, 16] },
        { classId: 4, markedBy: 2, students: [17, 18, 19] }
    ];

    // Status distribution helper
    const getStatus = (randomValue: number): string => {
        if (randomValue < 85) return 'present';
        if (randomValue < 95) return 'late';
        return 'absent';
    };

    // Generate attendance records
    const attendanceRecords = [];
    let recordIndex = 0;

    for (const date of dates) {
        for (const classEnrollment of classEnrollments) {
            for (const studentId of classEnrollment.students) {
                // Generate semi-random but consistent status based on record index
                const statusValue = ((recordIndex * 37) % 100);
                const status = getStatus(statusValue);
                
                attendanceRecords.push({
                    studentId,
                    classId: classEnrollment.classId,
                    date,
                    status,
                    markedBy: classEnrollment.markedBy,
                    createdAt: new Date(`${date}T08:00:00Z`).toISOString()
                });
                
                recordIndex++;
            }
        }
    }

    await db.insert(attendance).values(attendanceRecords);
    
    console.log('✅ Attendance seeder completed successfully');
    console.log(`   Generated ${attendanceRecords.length} attendance records for ${dates.length} days`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});