import React from "react";
import { useScanner, ThreatTypeDist } from "../hooks/useScanner";
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  Cpu
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";

function Analytics() {
  const { useAnalytics } = useScanner();
  const { data: metrics, isLoading } = useAnalytics();

  if (isLoading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-slate-500">Querying analytics telemetry database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">Performance & Incident Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">
          Historical trends, classification distributions, and machine learning accuracy stats.
        </p>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">Vetted Records</span>
          <p className="text-2xl font-black text-white mt-1">{metrics.totalScans}</p>
          <div className="h-1 w-full bg-slate-900 rounded overflow-hidden mt-3">
            <div className="h-full bg-cyan-400" style={{ width: "100%" }}></div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">Identified Malicious Attacks</span>
          <p className="text-2xl font-black text-rose-500 mt-1">{metrics.threatsBlocked}</p>
          <div className="h-1 w-full bg-slate-900 rounded overflow-hidden mt-3">
            <div className="h-full bg-rose-500" style={{ width: `${(metrics.threatsBlocked / metrics.totalScans * 100).toFixed(0)}%` }}></div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">Vetted Safe Items</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">{metrics.safeProcessed}</p>
          <div className="h-1 w-full bg-slate-900 rounded overflow-hidden mt-3">
            <div className="h-full bg-emerald-500" style={{ width: `${(metrics.safeProcessed / metrics.totalScans * 100).toFixed(0)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trend Line Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Weekly Alert Ingestion Trends</span>
          </h3>

          <div className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="URLs" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Emails" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Deepfakes" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-cyan-400" />
            <span>Vector Distribution</span>
          </h3>

          <div className="h-64 pt-4 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={metrics.threatTypesDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.threatTypesDistribution.map((entry: ThreatTypeDist, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Manual Legend to conserve space */}
            <div className="flex flex-wrap justify-center gap-4 text-[10px] font-mono mt-2 text-slate-400">
              {metrics.threatTypesDistribution.map((item: ThreatTypeDist) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Model Performance Metrics */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-6">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Ollama & XGBoost Core Model Efficiency Metrics</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-900 text-center">
            <span className="text-[10px] font-mono text-slate-500 tracking-wider">PRECISION</span>
            <p className="text-2xl font-black text-white mt-1">{metrics.modelMetrics.precision}%</p>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-900 text-center">
            <span className="text-[10px] font-mono text-slate-500 tracking-wider">RECALL</span>
            <p className="text-2xl font-black text-white mt-1">{metrics.modelMetrics.recall}%</p>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-900 text-center">
            <span className="text-[10px] font-mono text-slate-500 tracking-wider">F1-SCORE</span>
            <p className="text-2xl font-black text-cyan-400 mt-1">{metrics.modelMetrics.f1}%</p>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-900 text-center">
            <span className="text-[10px] font-mono text-slate-500 tracking-wider">LATENCY (MS)</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{metrics.modelMetrics.latencyMs}ms</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
