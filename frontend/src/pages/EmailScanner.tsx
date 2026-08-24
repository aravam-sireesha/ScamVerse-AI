import React, { useState } from "react";
import { useScanner } from "../hooks/useScanner";
import { Mail, FileWarning, CornerDownRight, AlertOctagon, Sparkles } from "lucide-react";
import WorkspaceShell from "../components/workspace/WorkspaceShell";
import RiskGauge from "../components/workspace/RiskGauge";

function EmailScanner() {
  const [emailText, setEmailText] = useState("");
  const { emailScanMutation } = useScanner();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailText.trim()) return;
    emailScanMutation.mutate(emailText);
  };

  const result = emailScanMutation.data;
  const isPending = emailScanMutation.isPending;

  return (
    <WorkspaceShell
      title="Social Engineering & Email Analyzer"
      description="Paste email headers and content to analyze linguistic pressure, fraud patterns, and sender anomalies."
      icon={Mail}
      isPending={isPending}
      hasResult={!!result}
      pendingLabel="Evaluating Semantic Tone"
      pendingSubLabel="Layout vectors, authority indicators, spoofing headers..."
      gauge={result && <RiskGauge score={result.risk_score} confidence={result.confidence_score} label="Scam Score" />}
      inputPanel={
        <form onSubmit={handleScan} className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Paste Email Content
            </label>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Raw SMTP OK</span>
          </div>
          <textarea
            placeholder="e.g. From: ceo@yourcompany-inc.com&#10;Subject: URGENT: Wire Transfer Authorization Required Today..."
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-white placeholder-slate-700 min-h-[280px] focus:outline-none focus:border-cyan-500 transition-colors font-mono leading-relaxed"
            disabled={isPending}
          />
        </form>
      }
      analyzeButton={
        <button
          type="button"
          onClick={handleScan}
          disabled={isPending || !emailText.trim()}
          className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs tracking-wider uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{isPending ? "Running NLP..." : "Analyze Correspondence"}</span>
        </button>
      }
      resultPanel={
        result && (
          <>
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">AI Linguistic Analysis</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-400 font-mono bg-slate-950/60 p-4 rounded border border-slate-900">
                {result.ai_analysis.summary}
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-cyan-400" />
                <span>Flagged Linguistic Indicators</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {result.ai_analysis.indicators.map((indicator: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-slate-300 font-mono bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                    <CornerDownRight className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{indicator}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-rose-500/20 bg-rose-950/10 space-y-3">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                <AlertOctagon className="w-4 h-4" />
                <span>SecOps Playbook Instructions</span>
              </div>
              <p className="text-xs leading-relaxed text-rose-200 font-mono">
                {result.ai_analysis.suggested_action}
              </p>
            </div>
          </>
        )
      }
    />
  );
}

export default EmailScanner;
