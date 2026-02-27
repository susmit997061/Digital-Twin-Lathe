import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Activity, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricChart, ChartDataPoint } from '@/components/dashboard/MetricChart';
import { fetchChartData, SensorDataPoint } from '@/services/api';
import {
  startSocket,
  stopSocket,
  subscribeSocket,
  subscribeStatus
} from "@/services/socket";
import { cn } from '@/lib/utils';

interface MetricConfig {
  key: keyof Omit<SensorDataPoint, 'timestamp'>;
  title: string;
  color: string;
  unit?: string;
}

const metricConfigs: MetricConfig[] = [
  { key: 'mean', title: 'Mean', color: 'hsl(var(--chart-1))', unit: '' },
  { key: 'median', title: 'Median', color: 'hsl(var(--chart-2))', unit: '' },
  { key: 'rms', title: 'RMS', color: 'hsl(var(--chart-3))', unit: '' },
  { key: 'stdDeviation', title: 'Std Deviation', color: 'hsl(var(--chart-4))', unit: '' },
  { key: 'variance', title: 'Variance', color: 'hsl(var(--chart-5))', unit: '' },
  { key: 'skewness', title: 'Skewness', color: 'hsl(var(--chart-6))', unit: '' },
  { key: 'kurtosis', title: 'Kurtosis', color: 'hsl(var(--chart-7))', unit: '' },
  { key: 'crestFactor', title: 'Crest Factor', color: 'hsl(var(--chart-8))', unit: '' },
  { key: 'stdError', title: 'Std Error', color: 'hsl(var(--chart-9))', unit: '' },
];

const Dashboard: React.FC = () => {
  const [chartData, setChartData] = useState<Record<string, ChartDataPoint[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [socketConnected, setSocketConnected] = useState<boolean>(false);

const isLiveRef = useRef(isLive);
  useEffect(() => {
    isLiveRef.current = isLive;
  }, [isLive]);

  const loadData = useCallback(async () => {
    try {
      const promises = metricConfigs.map(async (config) => {
        const data = await fetchChartData(config.key);
        return { key: config.key, data };
      });

      const results = await Promise.all(promises);
      const newChartData: Record<string, ChartDataPoint[]> = {};
      
      results.forEach(({ key, data }) => {
        newChartData[key] = data;
      });

      setChartData(newChartData);
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load chart data:', error);
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live updates
 useEffect(() => {
  let unsub: (() => void) | null = null;

  const handleMessage = (msg: any) => {
    console.log("WS Message:", msg);

    if (!isLiveRef.current) return;
    if (msg.mean === undefined) return;

    if (isLoading) setIsLoading(false);

    const mapped: Partial<SensorDataPoint> = {
      mean: msg.mean,
      median: msg.median,
      rms: msg.rms,
      stdDeviation: msg.std ?? msg.stdDeviation,
      variance: msg.var ?? msg.variance,
      skewness: msg.skew ?? msg.skewness,
      kurtosis: msg.kurtosis,
      crestFactor: msg.crest ?? msg.crestFactor,
      stdError: msg.stderr ?? msg.stdError,
    };

    const toMillis = (t: number) => {
      if (!t) return Date.now();
      if (t > 1e12) return t;
      return t * 1000;
    };

    const millis = toMillis(msg.timestamp || Date.now());

    const time = new Date(millis).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    setChartData((prev) => {
      const updated: Record<string, ChartDataPoint[]> = {};

      metricConfigs.forEach((config) => {
        const existing = prev[config.key] || [];

        const rawVal = (mapped as any)[config.key];
        const val = Number(rawVal);

        const newPoint = {
          time,
          value: Number.isFinite(val)
            ? val
            : (existing[existing.length - 1]?.value ?? 0)
        };

        updated[config.key] = [...existing.slice(-29), newPoint];
      });

      return updated;
    });

    setLastUpdate(new Date(millis));
  };

  startSocket();
  unsub = subscribeSocket(handleMessage);

  const unsubStatus = subscribeStatus((c) => {
    setSocketConnected(!!c);
  });

  return () => {
    if (unsub) unsub();
    if (unsubStatus) unsubStatus();
    stopSocket(); // cleanup
  };
}, []);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Sensor Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time monitoring of lathe sensor metrics
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Status */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
              isLive 
                ? "bg-accent/20 text-accent" 
                : "bg-muted text-muted-foreground"
            )}>
              {isLive ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                  </span>
                  <Wifi className="w-4 h-4" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Paused</span>
                </>
              )}
            </div>

            {/* WS Connection Status */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
              socketConnected
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            )}>
              <span className="relative flex h-2 w-2">
                <span className={cn("relative inline-flex rounded-full h-2 w-2", socketConnected ? "bg-green-600" : "bg-red-600")} />
              </span>
              <Wifi className="w-4 h-4" />
              <span>{socketConnected ? 'WS Connected' : 'WS Disconnected'}</span>
            </div>

            {/* Toggle Live */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className={cn(
                "border-border bg-secondary text-foreground hover:bg-muted",
                isLive && "border-accent text-accent hover:bg-accent/10"
              )}
            >
              <Activity className="w-4 h-4 mr-2" />
              {isLive ? 'Pause' : 'Resume'}
            </Button>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
              className="border-border bg-secondary text-foreground hover:bg-muted"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Last Update */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 text-sm text-muted-foreground"
        >
          Last updated: {lastUpdate.toLocaleTimeString()}
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {metricConfigs.map((config, index) => (
            <MetricChart
              key={config.key}
              title={config.title}
              data={chartData[config.key] || []}
              color={config.color}
              unit={config.unit}
              loading={isLoading}
              index={index}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
