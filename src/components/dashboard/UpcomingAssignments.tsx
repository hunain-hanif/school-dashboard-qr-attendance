'use client';

import { Card } from '@/components/ui/card';
import { ClipboardList, Calendar, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, isPast, differenceInDays } from 'date-fns';

interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  totalPoints: number;
  subjectId?: number;
}

interface UpcomingAssignmentsProps {
  assignments: Assignment[];
}

export function UpcomingAssignments({ assignments }: UpcomingAssignmentsProps) {
  const sortedAssignments = [...assignments]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const getUrgencyColor = (dueDate: string) => {
    const daysUntilDue = differenceInDays(new Date(dueDate), new Date());
    if (daysUntilDue < 0) return 'text-red-600 bg-red-50 dark:bg-red-950/20';
    if (daysUntilDue <= 2) return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
    if (daysUntilDue <= 7) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
    return 'text-green-600 bg-green-50 dark:bg-green-950/20';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Upcoming Assignments</h3>
          <p className="text-sm text-muted-foreground">Assignments due soon</p>
        </div>
        <ClipboardList className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-3">
        {sortedAssignments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming assignments</p>
        ) : (
          sortedAssignments.map((assignment) => {
            const isOverdue = isPast(new Date(assignment.dueDate));
            
            return (
              <div 
                key={assignment.id} 
                className="p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground mb-1 truncate">{assignment.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {isOverdue ? 'Overdue' : formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(assignment.dueDate)}`}>
                      {assignment.totalPoints} pts
                    </span>
                    {isOverdue && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}