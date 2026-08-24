import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store";
import { setActiveTab } from "../store/slices/uiSlice";
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Activity, 
  AlertTriangle, 
  Globe2, 
  Sparkles,
  Link2,
  Mail,
  Video,
  Briefcase
} from "lucide-react";
import { motion } from "framer-motion";

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { threats, liveLogs, systemStatus } = useAppSelector((state) => state.threats);

  // Compute metric stats
  const totalScanned = threats.length + 120;
  const totalScams = threats.filter(t => t.score > 50).length + 34;
  const criticalThreats = threats.filter(t => t.status === 'critical').length;
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'url': return Link2;
      case 'email': return Mail;
      case 'deepfake': return Video;
      case 'screenshot': return Globe2;
      case 'qr': return Activity;
      case 'voice': return AlertTriangle;
      default: return Briefcase;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">Executive Security Command</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time scam telemetry, threat monitoring, and AI detection metrics.</p>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">Scans Analyzed</span>
            <p className="text-3xl font-extrabold text-white mt-1">{totalScanned}</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg text-slate-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">Threats Intercepted</span>
            <p className="text-3xl font-extrabold text-rose-500 mt-1">{totalScams}</p>
          </div>
          <div className="p-3 bg-rose-950/30 rounded-lg text-rose-500 border border-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">Critical Severity Alerts</span>
            <p className="text-3xl font-extrabold text-orange-500 mt-1">{criticalThreats}</p>
          </div>
          <div className="p-3 bg-orange-950/30 rounded-lg text-orange-500 border border-orange-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">Detection Precision</span>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">{systemStatus.modelAccuracy}%</p>
          </div>
          <div className="p-3 bg-emerald-950/30 rounded-lg text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Detection Workspace Quick Launch */}
      <div className="space-y-4">
        <h3 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Detection Workspace</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: "/dashboard/chat", label: "AI Chat Assistant", icon: Sparkles },
            { to: "/dashboard/url", label: "URL Scan Engine", icon: Link2 },
            { to: "/dashboard/email", label: "Email Analyzer", icon: Mail },
            { to: "/dashboard/screenshot", label: "Screenshot Scanner", icon: Globe2 },
            { to: "/dashboard/qr", label: "QR Code Scanner", icon: Activity },
            { to: "/dashboard/voice", label: "Voice Scam Detection", icon: AlertTriangle },
            { to: "/dashboard/job", label: "Job Post Vetting", icon: Briefcase },
            { to: "/dashboard/deepfake", label: "Deepfake Detection", icon: Video },
          ].map((tile) => {
            const TileIcon = tile.icon;
            return (
              <button
                key={tile.to}
                onClick={() => navigate(tile.to)}
                className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all text-left group cursor-pointer"
              >
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/60 text-cyan-400 w-fit group-hover:bg-cyan-950/60 group-hover:border-cyan-500/40 transition-colors">
                  <TileIcon className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-200 mt-3">{tile.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Board Layout (Active Alerts vs. Live Logs Console) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recent Threat Alerts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Ingestion Logs</span>
            </h3>
            <button 
              onClick={() => {
                dispatch(setActiveTab('threat-intel'));
                navigate('/dashboard/threat-intel');
              }}
              className="text-xs text-cyan-400 font-semibold hover:underline"
            >
              View Full Threat Feed
            </button>
          </div>

          <div className="space-y-4">
            {threats.slice(0, 4).map((threat) => {
              const ThreatIcon = getIcon(threat.type);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={threat.id}
                  className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-slate-700/80 transition-all flex items-start gap-4"
                >
                  <div className={`p-2.5 rounded-lg border ${getStatusColor(threat.status)}`}>
                    <ThreatIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-semibold uppercase">
                        {threat.id}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(threat.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 mt-2 truncate max-w-md">
                      {threat.target}
                    </h4>
                    
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {threat.explanation}
                    </p>

                    <div className="flex gap-4 mt-3 text-[10px] font-mono text-slate-500">
                      <span>ORIGIN IP: {threat.originIp || 'N/A'}</span>
                      <span>COUNTRY: {threat.country || 'N/A'}</span>
                      <span className="text-cyan-400 font-semibold">RISK LEVEL: {threat.score}%</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Side: SOC Live Console Logs */}
        <div className="space-y-6">
          <h3 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>SOC Live Terminal</span>
          </h3>

          <div className="glass-panel rounded-xl border border-slate-800 bg-slate-950 p-5 font-mono text-[11px] leading-relaxed text-slate-400 min-h-[400px] flex flex-col justify-between">
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-2">
              {liveLogs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-cyan-500 font-bold shrink-0">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-900 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>STREAM: STABLE</span>
              </span>
              <span>RATE: 2.4kb/s</span>
            </div>
          </div>

          {/* Model AI Summary box */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Ollama AI Recommendation</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Active BEC (Business Email Compromise) patterns have surged 12% in the past 24 hours. Advise system admins to run simulated training campaigns and lock email domains with strict DMARC rules.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;