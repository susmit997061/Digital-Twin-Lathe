import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background dark">
      <AppSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <motion.main
        animate={{ 
          marginLeft: sidebarCollapsed ? 72 : 256,
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "min-h-screen pt-14 md:pt-0",
          "transition-all duration-200"
        )}
        style={{ marginLeft: 0 }}
      >
        <div className="hidden md:block" style={{ marginLeft: sidebarCollapsed ? 72 : 256 }}>
          {children}
        </div>
        <div className="md:hidden">
          {children}
        </div>
      </motion.main>
    </div>
  );
};
