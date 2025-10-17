'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardList, 
  Calendar,
  Bell,
  Settings,
  QrCode,
  GraduationCap,
  School,
  Menu,
  X,
  BarChart3,
  ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'principal' | 'teacher' | 'student';
  userName?: string;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();

  const principalNav = [
    { name: 'Dashboard', href: '/dashboard/principal', icon: LayoutDashboard },
    { name: 'Users', href: '/dashboard/principal/users', icon: Users },
    { name: 'Classes', href: '/dashboard/principal/classes', icon: School },
    { name: 'Analytics', href: '/dashboard/principal/analytics', icon: BarChart3 },
  ];

  const teacherNav = [
    { name: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
    { name: 'My Classes', href: '/dashboard/teacher/classes', icon: School },
    { name: 'Assignments', href: '/dashboard/teacher/assignments', icon: ClipboardList },
    { name: 'Attendance', href: '/dashboard/teacher/attendance', icon: ClipboardCheck },
  ];

  const studentNav = [
    { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'My Classes', href: '/dashboard/student/classes', icon: BookOpen },
    { name: 'Assignments', href: '/dashboard/student/assignments', icon: ClipboardList },
    { name: 'My QR Code', href: '/dashboard/student/qr-code', icon: QrCode },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getNavItems = (): NavItem[] => {
    if (role === 'principal') {
      return principalNav;
    } else if (role === 'teacher') {
      return teacherNav;
    } else {
      return studentNav;
    }
  };

  const navItems = getNavItems();

  const getRoleBadgeColor = () => {
    if (role === 'principal') return 'bg-accent text-accent-foreground';
    if (role === 'teacher') return 'bg-primary text-primary-foreground';
    return 'bg-secondary text-secondary-foreground';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
            <div className="flex items-center gap-2">
              <School className="h-8 w-8 text-primary" />
              <span className="text-lg font-bold text-sidebar-foreground">SchoolMS</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10"
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {userName || 'User'}
                </p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${getRoleBadgeColor()}`}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== `/dashboard/${role}` && pathname.startsWith(item.href));
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold text-foreground">
              {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}