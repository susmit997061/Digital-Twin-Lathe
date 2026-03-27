const WS_URL =
  window.location.protocol === "https:"
    ? "wss://13.232.112.62:8000/ws"
    : "ws://13.232.112.62:8000/ws";

let ws: WebSocket | null = null;
let reconnectTimer: number | null = null;

const messageSubscribers = new Set<(msg: any) => void>();
const statusSubscribers = new Set<(connected: boolean) => void>();

let connected = false;

/* ------------------ CONNECT ------------------ */

let mockInterval: number | null = null;

function startMockData() {
  if (mockInterval) return;
  mockInterval = window.setInterval(() => {
    if (connected) return;
    const isHealthy = Math.random() > 0.1;
    const healthy_prob = isHealthy ? 0.8 + Math.random() * 0.19 : 0.1 + Math.random() * 0.4;
    const msg = {
      timestamp: Date.now(),
      mean: 2 + Math.random(),
      median: 2 + Math.random(),
      std: 0.5 + Math.random() * 0.2, // socket components expect 'std' or 'stdDeviation'
      var: 0.25 + Math.random() * 0.1,
      rms: 2.2 + Math.random(),
      skew: Math.random() * 0.5,
      kurtosis: 2.5 + Math.random(),
      crest: 1.5 + Math.random(),
      stderr: 0.05 + Math.random() * 0.02,
      rpm: "1200",
      feed: "0.2",
      depth: "1.0",
      prediction: isHealthy ? "HEALTHY" : "FAULTY",
      healthy_prob,
      faulty_prob: 1 - healthy_prob
    };
    messageSubscribers.forEach(cb => cb(msg));
  }, 2000);
}

function stopMockData() {
  if (mockInterval) {
    clearInterval(mockInterval);
    mockInterval = null;
  }
}

function connect() {
  if (ws) return;

  console.log("[WS] Connecting...");

  startMockData(); // start emitting dummy data if offline

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    connected = true;
    console.log("[WS] Connected");
    statusSubscribers.forEach(cb => cb(true));
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("[WS] Incoming:", data);
      messageSubscribers.forEach(cb => cb(data));
    } catch (e) {
      console.error("[WS] Parse error:", e);
    }
  };

  ws.onclose = () => {
    console.log("[WS] Disconnected");

    connected = false;
    statusSubscribers.forEach(cb => cb(false));

    ws = null;

    reconnectTimer = window.setTimeout(() => {
      connect();
    }, 2000);
  };

  ws.onerror = (err) => {
    console.error("[WS] Error:", err);
  };
}

/* ------------------ PUBLIC API ------------------ */

export function startSocket() {
  connect();
}

export function stopSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  stopMockData();

  if (ws) {
    ws.close();
    ws = null;
  }
}

export function subscribeSocket(callback: (msg: any) => void) {
  messageSubscribers.add(callback);
  connect();

  return () => {
    messageSubscribers.delete(callback);
  };
}

export function subscribeStatus(callback: (connected: boolean) => void) {
  statusSubscribers.add(callback);

  // Immediately inform current status
  callback(connected);

  return () => {
    statusSubscribers.delete(callback);
  };
}