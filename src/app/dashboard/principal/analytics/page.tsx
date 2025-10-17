'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { Users, BookOpen, ClipboardCheck, TrendingUp } from 'lucide-react';

export default function PrincipalAnalyticsPage() {
  const stats = [
    {
      title: 'Total Students',
      value: '1,234',
      change: '+12.5%',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Average Attendance',
      value: '94.2%',
      change: '+2.1%',
      icon: ClipboardCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Classes',
      value: '48',
      change: '+8',
      icon: BookOpen,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Performance Score',
      value: '87.5',
      change: '+5.2',
      icon: TrendingUp,
      color: 'text-secondary-foreground',
      bgColor: 'bg-secondary/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">School Analytics</h1>
        <p className="text-muted-foreground">Overview of school performance and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Daily attendance rates over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Average scores by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart />
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Classes</CardTitle>
            <CardDescription>Based on average grades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Mathematics 101', 'Science 201', 'English 102'].map((className, index) => (
                <div key={className} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-foreground">{className}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {(95 - index * 2).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                <div>
                  <p className="font-medium text-foreground">New student enrolled</p>
                  <p className="text-muted-foreground text-xs">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-accent mt-1.5" />
                <div>
                  <p className="font-medium text-foreground">Assignment submitted</p>
                  <p className="text-muted-foreground text-xs">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-secondary-foreground mt-1.5" />
                <div>
                  <p className="font-medium text-foreground">Class created</p>
                  <p className="text-muted-foreground text-xs">Yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>School calendar highlights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  Mar<br/>15
                </div>
                <div>
                  <p className="font-medium text-foreground">Parent-Teacher Meeting</p>
                  <p className="text-muted-foreground text-xs">3:00 PM - 5:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent">
                  Mar<br/>20
                </div>
                <div>
                  <p className="font-medium text-foreground">Sports Day</p>
                  <p className="text-muted-foreground text-xs">All day event</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}