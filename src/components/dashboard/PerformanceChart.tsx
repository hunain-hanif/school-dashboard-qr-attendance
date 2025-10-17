'use client';

import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PerformanceChartProps {
  data: Array<{
    name: string;
    score: number;
    average: number;
  }>;
  title?: string;
  description?: string;
}

export function PerformanceChart({ data, title = "Performance Trend", description = "Academic performance over time" }: PerformanceChartProps) {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'var(--muted-foreground)' }}
            tickLine={{ stroke: 'var(--border)' }}
          />
          <YAxis 
            tick={{ fill: 'var(--muted-foreground)' }}
            tickLine={{ stroke: 'var(--border)' }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--foreground)'
            }}
          />
          <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#8d32e9" 
            strokeWidth={3}
            name="Your Score"
            dot={{ fill: '#8d32e9', r: 5 }}
          />
          <Line 
            type="monotone" 
            dataKey="average" 
            stroke="#39cf3c" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Class Average"
            dot={{ fill: '#39cf3c', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}