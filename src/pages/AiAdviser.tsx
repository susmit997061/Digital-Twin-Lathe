import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, MessageCircle, Zap, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const AiAdviser: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            AI Adviser
          </h1>
          <p className="text-muted-foreground mt-1">
            Intelligent insights and recommendations for your lathe operations
          </p>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }}
                className="inline-block mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center glow-primary">
                  <Bot className="w-10 h-10 text-primary-foreground" />
                </div>
              </motion.div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                AI-Powered Insights Coming Soon
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                Our intelligent adviser will analyze your sensor data in real-time, 
                providing predictive maintenance alerts, optimization recommendations, 
                and anomaly detection.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Under Development</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Upcoming Features
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            {
              icon: <Zap className="w-6 h-6" />,
              title: "Predictive Maintenance",
              description: "AI predicts potential failures before they occur, reducing downtime and maintenance costs.",
              delay: 0.3,
            },
            {
              icon: <MessageCircle className="w-6 h-6" />,
              title: "Natural Language Queries",
              description: "Ask questions about your data in plain English and get instant, actionable insights.",
              delay: 0.4,
            },
            {
              icon: <AlertTriangle className="w-6 h-6" />,
              title: "Anomaly Detection",
              description: "Automatically detect unusual patterns in sensor readings that may indicate issues.",
              delay: 0.5,
            },
            {
              icon: <Clock className="w-6 h-6" />,
              title: "Trend Analysis",
              description: "Long-term trend analysis to optimize machine performance over time.",
              delay: 0.6,
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay }}
            >
              <Card className="bg-card border-border h-full hover:border-primary/30 transition-colors group">
                <CardHeader>
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Want to be notified when AI Adviser launches?
          </p>
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Get Notified
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AiAdviser;
