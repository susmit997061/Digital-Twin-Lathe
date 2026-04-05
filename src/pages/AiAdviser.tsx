import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Settings,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { fetchLatestReadings, SensorDataPoint } from '@/services/api';
import { cn } from '@/lib/utils';

// Helper function to map tool health percentage to the exact Excel recommendations
const getRecommendationDetails = (healthPercentage: number) => {
  if (healthPercentage >= 80) {
    return {
      heading: "Low Operational Risk",
      vibrationProfile: "Stable: Low amplitude, consistent frequency.",
      cause: "Normal steady-state wear; optimal cutting parameters.",
      effect: "Excellent surface finish; dimensional accuracy within limits.",
      recommendation: "Continue Operation: Monitor trend; no intervention needed.",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      themeClass: "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900",
      solutionClass: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
    };
  } else if (healthPercentage >= 60) {
    return {
      heading: "Initial Flank Wear Risk",
      vibrationProfile: "Slight Rise: Emerging peaks in the high-frequency range.",
      cause: "Initial Flank Wear; slight chatter due to MS ductility.",
      effect: "Minor increase in surface roughness (Ra); slight heat buildup.",
      recommendation: "Inspection: Check tool tip; ensure coolant flow is consistent.",
      icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
      themeClass: "bg-yellow-50/50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900",
      solutionClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
    };
  } else if (healthPercentage >= 40) {
    return {
      heading: "Medium Chipping Risk",
      vibrationProfile: "Moderate: Erratic spikes; increased RMS values.",
      cause: "Significant Crater Wear; work hardening of the MS piece.",
      effect: "Audible noise; visible \"torn\" surface finish; dimensional drift.",
      recommendation: "Action Required: Reduce Feed Rate (0.4→0.25); plan for tool change soon.",
      icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
      themeClass: "bg-orange-50/50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900",
      solutionClass: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
    };
  } else if (healthPercentage >= 20) {
    return {
      heading: "High Failure Risk",
      vibrationProfile: "High: Large amplitudes; chaotic \"knocking\" signals.",
      cause: "Chipping of the cutting edge; excessive heat/friction.",
      effect: "Poor chip formation (stringy/blue chips); risk of workpiece damage.",
      recommendation: "Critical: Index or regrind tool immediately; check tool post rigidity.",
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      themeClass: "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900",
      solutionClass: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
    };
  } else {
    return {
      heading: "Extreme Tool Rupture",
      vibrationProfile: "Extreme: Sustained high-G impacts; saturation.",
      cause: "Total Failure: Tip breakage or plastic deformation of the edge.",
      effect: "Machine stall risk; scrap workpiece; potential damage to lathe spindle.",
      recommendation: "Emergency Stop: Replace tool; perform \"Root Cause Analysis\" on parameters.",
      icon: <AlertTriangle className="w-6 h-6 text-red-700" />,
      themeClass: "bg-red-100/50 border-red-300 dark:bg-red-950/40 dark:border-red-800",
      solutionClass: "bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200"
    };
  }
};

const AiAdviser: React.FC = () => {
  const [latestData, setLatestData] = useState<SensorDataPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);

  // Consolidated Polling for live AI predictions
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(async () => {
      try {
        const latest = await fetchLatestReadings();
        setLatestData((prevLatest) => {
          if (prevLatest && prevLatest.timestamp === latest.timestamp) {
            return prevLatest; // Prevent unnecessary re-renders
          }
          setIsLoading(false);
          return latest;
        });
      } catch (error) {
        console.error("Failed to fetch latest AI reading:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPolling]);

  const isHealthy = latestData?.prediction === 'HEALTHY';
  // Standardize the metric mapping to tool health (Healthy Probability represents the Tool Health %)
  const healthyProb = (latestData?.healthy_prob ?? 0) * 100;
  
  // Get dynamic recommendations based on current tool health
  const recommendation = getRecommendationDetails(healthyProb);

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

        {/* Top Cards: Status & Parameters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Enhanced System Status Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="h-full border-border">
              <CardHeader>
                <CardTitle className="text-lg">Overall Tool Health</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center pb-6">
                {latestData ? (
                  <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-secondary/30 border border-border min-w-[300px] shadow-sm">
                    {isHealthy ? (
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <CheckCircle className="w-24 h-24 text-green-500 mb-4 mx-auto" />
                      </motion.div>
                    ) : (
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <AlertTriangle className="w-24 h-24 text-red-500 mb-4 mx-auto" />
                      </motion.div>
                    )}
                    <h2 className={cn(
                      "text-3xl font-bold tracking-wider mb-2",
                      isHealthy ? "text-green-500" : "text-red-500"
                    )}>
                      {latestData.prediction || "UNKNOWN"}
                    </h2>
                    <div className="text-xl font-semibold text-foreground bg-background/50 px-4 py-1 rounded-full border border-border/50">
                      Confidence: {healthyProb.toFixed(1)}%
                    </div>
                    <span className="text-xs text-muted-foreground mt-4">
                      Updated: {new Date(latestData.timestamp).toLocaleString()}
                    </span>
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

        {/* Dynamic Recommendations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-secondary/20 border-b border-border">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                Recommendations for Tool
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {latestData ? (
                <div className={cn("border-l-4 rounded-r-xl p-6 transition-colors duration-300", recommendation.themeClass)}>
                  <div className="flex items-center gap-3 mb-4">
                    {recommendation.icon}
                    <h3 className="text-xl font-bold text-foreground">
                      {recommendation.heading}
                    </h3>
                  </div>
                  
                  <div className="space-y-4 text-sm md:text-base ml-9">
                    <p className="text-foreground">
                      <span className="font-semibold text-muted-foreground mr-2">Vibration Profile:</span> 
                      {recommendation.vibrationProfile}
                    </p>
                    <p className="text-foreground">
                      <span className="font-semibold text-muted-foreground mr-2">Reason:</span> 
                      {recommendation.cause}
                    </p>
                    <p className="text-foreground">
                      <span className="font-semibold text-muted-foreground mr-2">Impact:</span> 
                      {recommendation.effect}
                    </p>
                    
                    <div className={cn("mt-6 p-4 rounded-lg border", recommendation.solutionClass)}>
                      <span className="font-bold mr-2">Solution:</span> 
                      {recommendation.recommendation}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  Awaiting tool health data to generate recommendations...
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </DashboardLayout>
  );
};

export default AiAdviser;