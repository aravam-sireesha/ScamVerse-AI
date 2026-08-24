import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../store";
import { setSelectedThreat } from "../store/slices/uiSlice";
import { 
  Radio, 
  Filter, 
  Eye, 
  Globe2, 
  Network
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ThreatIntel() {
  const dispatch = useAppDispatch();
  const { threats } = useAppSelector((state) => state.threats);
  const { selectedThreatId } = useAppSelector((state) => state.ui);
  
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const selectedThreat = threats.find(t => t.id === selectedThreatId);

  // Apply filters
  const filteredThreats = threats.filter(t => {
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesSeverity = filterSeverity === "all" || t.status === filterSeverity;
    return matchesType && matchesSeverity;
  });

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
      case 'high': return 'bg-orange-500/10 text-orange-400 border border-orange-500/25';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25';
      default: return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white m-0 flex items-center gap-3">
            <Radio className="w-8 h-8 text-cyan-400 animate-pulse" />
            <span>Threat Intelligence Center</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Global SOC console tracking active campaign vectors, malware links, and voice cloning sources.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="url">URLs Only</option>
              <option value="email">Emails Only</option>
              <option value="job">Job Fraud Only</option>
              <option value="deepfake">Deepfakes Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="safe">Safe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Correlation map and Live Log Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Threat Feed List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Telemetry Streams ({filteredThreats.length})</h3>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredThreats.map((threat) => (
              <div 
                key={threat.id}
                onClick={() => dispatch(setSelectedThreat(threat.id))}
                className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  selectedThreatId === threat.id ? "border-cyan-500/80 bg-cyan-950/15" : "border-slate-800/80 hover:border-slate-700/60"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${getStatusBg(threat.status)}`}>
                    {threat.status}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate max-w-sm">{threat.target}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-mono">
                      <span>ID: {threat.id}</span>
                      <span>•</span>
                      <span className="capitalize">{threat.type} vector</span>
                      <span>•</span>
                      <span>{new Date(threat.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-cyan-400">{threat.score}% Risk</p>
                    <p className="text-[9px] text-slate-500 font-mono">IP: {threat.originIp || "N/A"}</p>
                  </div>
                  <Eye className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Topology/Correlation Graph Mockup */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Campaign Correlation</h3>

          <div className="glass-panel p-5 rounded-xl border border-slate-800 bg-slate-950/60 min-h-[300px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Network className="w-4 h-4 text-cyan-400" />
                <span>Malicious Vector Topology</span>
              </div>
              
              {/* SVG Topology Graph representation */}
              <div className="border border-slate-900 rounded bg-slate-950 p-6 flex flex-col items-center justify-center relative overflow-hidden h-44">
                <div className="absolute top-4 left-6 p-1.5 bg-rose-950 border border-rose-500/20 text-rose-500 rounded text-[9px] font-mono">IP: 185.220.101.4</div>
                <div className="absolute bottom-4 right-6 p-1.5 bg-cyan-950 border border-cyan-500/20 text-cyan-400 rounded text-[9px] font-mono">Port: 8000</div>
                <div className="w-8 h-8 rounded-full border border-cyan-500 bg-cyan-950/60 flex items-center justify-center font-bold text-cyan-400 text-[10px] animate-pulse">SOC</div>
                
                {/* SVG Connecting lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                  <line x1="30" y1="30" x2="160" y2="88" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="280" y1="140" x2="160" y2="88" stroke="#06b6d4" strokeWidth="1" />
                </svg>
              </div>
            </div>

            <p className="text-[10px] font-mono text-slate-500 leading-relaxed mt-4">
              Correlation identifies 2 alerts linking back to host <b>185.220.101.x</b> located in <b>RU (Russian Federation)</b>, targeting local administrative mail credentials.
            </p>
          </div>
        </div>

      </div>

      {/* Slide-over Threat Investigation Details panel */}
      <AnimatePresence>
        {selectedThreat && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-0 right-0 w-96 h-screen bg-slate-900/95 backdrop-blur-md border-l border-slate-800 p-8 shadow-2xl z-50 overflow-y-auto space-y-6"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-850">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Investigation Report</h3>
              <button 
                onClick={() => dispatch(setSelectedThreat(null))}
                className="text-xs text-slate-500 hover:text-white"
              >
                [ Close ]
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-mono">Alert Reference</span>
                <span className="text-xs font-mono text-cyan-400 font-bold">{selectedThreat.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-mono">Risk Assessment</span>
                <span className={`px-2 py-0.5 text-[10px] rounded font-mono font-bold uppercase ${getStatusBg(selectedThreat.status)}`}>
                  {selectedThreat.score}% Risk
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-mono">Threat Origin</span>
                <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedThreat.country || "Unknown"} ({selectedThreat.originIp})</span>
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-850 pt-4">
              <span className="text-xs text-slate-400 font-mono block">Scanned Target:</span>
              <p className="text-xs text-slate-200 font-mono bg-slate-950/80 p-3 rounded border border-slate-950 overflow-x-auto">
                {selectedThreat.target}
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-850 pt-4">
              <span className="text-xs text-slate-400 font-mono block">AI Correlation Explanation:</span>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                {selectedThreat.explanation}
              </p>
            </div>

            <div className="pt-6">
              <button
                onClick={() => {
                  dispatch(setSelectedThreat(null));
                  // Navigate to reports if analyst wants to create summary
                }}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs tracking-wider uppercase transition-colors"
              >
                Publish Incident Ticket
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ThreatIntel;
