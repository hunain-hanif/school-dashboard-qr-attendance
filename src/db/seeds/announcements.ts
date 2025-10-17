import { db } from '@/db';
import { announcements } from '@/db/schema';

async function main() {
    const sampleAnnouncements = [
        {
            title: 'Welcome to the New Academic Year',
            content: 'Dear students, teachers, and staff, we are thrilled to welcome you all to the new academic year! This year promises to be filled with exciting learning opportunities, new challenges, and memorable experiences. We look forward to working together to make this year successful for everyone. Let\'s make it a great year!',
            authorId: 1,
            targetAudience: 'all',
            classId: null,
            createdAt: new Date('2024-01-15T08:00:00Z').toISOString(),
        },
        {
            title: 'Parent-Teacher Conference Schedule',
            content: 'Dear Teachers, the parent-teacher conferences have been scheduled for the upcoming month. Please review your assigned time slots in the staff portal and prepare your student progress reports. Conferences will be held both in-person and virtually. Ensure all documentation is ready at least 48 hours in advance. Contact the administration office if you need to make any scheduling changes.',
            authorId: 1,
            targetAudience: 'teachers',
            classId: null,
            createdAt: new Date('2024-02-01T09:30:00Z').toISOString(),
        },
        {
            title: 'Upcoming Science Fair',
            content: 'Attention all students! Our annual Science Fair is coming up next month. This is an excellent opportunity to showcase your scientific creativity and innovation. Projects can cover any field of science - physics, chemistry, biology, or environmental science. Registration forms are available in the science lab. Deadline for registration is two weeks from today. Start brainstorming your ideas!',
            authorId: 2,
            targetAudience: 'students',
            classId: null,
            createdAt: new Date('2024-02-10T10:15:00Z').toISOString(),
        },
        {
            title: 'Grade 9-A Field Trip Reminder',
            content: 'This is a reminder for all Grade 9-A students and parents about our upcoming field trip to the Science Museum scheduled for next Friday. Please ensure permission slips are submitted by Wednesday. Students should bring a packed lunch and wear comfortable walking shoes. We will depart at 8:30 AM and return by 3:00 PM. This is a great educational opportunity - don\'t miss it!',
            authorId: 2,
            targetAudience: 'all',
            classId: 1,
            createdAt: new Date('2024-02-15T11:00:00Z').toISOString(),
        },
        {
            title: 'Mathematics Competition Registration',
            content: 'We are excited to announce the Inter-School Mathematics Competition! Students who excel in mathematics and enjoy problem-solving are encouraged to participate. The competition will test your skills in algebra, geometry, and logical reasoning. Registration is open for all grade levels. Practice sessions will be held every Tuesday and Thursday after school. Register with your math teacher by the end of this week.',
            authorId: 2,
            targetAudience: 'students',
            classId: null,
            createdAt: new Date('2024-02-20T13:45:00Z').toISOString(),
        },
        {
            title: 'Grade 10-B Assignment Extension',
            content: 'Dear Grade 10-B students, due to the recent technical issues with the online submission portal, the deadline for the English Literature essay has been extended by three days. The new deadline is now Monday, 11:59 PM. Please use this extra time to refine your work and ensure proper citations. No further extensions will be granted. If you have any questions, please reach out during office hours.',
            authorId: 2,
            targetAudience: 'all',
            classId: 4,
            createdAt: new Date('2024-02-25T14:30:00Z').toISOString(),
        },
        {
            title: 'Professional Development Day',
            content: 'Please note that next Wednesday is a Professional Development Day. All teachers and staff are required to attend the mandatory training sessions on new educational technologies and teaching methodologies. Students will have the day off - no classes will be held. The sessions will run from 9:00 AM to 4:00 PM with lunch provided. Please check your email for the detailed agenda and room assignments.',
            authorId: 1,
            targetAudience: 'all',
            classId: null,
            createdAt: new Date('2024-03-01T08:45:00Z').toISOString(),
        },
        {
            title: 'Grade 9-B Reading Assignment',
            content: 'Grade 9-B students, please complete chapters 5-8 of "To Kill a Mockingbird" for our discussion next week. As you read, take notes on the major themes, character development, and historical context. Be prepared to discuss the symbolism of the mockingbird and its significance to the story. There will be a reading comprehension quiz on Friday. Happy reading!',
            authorId: 3,
            targetAudience: 'all',
            classId: 2,
            createdAt: new Date('2024-03-05T12:00:00Z').toISOString(),
        },
    ];

    await db.insert(announcements).values(sampleAnnouncements);
    
    console.log('✅ Announcements seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});