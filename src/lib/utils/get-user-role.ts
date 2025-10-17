export async function getUserRole(clerkId: string): Promise<'principal' | 'teacher' | 'student' | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/users?clerkId=${clerkId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const user = await response.json();
    return user?.role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}