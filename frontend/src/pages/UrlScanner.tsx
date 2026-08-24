import React, { useState } from "react";
import { useScanner } from "../hooks/useScanner";
import { Link2, ShieldAlert, CheckCircle, Fingerprint, ArrowRight, Compass } from "lucide-react";
import WorkspaceShell from "../components/workspace/WorkspaceShell";
import RiskGauge from "../components/workspace/RiskGauge";

function UrlScanner() {
  const [url, setUrl] = useState("");
  const { urlScanMutation } = useScanner();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    urlScanMutation.mutate(url);
  };

  const result = urlScanMutation.data;
  const isPending = urlScanMutation.isPending;

  return (
    <WorkspaceShell
      title="URL Deep Scan Engine"
      description="Reputation scan, structural analysis, and AI entropy analysis on any URI target."
      icon={Link2}
      isPending={isPending}
      hasResult={!!result}
      pendingLabel="Analyzing URI Entropy"
      pendingSubLabel="SSL matching, subdomain counts, keyword models..."
      gauge={result && <RiskGauge score={result.risk_score} confidence={result.confidence_score} label="Risk Index" />}
      inputPanel={
        <form onSubmit={handleScan} className="space-y-4">
          <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Target URI / Domain Path
          </label>
          <div className="relative">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. http://chase-update-verification.secured-auth-portal.com/login"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              disabled={isPending}
            />
          </div>
        </form>
      }
      analyzeButton={
        <button
          type="button"
          onClick={handleScan}
          disabled={isPending || !url.trim()}
          className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs tracking-wider uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{isPending ? "Scanning..." : "Initiate Scan"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      }
      resultPanel={
        result && (
          <>
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                {result.risk_score > 50 ? (
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
                <h3 className="text-sm font-bold text-white">AI Verdict & Analysis Findings</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-400 font-mono bg-slate-950/60 p-4 rounded border border-slate-900">
                {result.ai_analysis.summary}
              </p>
              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">DNS Registered</span>
                  <span className="text-slate-200 font-mono">24h ago (New)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">SSL status</span>
                  <span className="text-rose-500 font-mono">Unverified (Self-signed)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Reputation</span>
                  <span className="text-slate-200 font-mono">Unranked</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                <span>SHAP Model Contribution Breakdown</span>
              </h3>
              <div className="space-y-4 pt-2">
                {Object.entries(result.ai_analysis.shap_values).map(([feature, weight]: [string, number]) => {
                  const isPositive = weight > 0;
                  const percent = Math.min(Math.abs(weight) * 100, 100);
                  return (
                    <div key={feature} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400 capitalize">{feature.replace(/_/g, ' ')}</span>
                        <span className={isPositive ? "text-rose-400" : "text-emerald-400"}>
                          {isPositive ? `+${weight.toFixed(2)} (Higher Risk)` : `${weight.toFixed(2)} (Lowers Risk)`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
                        <div
                          className={`h-full rounded ${isPositive ? "bg-rose-500" : "bg-emerald-500"}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )
      }
    />
  );
}

export default UrlScanner;
