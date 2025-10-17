'use client';

import { Card } from '@/components/ui/card';
import { Bell, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  targetAudience: string;
}

interface AnnouncementsListProps {
  announcements: Announcement[];
}

export function AnnouncementsList({ announcements }: AnnouncementsListProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Announcements</h3>
          <p className="text-sm text-muted-foreground">Latest updates and notices</p>
        </div>
        <Bell className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No announcements yet</p>
        ) : (
          announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground mb-1 truncate">{announcement.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                  announcement.targetAudience === 'all' 
                    ? 'bg-primary/10 text-primary' 
                    : announcement.targetAudience === 'teachers'
                    ? 'bg-accent/10 text-accent'
                    : 'bg-secondary/20 text-secondary-foreground'
                }`}>
                  {announcement.targetAudience}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}