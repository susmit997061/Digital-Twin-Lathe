import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChartDataPoint {
  time: string;
  value: number;
}

interface MetricChartProps {
  title: string;
  data: ChartDataPoint[];
  color: string;
  unit?: string;
  loading?: boolean;
  index?: number;
}

// 1. WRAPPED IN React.memo TO PREVENT UNNECESSARY RE-RENDERS
export const MetricChart: React.FC<MetricChartProps> = React.memo(({
  title,
  data,
  color,
  unit = '',
  loading = false,
  index = 0,
}) => {
  const { currentValue, previousValue, trend, trendPercent } = useMemo(() => {
    if (!data || data.length < 2) {
      return { currentValue: 0, previousValue: 0, trend: 'neutral', trendPercent: 0 };
    }
    
    const current = data[data.length - 1]?.value || 0;
    const previous = data[data.length - 2]?.value || 0;
    const percent = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
    
    let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
    if (percent > 0.5) trendDirection = 'up';
    else if (percent < -0.5) trendDirection = 'down';
    
    return {
      currentValue: current,
      previousValue: previous,
      trend: trendDirection,
      trendPercent: Math.abs(percent),
    };
  }, [data]);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="bg-card border-border hover:border-primary/30 transition-colors group">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {title}
            </CardTitle>
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend === 'up' && "bg-accent/20 text-accent",
              trend === 'down' && "bg-destructive/20 text-destructive",
              trend === 'neutral' && "bg-muted text-muted-foreground"
            )}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend === 'neutral' && <Minus className="w-3 h-3" />}
              <span>{trendPercent.toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {currentValue.toFixed(4)}
            </span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  strokeOpacity={0.5} 
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  tickFormatter={(tick) => {
                    if (typeof tick === 'string' && tick.includes(':')) {
                      const parts = tick.split(':');
                      return parts.length >= 2 ? `${parts[1]}:${parts[2] || '00'}` : tick;
                    }
                    return tick;
                  }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toFixed(1)}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  formatter={(value: number) => [value.toFixed(4), title]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: color }}
                  isAnimationActive={false} // 2. CRITICAL: DISABLES ANIMATION FOR REAL-TIME
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

MetricChart.displayName = 'MetricChart';