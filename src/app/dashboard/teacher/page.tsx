import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { School, ClipboardList, Users, Calendar, CheckCircle, Clock } from 'lucide-react';

async function getTeacherStats(clerkId: string) {
  try {
    // Get teacher user data
    const userRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/users?clerkId=${clerkId}`, { cache: 'no-store' });
    const teacher = await userRes.json();
    
    if (!teacher?.id) {
      return { myClasses: 0, myAssignments: 0, myStudents: 0, pendingGrading: 0 };
    }

    const [classesRes, assignmentsRes, submissionsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/classes?teacherId=${teacher.id}`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/assignments?teacherId=${teacher.id}`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/submissions?limit=1000`, { cache: 'no-store' }),
    ]);

    const classes = await classesRes.json();
    const assignments = await assignmentsRes.json();
    const submissions = await submissionsRes.json();

    // Calculate stats
    const myClasses = Array.isArray(classes) ? classes.length : 0;
    const myAssignments = Array.isArray(assignments) ? assignments.length : 0;
    
    // Get unique students from class enrollments
    const studentIds = new Set();
    for (const cls of (Array.isArray(classes) ? classes : [])) {
      const enrollmentsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/student-classes?classId=${cls.id}`, { cache: 'no-store' });
      const enrollments = await enrollmentsRes.json();
      if (Array.isArray(enrollments)) {
        enrollments.forEach((e: any) => studentIds.add(e.studentId));
      }
    }

    const pendingGrading = Array.isArray(submissions) 
      ? submissions.filter((s: any) => !s.grade && !s.gradedAt).length 
      : 0;

    return {
      myClasses,
      myAssignments,
      myStudents: studentIds.size,
      pendingGrading,
    };
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    return { myClasses: 0, myAssignments: 0, myStudents: 0, pendingGrading: 0 };
  }
}

export default async function TeacherDashboard() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  const stats = await getTeacherStats(userId);

  return (
    <DashboardLayout role="teacher" userName={user?.fullName || user?.firstName || 'Teacher'}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.firstName || 'Teacher'}!</h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your classes and assignments.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Classes</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.myClasses}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <School className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>Active classes</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.myAssignments}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>Total created</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Students</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.myStudents}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>Enrolled students</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Grading</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.pendingGrading}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600">
              <span>Needs review</span>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all">
              <ClipboardList className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium text-foreground">Create Assignment</p>
                <p className="text-sm text-muted-foreground">Add new assignment</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-all">
              <CheckCircle className="h-5 w-5 text-accent" />
              <div className="text-left">
                <p className="font-medium text-foreground">Take Attendance</p>
                <p className="text-sm text-muted-foreground">Mark attendance</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-secondary hover:bg-secondary/10 transition-all">
              <Calendar className="h-5 w-5 text-secondary-foreground" />
              <div className="text-left">
                <p className="font-medium text-foreground">View Schedule</p>
                <p className="text-sm text-muted-foreground">Class timetable</p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}