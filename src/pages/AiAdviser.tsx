import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Settings,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { fetchHistoricalData, fetchLatestReadings, SensorDataPoint } from '@/services/api';
import { cn } from '@/lib/utils';

const AiAdviser: React.FC = () => {
  const [latestData, setLatestData] = useState<SensorDataPoint | null>(null);
  const [history, setHistory] = useState<SensorDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);

  // Initial data load
// Polling for live AI predictions
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(async () => {
      try {
        const latest = await fetchLatestReadings();
        
        // 1. Only update latestData if the timestamp is actually new
        setLatestData((prevLatest) => {
          if (prevLatest && prevLatest.timestamp === latest.timestamp) {
            return prevLatest; // No change, prevents re-render
          }
          return latest;
        });
        
        // 2. Only add to history if it's a new timestamp
        setHistory((prev) => {
          if (prev.length === 0 || prev[0].timestamp !== latest.timestamp) {
            return [latest, ...prev].slice(0, 10);
          }
          return prev;
        });
      } catch (error) {
        console.error("Failed to fetch latest AI reading:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPolling]);

  // Polling for live AI predictions
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(async () => {
      try {
        const latest = await fetchLatestReadings();
        setLatestData(latest);
        
        setHistory((prev) => {
          // Only add to history log if it's a new timestamp
          if (prev.length === 0 || prev[0].timestamp !== latest.timestamp) {
            return [latest, ...prev].slice(0, 10);
          }
          return prev;
        });
      } catch (error) {
        console.error("Failed to fetch latest AI reading:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [isPolling]);

  const isHealthy = latestData?.prediction === 'HEALTHY';
  const healthyProb = (latestData?.healthy_prob ?? 0) * 100;
  const faultyProb = (latestData?.faulty_prob ?? 0) * 100;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 min-h-screen space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Bot className="w-8 h-8 text-primary" />
              AI Adviser
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time machine health predictions and anomaly detection
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex items-center gap-4"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPolling(!isPolling)}
              className={cn(
                "border-border bg-secondary text-foreground hover:bg-muted",
                isPolling && "border-primary text-primary hover:bg-primary/10"
              )}
            >
              <Activity className="w-4 h-4 mr-2" />
              {isPolling ? 'Live Updates ON' : 'Live Updates Paused'}
            </Button>
            {isLoading && <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />}
          </motion.div>
        </div>

        {/* Main Status Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Current Status Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="h-full border-border">
              <CardHeader>
                <CardTitle className="text-lg">Current System Status</CardTitle>
              </CardHeader>
              <CardContent>
                {latestData ? (
                  <div className="flex flex-col md:flex-row items-center gap-8">
                   {/* Status Indicator */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 rounded-2xl bg-secondary/50 border border-border min-w-[200px]">
                      {isHealthy ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <AlertTriangle className="w-20 h-20 text-red-500 mb-4" />
                        </motion.div>
                      )}
                      <h2 className={cn(
                        "text-2xl font-bold tracking-wider",
                        isHealthy ? "text-green-500" : "text-red-500"
                      )}>
                        {latestData.prediction || "UNKNOWN"}
                      </h2>
                      <span className="text-xs text-muted-foreground mt-2">
                        Updated: {new Date(latestData.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Probability Bars */}
                    <div className="flex-grow w-full space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Healthy Probability</span>
                          <span className="text-sm font-bold text-green-500">{healthyProb.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-green-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${healthyProb}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Faulty Probability</span>
                          <span className="text-sm font-bold text-red-500">{faultyProb.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-red-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${faultyProb}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    Waiting for sensor data...
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Machine Parameters Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Machine Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/50 flex justify-between items-center border border-border/50">
                  <span className="text-muted-foreground">RPM</span>
                  <span className="text-lg font-bold text-foreground">{latestData?.rpm ?? '--'}</span>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50 flex justify-between items-center border border-border/50">
                  <span className="text-muted-foreground">Feed</span>
                  <span className="text-lg font-bold text-foreground">{latestData?.feed ?? '--'}</span>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50 flex justify-between items-center border border-border/50">
                  <span className="text-muted-foreground">Depth</span>
                  <span className="text-lg font-bold text-foreground">{latestData?.depth ?? '--'}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Prediction History Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Predictions Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 rounded-t-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Timestamp</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Healthy Confidence</th>
                      <th className="px-4 py-3 rounded-tr-lg">Parameters (RPM/Feed/Depth)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {history.map((record, idx) => (
                        <motion.tr 
                          key={record.timestamp}
                          initial={{ opacity: 0, backgroundColor: 'rgba(var(--primary), 0.1)' }}
                          animate={{ opacity: 1, backgroundColor: 'transparent' }}
                          exit={{ opacity: 0 }}
                          className="border-b border-border hover:bg-secondary/20 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-xs font-bold",
                              record.prediction === 'HEALTHY' 
                                ? "bg-green-500/10 text-green-500" 
                                : "bg-red-500/10 text-red-500"
                            )}>
                              {record.prediction || 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {((record.healthy_prob ?? 0) * 100).toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {record.rpm ?? '-'} / {record.feed ?? '-'} / {record.depth ?? '-'}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {history.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-muted-foreground">
                          No history data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </DashboardLayout>
  );
};

export default AiAdviser;