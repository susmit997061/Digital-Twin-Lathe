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

function connect() {
  if (ws) return;

  console.log("[WS] Connecting...");

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