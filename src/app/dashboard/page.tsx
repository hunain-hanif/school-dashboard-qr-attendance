import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserRole } from '@/lib/utils/get-user-role';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const role = await getUserRole(userId);

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Account Setup Required</h1>
          <p className="text-muted-foreground">Please contact an administrator to set up your account.</p>
        </div>
      </div>
    );
  }

  // Redirect to role-specific dashboard
  if (role === 'principal') {
    redirect('/dashboard/principal');
  } else if (role === 'teacher') {
    redirect('/dashboard/teacher');
  } else if (role === 'student') {
    redirect('/dashboard/student');
  }

  return null;
}