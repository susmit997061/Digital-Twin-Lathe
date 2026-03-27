
  // API Service Layer - real HTTP calls to FastAPI backend
  import axios from 'axios';

  const API_BASE_URL = 'http://13.232.112.62:8000';

  export interface SensorDataPoint {
    timestamp: string; // ISO string
    mean: number;
    median: number;
    rms: number;
    stdDeviation: number;
    variance: number;
    skewness: number;
    kurtosis: number;
    crestFactor: number;
    stdError: number;
    // optional fields from backend
    rpm?: string;
    feed?: string;
    depth?: string;
    prediction?: 'HEALTHY' | 'FAULTY';
    healthy_prob?: number;
    faulty_prob?: number;
  }

  export interface ChartDataPoint {
    time: string;
    value: number;
  }

  const formatTimeForChart = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  function toIsoTimestamp(ts: any): string {
    if (!ts) return new Date().toISOString();
    const n = Number(ts);
    if (Number.isNaN(n)) return String(ts);
    // if looks like milliseconds
    if (n > 1e12) return new Date(n).toISOString();
    // if looks like seconds
    if (n > 1e9) return new Date(n).toISOString();
    // otherwise assume seconds
    return new Date(n * 1000).toISOString();
  }

  function safeNumber(v: any, fallback = 0): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }


function generateDummyDataPoint(): SensorDataPoint {
  const isHealthy = Math.random() > 0.1;
  const healthy_prob = isHealthy ? 0.8 + Math.random() * 0.19 : 0.1 + Math.random() * 0.4;
  return {
    timestamp: new Date().toISOString(),
    mean: 2 + Math.random(),
    median: 2 + Math.random(),
    stdDeviation: 0.5 + Math.random() * 0.2,
    variance: 0.25 + Math.random() * 0.1,
    rms: 2.2 + Math.random(),
    skewness: Math.random() * 0.5,
    kurtosis: 2.5 + Math.random(),
    crestFactor: 1.5 + Math.random(),
    stdError: 0.05 + Math.random() * 0.02,
    rpm: "1200",
    feed: "0.2",
    depth: "1.0",
    prediction: isHealthy ? 'HEALTHY' : 'FAULTY',
    healthy_prob,
    faulty_prob: 1 - healthy_prob,
  };
}

export const fetchHistoricalData = async (): Promise<SensorDataPoint[]> => {
  try {
    const res = await axios.get(`${API_BASE_URL}/history`);
    const rows: any[] = res.data || [];

  
    const mapped = rows.map((r) => {

      const timestamp = r[17] ? new Date(r[17] + 'Z').toISOString() : toIsoTimestamp(r[1]); 

      return {
        timestamp,
        mean: safeNumber(r[2]),
        median: safeNumber(r[3]),
        stdDeviation: safeNumber(r[4]),
        variance: safeNumber(r[5]),
        rms: safeNumber(r[6]),
        skewness: safeNumber(r[7]),
        kurtosis: safeNumber(r[8]),
        crestFactor: safeNumber(r[9]),
        stdError: safeNumber(r[10]),
        rpm: r[11] ?? undefined,
        feed: r[12] ?? undefined,
        depth: r[13] ?? undefined,
        prediction: r[14] ?? undefined,
        healthy_prob: r[15] ?? undefined,
        faulty_prob: r[16] ?? undefined,
      } as SensorDataPoint;
    });

    return mapped;
  } catch (error) {
    console.warn("Backend down, using dummy data for history");
    const dummyData = Array.from({ length: 30 }).map((_, i) => {
      const point = generateDummyDataPoint();
      point.timestamp = new Date(Date.now() - (30 - i) * 2000).toISOString();
      return point;
    });
    return dummyData;
  }
};

  export const fetchChartData = async (metric: keyof Omit<SensorDataPoint, 'timestamp'>): Promise<ChartDataPoint[]> => {
    const history = await fetchHistoricalData();
    if (!history || history.length === 0) return [];

    const ordered = [...history].reverse();
    const last = ordered.slice(-30);

    const points: ChartDataPoint[] = last.map((p) => ({
      time: formatTimeForChart(new Date(p.timestamp)),
      value: safeNumber((p as any)[metric]),
    }));

    return points;
  };

  /**
   * Fetch latest sensor reading from backend `/latest` and map to SensorDataPoint
   */
  export const fetchLatestReadings = async (): Promise<SensorDataPoint> => {
    try {
      const res = await axios.get(`${API_BASE_URL}/latest`);
      const r = res.data;
      if (!r) {
        throw new Error('No latest data');
      }

      // map same as history single row
      const timestamp = toIsoTimestamp(r[1]);
      return {
        timestamp,
        mean: safeNumber(r[2]),
        median: safeNumber(r[3]),
        rms: safeNumber(r[6]),
        stdDeviation: safeNumber(r[4]),
        variance: safeNumber(r[5]),
        skewness: safeNumber(r[7]),
        kurtosis: safeNumber(r[8]),
        crestFactor: safeNumber(r[9]),
        stdError: safeNumber(r[10]),
        rpm: r[11] ?? undefined,
        feed: r[12] ?? undefined,
        depth: r[13] ?? undefined,
        prediction: r[14] ?? undefined,
        healthy_prob: r[15] ?? undefined,
        faulty_prob: r[16] ?? undefined,
      } as SensorDataPoint;
    } catch (error) {
      console.warn("Backend down, using dummy data for latest");
      return generateDummyDataPoint();
    }
  };


  /**
   * Authentication - keep a minimal stub until you wire real auth endpoints.
   */
  export const authenticateUser = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    // TODO: hook into real auth endpoint
    if (username === 'admin' && password === 'admin') {
      return { success: true, message: 'Login successful' };
    }
    return { success: false, message: 'Invalid credentials' };
  };
