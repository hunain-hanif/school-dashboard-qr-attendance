'use client';

import { Card } from '@/components/ui/card';
import { Activity, CheckCircle, XCircle, Clock, BookOpen, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: number;
  type: 'attendance' | 'assignment' | 'grade' | 'announcement' | 'class';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivityListProps {
  activities: ActivityItem[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  const getIcon = (type: string, status?: string) => {
    switch (type) {
      case 'attendance':
        return status === 'success' ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        );
      case 'assignment':
        return <BookOpen className="h-5 w-5 text-accent" />;
      case 'grade':
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'announcement':
        return <Activity className="h-5 w-5 text-secondary-foreground" />;
      case 'class':
        return <Users className="h-5 w-5 text-primary" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Latest updates and actions</p>
        </div>
        <Activity className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {index !== activities.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
              )}
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 relative z-10">
                  {getIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-medium text-foreground text-sm">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}