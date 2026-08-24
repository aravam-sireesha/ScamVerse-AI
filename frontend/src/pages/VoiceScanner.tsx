import React, { useState, useRef } from "react";
import { useScanner } from "../hooks/useScanner";
import { useTranslation } from "react-i18next";
import { Mic, AlertOctagon } from "lucide-react";
import WorkspaceShell from "../components/workspace/WorkspaceShell";
import RiskGauge from "../components/workspace/RiskGauge";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function VoiceScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { i18n } = useTranslation();
  const [fileName, setFileName] = useState<string | null>(null);
  const { voiceScanMutation } = useScanner();

  const processFile = async (file: File) => {
    setFileName(file.name);
    const base64 = await fileToBase64(file);
    voiceScanMutation.mutate({ audio_base64: base64, filename: file.name, language: i18n.language });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const result = voiceScanMutation.data;
  const isPending = voiceScanMutation.isPending;
  const highlighted = result?.ai_analysis?.highlighted_sentences || [];

  return (
    <WorkspaceShell
      title="Voice Scam Detection"
      description="Upload -> Speech-to-text -> NLP -> Detect scam -> Highlight suspicious sentences."
      icon={Mic}
      isPending={isPending}
      hasResult={!!result}
      pendingLabel="Transcribing & Analyzing Call"
      gauge={result && <RiskGauge score={result.risk_score} confidence={result.confidence_score} label="Scam Risk" />}
      inputPanel={
        <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center">
          <input ref={fileInputRef} type="file" accept=".mp3,.wav,.m4a,audio/*" className="hidden" onChange={handleFileChange} disabled={isPending} />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-slate-800 rounded-full border border-slate-700/80 text-cyan-400">
              <Mic className="w-7 h-7" />
            </div>
            <p className="text-[11px] font-bold text-slate-200">{fileName || "Upload a voice recording"}</p>
            <p className="text-[10px] text-slate-500 font-mono">mp3, wav, m4a</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Select Audio File
            </button>
          </div>
        </div>
      }
      analyzeButton={
        <div className="text-center text-[10px] text-slate-500 font-mono">
          Select audio on the left — transcription starts automatically.
        </div>
      }
      resultPanel={
        result && (
          <>
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Transcript (suspicious lines highlighted)</h3>
              <div className="text-xs leading-relaxed font-mono bg-slate-950/60 p-4 rounded border border-slate-900 space-y-2 max-h-96 overflow-y-auto">
                {highlighted.length > 0 ? (
                  highlighted.map((h: { sentence: string; flagged: boolean; matched_terms: string[] }, i: number) => (
                    <p key={i} className={h.flagged ? "bg-rose-950/50 border-l-2 border-rose-500 px-2 py-1 text-rose-200" : "text-slate-400"}>
                      {h.sentence}.
                    </p>
                  ))
                ) : (
                  <p className="text-slate-400 whitespace-pre-wrap">{result.transcript || "No transcript available."}</p>
                )}
              </div>
            </div>

            {result.risk_score > 60 && (
              <div className="glass-panel p-6 rounded-xl border border-rose-500/20 bg-rose-950/10 space-y-3">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Recommended Action</span>
                </div>
                <p className="text-xs leading-relaxed text-rose-200 font-mono">
                  Hang up. Never share OTPs, PINs, or bank details over the phone. Verify by calling back on the official number.
                </p>
              </div>
            )}
          </>
        )
      }
    />
  );
}

export default VoiceScanner;
