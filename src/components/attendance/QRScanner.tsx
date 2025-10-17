'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (data: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScannedRef = useRef<string>('');

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
          startScanning();
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasPermission(false);
        toast.error('Camera access denied. Please enable camera permissions.');
      }
    };

    startCamera();

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = () => {
    scanIntervalRef.current = setInterval(() => {
      captureAndDecode();
    }, 500);
  };

  const captureAndDecode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code && code.data) {
      // Prevent duplicate scans within 3 seconds
      if (code.data !== lastScannedRef.current) {
        lastScannedRef.current = code.data;
        onScan(code.data);
        
        // Reset after 3 seconds to allow rescanning
        setTimeout(() => {
          lastScannedRef.current = '';
        }, 3000);
      }
    }
  };

  if (hasPermission === false) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
        <p className="text-destructive font-medium">Camera access denied</p>
        <p className="text-sm text-muted-foreground mt-1">
          Please enable camera permissions to scan QR codes
        </p>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-64 object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 border-4 border-primary/50 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-primary rounded-lg" />
      </div>
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white text-sm font-medium bg-black/50 inline-block px-4 py-2 rounded-full">
          Position QR code within the frame
        </p>
      </div>
    </div>
  );
}