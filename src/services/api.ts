/**
 * API Service Layer
 * 
 * This file contains all API-related functions.
 * Replace the dummy implementations with actual API calls when your backend is ready.
 * 
 * Example with axios:
 * import axios from 'axios';
 * const API_BASE_URL = 'https://your-api.com/api';
 * 
 * export const fetchSensorData = async () => {
 *   const response = await axios.get(`${API_BASE_URL}/sensor-data`);
 *   return response.data;
 * };
 */

export interface SensorDataPoint {
  timestamp: string;
  mean: number;
  median: number;
  rms: number;
  stdDeviation: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  crestFactor: number;
  stdError: number;
}

export interface ChartDataPoint {
  time: string;
  value: number;
}

// Generate dummy data for development
const generateRandomValue = (base: number, variance: number): number => {
  return Number((base + (Math.random() - 0.5) * variance * 2).toFixed(4));
};

const generateTimestamp = (minutesAgo: number): string => {
  const date = new Date(Date.now() - minutesAgo * 60 * 1000);
  return date.toISOString();
};

const formatTimeForChart = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  });
};

/**
 * Fetch historical sensor data
 * Replace with actual API call when backend is ready
 */
export const fetchHistoricalData = async (): Promise<SensorDataPoint[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate 100 dummy data points
  const data: SensorDataPoint[] = [];
  for (let i = 99; i >= 0; i--) {
    data.push({
      timestamp: generateTimestamp(i * 5), // Every 5 minutes
      mean: generateRandomValue(50, 10),
      median: generateRandomValue(48, 8),
      rms: generateRandomValue(55, 12),
      stdDeviation: generateRandomValue(5, 2),
      variance: generateRandomValue(25, 10),
      skewness: generateRandomValue(0.1, 0.5),
      kurtosis: generateRandomValue(3, 1),
      crestFactor: generateRandomValue(1.5, 0.3),
      stdError: generateRandomValue(0.5, 0.2),
    });
  }

  return data;
};

/**
 * Fetch real-time chart data for a specific metric
 * Replace with actual API call when backend is ready
 */
export const fetchChartData = async (metric: keyof Omit<SensorDataPoint, 'timestamp'>): Promise<ChartDataPoint[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const baseValues: Record<string, { base: number; variance: number }> = {
    mean: { base: 50, variance: 10 },
    median: { base: 48, variance: 8 },
    rms: { base: 55, variance: 12 },
    stdDeviation: { base: 5, variance: 2 },
    variance: { base: 25, variance: 10 },
    skewness: { base: 0.1, variance: 0.5 },
    kurtosis: { base: 3, variance: 1 },
    crestFactor: { base: 1.5, variance: 0.3 },
    stdError: { base: 0.5, variance: 0.2 },
  };

  const config = baseValues[metric] || { base: 50, variance: 10 };
  const data: ChartDataPoint[] = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 10000); // Every 10 seconds
    data.push({
      time: formatTimeForChart(date),
      value: generateRandomValue(config.base, config.variance),
    });
  }

  return data;
};

/**
 * Fetch latest sensor readings
 * Replace with actual API call when backend is ready
 */
export const fetchLatestReadings = async (): Promise<SensorDataPoint> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  return {
    timestamp: new Date().toISOString(),
    mean: generateRandomValue(50, 10),
    median: generateRandomValue(48, 8),
    rms: generateRandomValue(55, 12),
    stdDeviation: generateRandomValue(5, 2),
    variance: generateRandomValue(25, 10),
    skewness: generateRandomValue(0.1, 0.5),
    kurtosis: generateRandomValue(3, 1),
    crestFactor: generateRandomValue(1.5, 0.3),
    stdError: generateRandomValue(0.5, 0.2),
  };
};

/**
 * Authentication - Dummy implementation
 * Replace with actual API call when backend is ready
 */
export const authenticateUser = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Dummy authentication
  if (username === 'admin' && password === 'admin') {
    return { success: true, message: 'Login successful' };
  }

  return { success: false, message: 'Invalid credentials' };
};
