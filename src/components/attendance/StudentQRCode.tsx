'use client';

import { Card } from '@/components/ui/card';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentQRCodeProps {
  qrCode: string;
  studentName: string;
  studentId: number;
}

export function StudentQRCode({ qrCode, studentName, studentId }: StudentQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;
    
    setIsGenerating(true);
    try {
      await QRCode.toCanvas(canvasRef.current, qrCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#181824',
          light: '#ffffff',
        },
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [qrCode]);

  const downloadQRCode = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `attendance-qr-${studentName.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-8 flex flex-col items-center justify-center">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">Your Attendance QR Code</h3>
          <p className="text-sm text-muted-foreground">Present this to your teacher</p>
        </div>
        
        <div className="relative mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <canvas ref={canvasRef} className="block" />
          </div>
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-2xl">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            </div>
          )}
        </div>

        <div className="text-center mb-4">
          <p className="text-sm font-medium text-foreground">{studentName}</p>
          <p className="text-xs text-muted-foreground">Student ID: {studentId}</p>
        </div>

        <Button onClick={downloadQRCode} variant="outline" className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Download QR Code
        </Button>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Instructions</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-semibold">
              1
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Show Your QR Code</h4>
              <p className="text-sm text-muted-foreground">
                Present this QR code to your teacher when they take attendance
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 font-semibold">
              2
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Teacher Scans</h4>
              <p className="text-sm text-muted-foreground">
                Your teacher will scan the code using their device
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center flex-shrink-0 font-semibold">
              3
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Attendance Marked</h4>
              <p className="text-sm text-muted-foreground">
                Your attendance will be automatically recorded in the system
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <span className="text-primary">💡</span> Pro Tips
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Keep your QR code accessible on your device</li>
            <li>• You can download it for offline use</li>
            <li>• Make sure your screen brightness is adequate</li>
            <li>• Don't share your QR code with others</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}