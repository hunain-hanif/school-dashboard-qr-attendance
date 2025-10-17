import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { School, ClipboardList, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

async function getStudentStats(clerkId: string) {
  try {
    // Get student user data
    const userRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/users?clerkId=${clerkId}`, { cache: 'no-store' });
    const student = await userRes.json();
    
    if (!student?.id) {
      return { myClasses: 0, assignments: 0, attendanceRate: 0, submissionsPending: 0 };
    }

    const [enrollmentsRes, submissionsRes, attendanceRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/student-classes?studentId=${student.id}`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/submissions?studentId=${student.id}`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/attendance?studentId=${student.id}`, { cache: 'no-store' }),
    ]);

    const enrollments = await enrollmentsRes.json();
    const submissions = await submissionsRes.json();
    const attendance = await attendanceRes.json();

    // Get all assignments for enrolled classes
    let totalAssignments = 0;
    if (Array.isArray(enrollments)) {
      for (const enrollment of enrollments) {
        // Get subjects for this class
        const subjectsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/subjects?classId=${enrollment.classId}`, { cache: 'no-store' });
        const subjects = await subjectsRes.json();
        
        if (Array.isArray(subjects)) {
          for (const subject of subjects) {
            const assignmentsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/assignments?subjectId=${subject.id}`, { cache: 'no-store' });
            const assignments = await assignmentsRes.json();
            totalAssignments += Array.isArray(assignments) ? assignments.length : 0;
          }
        }
      }
    }

    const myClasses = Array.isArray(enrollments) ? enrollments.length : 0;
    const submittedCount = Array.isArray(submissions) ? submissions.length : 0;
    const submissionsPending = Math.max(0, totalAssignments - submittedCount);

    // Calculate attendance rate
    const attendanceRecords = Array.isArray(attendance) ? attendance : [];
    const presentCount = attendanceRecords.filter((a: any) => a.status === 'present').length;
    const attendanceRate = attendanceRecords.length > 0 
      ? Math.round((presentCount / attendanceRecords.length) * 100) 
      : 0;

    return {
      myClasses,
      assignments: totalAssignments,
      attendanceRate,
      submissionsPending,
    };
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return { myClasses: 0, assignments: 0, attendanceRate: 0, submissionsPending: 0 };
  }
}

export default async function StudentDashboard() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  const stats = await getStudentStats(userId);

  return (
    <DashboardLayout role="student" userName={user?.fullName || user?.firstName || 'Student'}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.firstName || 'Student'}!</h1>
          <p className="text-muted-foreground mt-1">Here's your academic overview.</p>
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
              <span>Enrolled courses</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.assignments}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>Total assignments</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.attendanceRate}%</p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                stats.attendanceRate >= 90 ? 'bg-green-100' : stats.attendanceRate >= 75 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <CheckCircle className={`h-6 w-6 ${
                  stats.attendanceRate >= 90 ? 'text-green-600' : stats.attendanceRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>Your attendance</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Work</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.submissionsPending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600">
              <span>Due soon</span>
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
                <p className="font-medium text-foreground">View Assignments</p>
                <p className="text-sm text-muted-foreground">Check your work</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-all">
              <Calendar className="h-5 w-5 text-accent" />
              <div className="text-left">
                <p className="font-medium text-foreground">Class Schedule</p>
                <p className="text-sm text-muted-foreground">Today's classes</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-secondary hover:bg-secondary/10 transition-all">
              <CheckCircle className="h-5 w-5 text-secondary-foreground" />
              <div className="text-left">
                <p className="font-medium text-foreground">My QR Code</p>
                <p className="text-sm text-muted-foreground">For attendance</p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}