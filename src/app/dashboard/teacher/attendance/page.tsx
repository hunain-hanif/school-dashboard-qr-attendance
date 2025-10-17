'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const QRScanner = dynamic(() => import('@/components/attendance/QRScanner'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted h-64 rounded-lg" />
});

export default function TeacherAttendancePage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedStudents, setScannedStudents] = useState<Array<{
    id: string;
    name: string;
    timestamp: Date;
  }>>([]);

  const handleScan = async (studentId: string) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          status: 'present',
          date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark attendance');
      }

      const data = await response.json();
      
      // Fetch student details
      const studentResponse = await fetch(`/api/users?id=${studentId}`);
      const studentData = await studentResponse.json();

      setScannedStudents(prev => [...prev, {
        id: studentId,
        name: studentData.name || 'Unknown Student',
        timestamp: new Date(),
      }]);

      toast.success('Attendance marked successfully!');
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">QR Attendance</h1>
        <p className="text-muted-foreground">Scan student QR codes to mark attendance</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>
              Position the student QR code within the camera view
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isScanning ? (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-12 text-center">
                  <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Camera is off</p>
                </div>
                <Button 
                  onClick={() => setIsScanning(true)} 
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Start Scanning
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <QRScanner onScan={handleScan} />
                <Button 
                  onClick={() => setIsScanning(false)} 
                  variant="outline"
                  className="w-full"
                >
                  Stop Scanning
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scanned Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Scanned Students</CardTitle>
            <CardDescription>
              {scannedStudents.length} student{scannedStudents.length !== 1 ? 's' : ''} marked present
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scannedStudents.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No students scanned yet</p>
                <p className="text-sm text-muted-foreground">Start scanning to mark attendance</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {scannedStudents.map((student, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}