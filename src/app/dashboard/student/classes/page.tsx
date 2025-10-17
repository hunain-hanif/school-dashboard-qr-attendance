'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { School, BookOpen, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Class {
  id: number;
  name: string;
  grade: string;
  teacher_id: number;
  created_at: string;
}

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomSchedule = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const times = ['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM'];
    return `${days[Math.floor(Math.random() * days.length)]} - ${times[Math.floor(Math.random() * times.length)]}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
        <p className="text-muted-foreground">View your enrolled classes and schedules</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-6 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <School className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No classes enrolled</p>
            <p className="text-sm text-muted-foreground">Contact your school administrator for enrollment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <School className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{classItem.name}</CardTitle>
                      <CardDescription>{classItem.grade}</CardDescription>
                      <Badge variant="outline" className="mt-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        {getRandomSchedule()}
                      </Badge>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Teacher ID: {classItem.teacher_id}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      8 Assignments
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Materials
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Go to Class
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}