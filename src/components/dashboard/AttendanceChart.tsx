'use client';

import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AttendanceChartProps {
  data: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
  }>;
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Attendance Overview</h3>
        <p className="text-sm text-muted-foreground">Weekly attendance statistics</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'var(--muted-foreground)' }}
            tickLine={{ stroke: 'var(--border)' }}
          />
          <YAxis 
            tick={{ fill: 'var(--muted-foreground)' }}
            tickLine={{ stroke: 'var(--border)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--foreground)'
            }}
          />
          <Legend 
            wrapperStyle={{ color: 'var(--foreground)' }}
          />
          <Bar dataKey="present" fill="#39cf3c" name="Present" radius={[4, 4, 0, 0]} />
          <Bar dataKey="late" fill="#ffde73" name="Late" radius={[4, 4, 0, 0]} />
          <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}