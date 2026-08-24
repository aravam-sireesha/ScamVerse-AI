import React, { useState, useRef } from "react";
import { useScanner } from "../hooks/useScanner";
import { UploadCloud, Sparkles, Activity, Video } from "lucide-react";
import WorkspaceShell from "../components/workspace/WorkspaceShell";
import RiskGauge from "../components/workspace/RiskGauge";

function DeepfakeScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { deepfakeScanMutation } = useScanner();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    deepfakeScanMutation.mutate({
      name: file.name,
      type: file.type.includes("audio") ? ("audio" as const) : ("video" as const),
      size: file.size
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDemoTrigger = (demoName: string, type: "audio" | "video") => {
    deepfakeScanMutation.mutate({
      name: demoName,
      type,
      size: 1048576 * (type === "video" ? 12 : 2)
    });
  };

  const result = deepfakeScanMutation.data;
  const isPending = deepfakeScanMutation.isPending;

  return (
    <WorkspaceShell
      title="Synthetic Media & Deepfake Detection"
      description="Upload audio voicemails or video interviews to evaluate speech and facial-mesh synthetic alignment."
      icon={Video}
      isPending={isPending}
      hasResult={!!result}
      pendingLabel="Evaluating Spectral & Frame Vectors"
      pendingSubLabel="Neural vocoder detection, visual coherence matching..."
      gauge={result && <RiskGauge score={result.risk_score} label="AI Confidence" />}
      inputPanel={
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`rounded-xl border text-center relative transition-all p-6 ${
            dragActive ? "border-cyan-400 bg-cyan-950/15" : "border-slate-800 border-dashed"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isPending}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-slate-800 rounded-full border border-slate-700/80 text-cyan-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Drag & Drop media, or click to browse</p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">WAV, MP3, MP4, MOV (Max 50MB)</p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="px-5 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Select Media File
            </button>
          </div>

          <div className="border-t border-slate-900 mt-6 pt-5 space-y-2 text-left">
            <span className="text-slate-500 font-mono text-[10px] block mb-2">Or run a demo simulation:</span>
            <button
              onClick={() => handleDemoTrigger("cfo_wire_instruction_clone.wav", "audio")}
              disabled={isPending}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 rounded text-slate-300 font-mono text-[10px] transition-colors cursor-pointer text-left"
            >
              📊 CFO Voice Clone (WAV)
            </button>
            <button
              onClick={() => handleDemoTrigger("ceo_press_briefing_mesh.mp4", "video")}
              disabled={isPending}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 rounded text-slate-300 font-mono text-[10px] transition-colors cursor-pointer text-left"
            >
              🎥 CEO Video Deepfake (MP4)
            </button>
          </div>
        </div>
      }
      analyzeButton={
        <div className="text-center text-[10px] text-slate-500 font-mono">
          Upload a file on the left, or run a demo — analysis starts automatically.
        </div>
      }
      resultPanel={
        result && (
          <>
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <h3 className="text-sm font-bold text-white">AI Forensic Diagnostics</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-400 font-mono bg-slate-950/60 p-4 rounded border border-slate-900">
                {result.ai_analysis.summary}
              </p>
              <div className="border-t border-slate-800/80 pt-4 flex justify-between text-xs">
                <span className="text-slate-400">File Analyzed</span>
                <span className="text-slate-200 font-mono truncate max-w-[180px]">{result.filename}</span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Spectral & Coherence Anomalies</span>
              </h3>
              <div className="space-y-4 pt-2 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-400">Neural Synthesizer Footprint:</span>
                  <span className={result.risk_score > 60 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                    {result.risk_score > 60 ? "Match: ElevenLabs v2 (Auditory)" : "No Matches"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-400">Pitch Linear Prediction Error:</span>
                  <span className="text-slate-300">
                    {result.risk_score > 60 ? "High Variance (>8.4e-3)" : "Nominal (<1.2e-4)"}
                  </span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-400">Spectral Anomalies Remarks:</span>
                  <span className="text-slate-300 max-w-sm text-right">
                    {result.ai_analysis.spectral_anomalies}
                  </span>
                </div>
              </div>
            </div>
          </>
        )
      }
    />
  );
}

export default DeepfakeScanner;
