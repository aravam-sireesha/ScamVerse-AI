import React, { useState } from "react";
import { useScanner } from "../hooks/useScanner";
import { 
  Download, 
  Clock, 
  User, 
  Calendar,
  Layers,
  ArrowDownToLine
} from "lucide-react";

function Reports() {
  const { useReports } = useScanner();
  const { data: reports, isLoading } = useReports();
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  if (isLoading || !reports) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-slate-500">Querying incident database archives...</p>
      </div>
    );
  }

  const selectedReport = reports.find(r => r.id === activeReportId) || reports[0];

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      default: return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">SOC Incident Vetting Reports</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review, export, and generate AI compliance briefs for active threat investigations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Active Reports List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Incident Archives</h3>
          
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => setActiveReportId(report.id)}
                className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                  (activeReportId === report.id || (!activeReportId && report.id === reports[0].id))
                    ? "border-cyan-500/80 bg-cyan-950/15" 
                    : "border-slate-800 hover:border-slate-700/60"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono bg-slate-850 px-2 py-0.5 rounded text-slate-400 font-bold uppercase">
                    {report.id}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-mono rounded font-semibold uppercase ${getSeverityStyle(report.severity)}`}>
                    {report.severity}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-200 truncate">{report.title}</h4>
                
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{report.assigned_analyst}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Detailed Investigation Report Viewer */}
        <div className="lg:col-span-2 space-y-6">
          {selectedReport && (
            <div className="glass-panel p-8 rounded-xl border border-slate-800 space-y-6">
              
              {/* Report Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest uppercase">OFFICIAL COMPLIANCE RECORD</span>
                  <h2 className="text-xl font-extrabold text-white leading-tight">{selectedReport.title}</h2>
                  <p className="text-xs text-slate-500 font-mono">
                    GENERATED ON: {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => alert(`Exporting ${selectedReport.id} to PDF...`)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-200 text-xs rounded transition-colors cursor-pointer font-semibold"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>Export PDF</span>
                  </button>
                  <button 
                    onClick={() => alert(`Exporting ${selectedReport.id} JSON metadata...`)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-200 text-xs rounded transition-colors cursor-pointer font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>

              {/* AI Brief Summary */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Investigation Summary</span>
                </h3>
                <p className="text-xs leading-relaxed text-slate-400 font-mono bg-slate-950/60 p-4 rounded border border-slate-900">
                  {selectedReport.summary}
                </p>
              </div>

              {/* Mock Timeline */}
              <div className="space-y-4 pt-4 border-t border-slate-800/60">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Investigation Action Log</span>
                </h3>

                <div className="space-y-5 relative pl-4 border-l border-slate-800/80 mt-2 text-xs font-mono">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-cyan-400"></span>
                    <span className="text-slate-500">[T+00m]</span>
                    <span className="text-slate-300 ml-2">Ingested malicious artifact trigger from SMTP pipeline.</span>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-cyan-400"></span>
                    <span className="text-slate-500">[T+05m]</span>
                    <span className="text-slate-300 ml-2">Ollama AI model completed contextual matching. Confidence 94.2%.</span>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-cyan-400"></span>
                    <span className="text-slate-500">[T+12m]</span>
                    <span className="text-slate-300 ml-2">Auto-isolation: Blocked domain routing rules published to proxy server.</span>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span className="text-emerald-400 font-bold">[T+45m]</span>
                    <span className="text-slate-300 ml-2 font-bold">Investigation closed. Analyst verified block.</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Reports;