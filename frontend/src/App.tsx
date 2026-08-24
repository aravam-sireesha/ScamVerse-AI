import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store";

import Layout from "./layout/Layout";

// Lazy-loaded page components for better bundle size and performance
const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UrlScanner = lazy(() => import("./pages/UrlScanner"));
const EmailScanner = lazy(() => import("./pages/EmailScanner"));
const JobScanner = lazy(() => import("./pages/JobScanner"));
const DeepfakeScanner = lazy(() => import("./pages/DeepfakeScanner"));
const ThreatIntel = lazy(() => import("./pages/ThreatIntel"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Reports = lazy(() => import("./pages/Reports"));
const ChatAssistant = lazy(() => import("./pages/ChatAssistant"));
const ScreenshotScanner = lazy(() => import("./pages/ScreenshotScanner"));
const QRScanner = lazy(() => import("./pages/QRScanner"));
const VoiceScanner = lazy(() => import("./pages/VoiceScanner"));
const About = lazy(() => import("./pages/About"));
const Profile = lazy(() => import("./pages/Profile"));

// Instantiate the TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Premium cyber loading fallback
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
    <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-xs font-mono text-cyan-400 tracking-widest animate-pulse uppercase">decrypting data terminal...</p>
  </div>
);

// Wraps every /dashboard/* page in the shared SOC Layout (sidebar + header)
const withLayout = (Page: React.ComponentType) => (
  <Layout>
    <Page />
  </Layout>
);

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public marketing entry point */}
              <Route path="/" element={<Landing />} />

              {/* Everything below lives under /dashboard/* and shares the SOC console Layout */}
              <Route path="/dashboard" element={withLayout(Dashboard)} />

              {/* Detection Workspace — one scanner per route */}
              <Route path="/dashboard/chat" element={withLayout(ChatAssistant)} />
              <Route path="/dashboard/url" element={withLayout(UrlScanner)} />
              <Route path="/dashboard/email" element={withLayout(EmailScanner)} />
              <Route path="/dashboard/screenshot" element={withLayout(ScreenshotScanner)} />
              <Route path="/dashboard/qr" element={withLayout(QRScanner)} />
              <Route path="/dashboard/voice" element={withLayout(VoiceScanner)} />
              <Route path="/dashboard/job" element={withLayout(JobScanner)} />
              <Route path="/dashboard/deepfake" element={withLayout(DeepfakeScanner)} />

              {/* Analytics & Threat Intelligence */}
              <Route path="/dashboard/analytics" element={withLayout(Analytics)} />
              <Route path="/dashboard/threat-intel" element={withLayout(ThreatIntel)} />

              {/* Investigation Reports */}
              <Route path="/dashboard/reports" element={withLayout(Reports)} />

              {/* About / Architecture */}
              <Route path="/dashboard/about" element={withLayout(About)} />

              {/* Profile & Settings */}
              <Route path="/dashboard/profile" element={withLayout(Profile)} />

              {/* Legacy top-level paths from the previous build — redirect so old links/bookmarks keep working */}
              <Route path="/chat" element={<Navigate to="/dashboard/chat" replace />} />
              <Route path="/url" element={<Navigate to="/dashboard/url" replace />} />
              <Route path="/email" element={<Navigate to="/dashboard/email" replace />} />
              <Route path="/screenshot" element={<Navigate to="/dashboard/screenshot" replace />} />
              <Route path="/qr" element={<Navigate to="/dashboard/qr" replace />} />
              <Route path="/voice" element={<Navigate to="/dashboard/voice" replace />} />
              <Route path="/job" element={<Navigate to="/dashboard/job" replace />} />
              <Route path="/deepfake" element={<Navigate to="/dashboard/deepfake" replace />} />
              <Route path="/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
              <Route path="/threat-intel" element={<Navigate to="/dashboard/threat-intel" replace />} />
              <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
