import React, { useState } from "react";
import { useScanner } from "../hooks/useScanner";
import { Briefcase, AlertTriangle, FolderLock, ArrowRight } from "lucide-react";
import WorkspaceShell from "../components/workspace/WorkspaceShell";
import RiskGauge from "../components/workspace/RiskGauge";

function JobScanner() {
  const [jobText, setJobText] = useState("");
  const { jobScanMutation } = useScanner();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobText.trim()) return;
    jobScanMutation.mutate(jobText);
  };

  const result = jobScanMutation.data;
  const isPending = jobScanMutation.isPending;

  return (
    <WorkspaceShell
      title="Recruitment Fraud Vetting Engine"
      description="Verify job offers, contractual parameters, and recruiter descriptions for fraud signals and deposit traps."
      icon={Briefcase}
      isPending={isPending}
      hasResult={!!result}
      pendingLabel="Analyzing Recruitment Signals"
      pendingSubLabel="Payment requests, channels, check-cashing clauses..."
      gauge={result && <RiskGauge score={result.risk_score} confidence={result.confidence_score} label="Fraud Index" />}
      inputPanel={
        <form onSubmit={handleScan} className="space-y-4">
          <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Job Posting or Message Thread
          </label>
          <textarea
            placeholder="e.g. Work From Home opportunity. No experience needed. Earn up to $500/day. We will send you a check to purchase office supplies. You must pay $150 training fee upfront via Venmo..."
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-white placeholder-slate-700 min-h-[280px] focus:outline-none focus:border-cyan-500 transition-colors font-mono leading-relaxed"
            disabled={isPending}
          />
        </form>
      }
      analyzeButton={
        <button
          type="button"
          onClick={handleScan}
          disabled={isPending || !jobText.trim()}
          className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs tracking-wider uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{isPending ? "Vetting..." : "Vet Offer"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      }
      resultPanel={
        result && (
          <>
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <FolderLock className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">AI Recruiting Signature</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-400 font-mono bg-slate-950/60 p-4 rounded border border-slate-900">
                {result.ai_analysis.summary}
              </p>
              <div className="border-t border-slate-800/80 pt-4 flex justify-between text-xs">
                <span className="text-slate-400">Class</span>
                <span className="text-rose-400 font-mono font-bold">{result.risk_score > 60 ? "Advance Fee Fraud" : "Genuine Offer"}</span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-cyan-400" />
                <span>Verified Scam Indicators</span>
              </h3>
              <div className="space-y-3 pt-2">
                {result.ai_analysis.indicators.map((indicator: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 text-xs text-slate-300 font-mono bg-slate-950/40 px-4 py-3 rounded-lg border border-slate-900">
                    <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
                    <span>{indicator}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )
      }
    />
  );
}

export default JobScanner;
