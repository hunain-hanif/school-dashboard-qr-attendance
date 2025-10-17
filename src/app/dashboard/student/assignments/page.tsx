'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Upload, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Assignment {
  id: number;
  title: string;
  description: string;
  subjectId: number;
  teacherId: number;
  dueDate: string;
  totalPoints: number;
  createdAt: string;
}

interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  content: string;
  fileUrl: string | null;
  grade: number | null;
  feedback: string | null;
  submittedAt: string;
  gradedAt: string | null;
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    fileUrl: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, submissionsRes] = await Promise.all([
        fetch('/api/assignments'),
        fetch('/api/submissions'),
      ]);
      
      if (!assignmentsRes.ok || !submissionsRes.ok) throw new Error('Failed to fetch data');
      
      const assignmentsData = await assignmentsRes.json();
      const submissionsData = await submissionsRes.json();
      
      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssignment) return;
    
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          studentId: 1, // This should come from auth context
          content: formData.content,
          fileUrl: formData.fileUrl || null,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit assignment');
      
      toast.success('Assignment submitted successfully!');
      setIsDialogOpen(false);
      setSelectedAssignment(null);
      setFormData({ content: '', fileUrl: '' });
      fetchData();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    }
  };

  const getSubmission = (assignmentId: number) => {
    return submissions.find(s => s.assignmentId === assignmentId);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateBadge = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return <Badge variant="destructive">Overdue</Badge>;
    if (days === 0) return <Badge className="bg-orange-500">Due Today</Badge>;
    if (days <= 3) return <Badge className="bg-yellow-500">Due Soon</Badge>;
    return <Badge variant="outline">Upcoming</Badge>;
  };

  const getStatusBadge = (assignment: Assignment) => {
    const submission = getSubmission(assignment.id);
    if (!submission) {
      return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" /> Not Submitted</Badge>;
    }
    if (submission.grade !== null) {
      return <Badge className="bg-green-600 gap-1"><CheckCircle2 className="h-3 w-3" /> Graded</Badge>;
    }
    return <Badge className="bg-blue-600 gap-1"><CheckCircle2 className="h-3 w-3" /> Submitted</Badge>;
  };

  const pendingAssignments = assignments.filter(a => !getSubmission(a.id) && getDaysUntilDue(a.dueDate) >= 0);
  const submittedAssignments = assignments.filter(a => getSubmission(a.id));
  const overdueAssignments = assignments.filter(a => !getSubmission(a.id) && getDaysUntilDue(a.dueDate) < 0);

  const renderAssignment = (assignment: Assignment) => {
    const submission = getSubmission(assignment.id);
    
    return (
      <Card key={assignment.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{assignment.title}</CardTitle>
                  <CardDescription>{assignment.description || 'No description provided'}</CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {Math.abs(getDaysUntilDue(assignment.dueDate))} days {getDaysUntilDue(assignment.dueDate) >= 0 ? 'left' : 'overdue'}
                </div>
                <Badge variant="outline">{assignment.totalPoints} points</Badge>
                {getDueDateBadge(assignment.dueDate)}
                {getStatusBadge(assignment)}
              </div>
              {submission && submission.grade !== null && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Your Grade:</span>
                    <span className="text-lg font-bold text-green-600">{submission.grade}/{assignment.totalPoints}</span>
                  </div>
                  {submission.feedback && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Feedback:</span> {submission.feedback}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="ml-4">
              {!submission ? (
                <Button 
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setIsDialogOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Submitted
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Assignments</h1>
        <p className="text-muted-foreground">View and submit your assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingAssignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{submittedAssignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueAssignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {submittedAssignments.filter(a => {
                const sub = getSubmission(a.id);
                return sub && sub.grade !== null;
              }).length > 0
                ? Math.round(
                    submittedAssignments
                      .map(a => getSubmission(a.id))
                      .filter(s => s && s.grade !== null)
                      .reduce((sum, s) => sum + (s!.grade! || 0), 0) /
                    submittedAssignments.filter(a => {
                      const sub = getSubmission(a.id);
                      return sub && sub.grade !== null;
                    }).length
                  )
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submittedAssignments.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdueAssignments.length})</TabsTrigger>
          <TabsTrigger value="all">All ({assignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-2/3" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : pendingAssignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                <p className="text-lg font-medium text-foreground">All caught up!</p>
                <p className="text-sm text-muted-foreground">No pending assignments</p>
              </CardContent>
            </Card>
          ) : (
            pendingAssignments.map(renderAssignment)
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {submittedAssignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">No submitted assignments</p>
              </CardContent>
            </Card>
          ) : (
            submittedAssignments.map(renderAssignment)
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {overdueAssignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                <p className="text-lg font-medium text-foreground">No overdue assignments!</p>
              </CardContent>
            </Card>
          ) : (
            overdueAssignments.map(renderAssignment)
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-2/3" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">No assignments yet</p>
              </CardContent>
            </Card>
          ) : (
            assignments.map(renderAssignment)
          )}
        </TabsContent>
      </Tabs>

      {/* Submit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="content">Your Work</Label>
              <Textarea
                id="content"
                placeholder="Type your answer or paste your work here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                required
              />
            </div>
            <div>
              <Label htmlFor="fileUrl">File URL (Optional)</Label>
              <Input
                id="fileUrl"
                type="url"
                placeholder="https://..."
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload your file to a cloud service and paste the link here
              </p>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              <Upload className="h-4 w-4 mr-2" />
              Submit Assignment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}