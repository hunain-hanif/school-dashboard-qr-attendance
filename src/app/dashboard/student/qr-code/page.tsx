import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { StudentQRCode } from '@/components/attendance/StudentQRCode';

async function getStudentData(clerkId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/users?clerkId=${clerkId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching student data:', error);
    return null;
  }
}

export default async function StudentQRCodePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  const studentData = await getStudentData(userId);

  if (!studentData || !studentData.qrCode) {
    return (
      <DashboardLayout role="student" userName={user?.fullName || user?.firstName || 'Student'}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">QR Code Not Available</h2>
            <p className="text-muted-foreground">Please contact your administrator to generate your QR code.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" userName={user?.fullName || user?.firstName || 'Student'}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Attendance QR Code</h1>
          <p className="text-muted-foreground mt-1">Show this QR code to your teacher for attendance marking</p>
        </div>

        <StudentQRCode 
          qrCode={studentData.qrCode}
          studentName={studentData.fullName}
          studentId={studentData.id}
        />
      </div>
    </DashboardLayout>
  );
}