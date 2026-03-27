# Digital Twin Lathe - Dashboard & AI Adviser

Welcome to the **Digital Twin Lathe** portal! This project is a modern, real-time web application designed to monitor industrial lathe machinery, visualize vibration/sensor profiles, and utilize AI predictions for predictive maintenance. 

This `README.md` is structured not only to guide developers through setup but also to serve as a comprehensive preparation sheet for oral project presentations.

---

## 🌟 Key Features

1. **Real-Time Telemetry Dashboard** 
   - Uses WebSockets to stream high-frequency sensor metrics.
   - Live visual charts plotted using `recharts` for parameters such as Mean, Median, RMS, Standard Deviation, Variance, Skewness, Kurtosis, and Crest Factor.

2. **AI Adviser (Predictive Maintenance)**
   - Consumes AI models from the backend to analyze machine health (`HEALTHY` vs `FAULTY`).
   - Maps probability scores to actionable recommendations (e.g., *Initial Flank Wear Risk*, *Extreme Tool Rupture*).
   - Suggests real-time interventions such as reducing feed rates or immediate tool indexing based on dynamic vibration profiles.

3. **Historical Data Logs**
   - A dedicated pane displaying historical logs in a rich, paginated data table.
   - Dynamic column filtering and full-text search.
   - Built-in one-click **Export to Excel** feature.

4. **Fault Tolerance (Dummy Fallback System)**
   - Uninterrupted presentation capabilities.
   - If the backend goes down or the WebSocket connection drops, the frontend automatically intercepts the failure and simulates realistic mock sensor data to keep the UI fully operational during demonstrations.

---

## 💻 Technology Stack

### Frontend Core
* **Framework**: React 18, TypeScript, Vite
* **Routing**: React Router v6
* **State & Data Fetching**: React Query (`@tanstack/react-query`), Axios
* **Real-time Comms**: Native WebSockets

### UI & Styling
* **Styling**: Tailwind CSS, PostCSS
* **Component Library**: shadcn/ui (powered by Radix UI primitives)
* **Icons & Animation**: Lucide React, Framer Motion
* **Charting**: Recharts

---

## 🏗️ Project Architecture

```text
src/
├── components/   # Reusable UI components (shadcn/ui, layout components, metric charts)
├── contexts/     # globally shared state (e.g., AuthContext)
├── pages/        # Main application routes:
│   ├── Login.tsx          # Stubbed authentication portal
│   ├── Dashboard.tsx      # Real-time WebSocket charting
│   ├── AiAdviser.tsx      # HTTP-polled AI tool analytics and recommendations
│   └── HistoricalData.tsx # Historical table with Excel export capabilities
├── services/     # Core communication layers:
│   ├── api.ts             # Axios HTTP wrappers + Mock Data Generators
│   └── socket.ts          # WebSocket managers + Offline Mock Intervals
```

---

## 🚀 Setup & Installation

**Prerequisites:** Node.js (v18+) and npm/bun.

1. **Install Dependencies**
   ```bash
   npm install
   ```
2. **Run Development Server**
   ```bash
   npm run dev
   ```
3. **Build for Production**
   ```bash
   npm run build
   ```

*(Note: The default theme is locked to **dark mode** in `App.tsx` for an industrial, high-contrast aesthetic).*

---

## 🎤 Preparation for Presentation 

If you are defending or presenting this project during an academic or professional review, these talking points are critical to demonstrate systematic understanding:

### 1. The "Why" behind the Digital Twin Lathe
**Problem:** Traditional lathe operations rely on reactive maintenance—waiting for a cutting tool to break before fixing it resulting in scrapped workpieces and downtime. 
**Solution:** The Digital Twin creates a virtual live replica. By monitoring vibration metrics (like RMS, Skewness, Kurtosis), we can perform predictive maintenance, saving operational costs and maintaining dimensional accuracy.

### 2. The Data Flow Pipeline
Explain how data moves from hardware to the screen:
> *"Sensors capture hardware vibrations and encode them. A Python backend processes these signals, calculates mathematical features (like Crest Factor), runs inference via an AI model to guess the tool health, and streams the unified JSON payload through WebSockets directly into our React Dashboard for real-time `recharts` mapping."*

### 3. Interpreting AI Probabilities
Be prepared to explain the `AiAdviser.tsx` logic. State that the AI does not just output "Faulty". It outputs a *probability score*. The UI maps this percentage to specific risk profiles (e.g., `>=80%` means optimal parameters, `<40%` indicates significant crater wear). This turns abstract numbers into human-readable industrial advice.

### 4. Robustness & The Demo-Safe Architecture
Mention your fault tolerance mechanism!
> *"In a real-world edge environment, network constraints are common. To account for this, the application has built-in graceful degradation. If the backend disconnects, our `socket.ts` and `api.ts` layers seamlessly transition to pseudo-random dummy generators that mimic organic machine behavior. This ensures the dashboard doesn't crash from undefined errors but instead alerts the user to the offline status while keeping visual continuity alive."*

### 5. Why the Specific Tech Choices?
* **Vite + React:** Chosen for incredibly fast HMR (Hot Module Replacement) during development and optimized bundled deliverables.
* **shadcn/ui + Tailwind:** Provides pixel-perfect, accessible, and easily customizable UI without the bloated overhead of traditional component libraries like Material-UI.
* **WebSockets over HTTP Polling:** Polling (HTTP GET every 1s) overloads server headers. WebSockets provide a persistent, bi-directional tunnel necessary for latency-sensitive streaming (e.g., rendering machine RPM).
