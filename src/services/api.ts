
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

  /**
   * Fetch historical sensor data from backend `/history`.
   * Backend returns rows from SQLite; map them into SensorDataPoint objects.
   */
  export const fetchHistoricalData = async (): Promise<SensorDataPoint[]> => {
    const res = await axios.get(`${API_BASE_URL}/history`);
    const rows: any[] = res.data || [];

    // each row is the tuple inserted into the DB. Column order in server:
    // id, timestamp, mean, median, std, var, rms, skew, kurtosis, crest, stderr, rpm, feed, depth, prediction, healthy_prob, faulty_prob, created_at
    const mapped = rows.map((r) => {
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
    });

    return mapped;
  };

  /**
   * Fetch chart data for a metric by using historical data and returning
   * the last 30 points formatted for charts.
   */
  export const fetchChartData = async (metric: keyof Omit<SensorDataPoint, 'timestamp'>): Promise<ChartDataPoint[]> => {
    const history = await fetchHistoricalData();
    if (!history || history.length === 0) return [];

    // ensure chronological order (history endpoint returns latest first)
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
