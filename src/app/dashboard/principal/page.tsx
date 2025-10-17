import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Users, School, ClipboardCheck, BookOpen, TrendingUp, Calendar } from 'lucide-react';

async function getStats() {
  try {
    const [usersRes, classesRes, attendanceRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/users?limit=100`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/classes?limit=100`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/attendance?limit=1000`, { cache: 'no-store' }),
    ]);

    const users = await usersRes.json();
    const classes = await classesRes.json();
    const attendance = await attendanceRes.json();

    const teachers = users.data?.filter((u: any) => u.role === 'teacher') || [];
    const students = users.data?.filter((u: any) => u.role === 'student') || [];
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = Array.isArray(attendance) ? attendance.filter((a: any) => a.date === today) : [];
    const presentToday = todayAttendance.filter((a: any) => a.status === 'present').length;
    const totalToday = todayAttendance.length;
    const attendanceRate = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalClasses: Array.isArray(classes) ? classes.length : 0,
      attendanceRate,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      attendanceRate: 0,
    };
  }
}

export default async function PrincipalDashboard() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  const stats = await getStats();

  return (
    <DashboardLayout role="principal" userName={user?.fullName || user?.firstName || 'Principal'}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.firstName || 'Principal'}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your school today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.totalStudents}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Active learners</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Teachers</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.totalTeachers}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>Faculty members</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.totalClasses}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <School className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>Active classes</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.attendanceRate}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Today's attendance</span>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all">
              <Users className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium text-foreground">Manage Users</p>
                <p className="text-sm text-muted-foreground">Add or edit users</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-all">
              <School className="h-5 w-5 text-accent" />
              <div className="text-left">
                <p className="font-medium text-foreground">Create Class</p>
                <p className="text-sm text-muted-foreground">Set up new classes</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-secondary hover:bg-secondary/10 transition-all">
              <BookOpen className="h-5 w-5 text-secondary-foreground" />
              <div className="text-left">
                <p className="font-medium text-foreground">View Reports</p>
                <p className="text-sm text-muted-foreground">Analytics & insights</p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}