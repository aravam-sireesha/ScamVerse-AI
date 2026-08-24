import React, { useState, useRef } from "react";
import { useScanner } from "../hooks/useScanner";
import { ImageUp, ScanText, FileWarning, Sparkles } from "lucide-react";
import WorkspaceShell from "../components/workspace/WorkspaceShell";
import RiskGauge from "../components/workspace/RiskGauge";

type SourceHint = "whatsapp" | "email" | "sms" | "unknown";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ScreenshotScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [sourceHint, setSourceHint] = useState<SourceHint>("whatsapp");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { screenshotScanMutation } = useScanner();

  const processFile = async (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    const base64 = await fileToBase64(file);
    screenshotScanMutation.mutate({ image_base64: base64, source_hint: sourceHint });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const result = screenshotScanMutation.data;
  const isPending = screenshotScanMutation.isPending;

  const sourceOptions: { key: SourceHint; label: string }[] = [
    { key: "whatsapp", label: "WhatsApp" },
    { key: "email", label: "Email" },
    { key: "sms", label: "SMS" },
    { key: "unknown", label: "Other" }
  ];

  return (
    <WorkspaceShell
      title="Screenshot Scanner"
      description="WhatsApp, Email, or SMS screenshot: Image -> OCR -> Extract text -> LLM/NLP Analysis -> Risk Score."
      icon={ImageUp}
      isPending={isPending}
      hasResult={!!result}
      pendingLabel="Running OCR & NLP Analysis"
      gauge={result && <RiskGauge score={result.risk_score} confidence={result.confidence_score} label="Scam Risk" />}
      inputPanel={
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {sourceOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSourceHint(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-colors ${
                  sourceHint === opt.key
                    ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-400"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`p-6 rounded-xl border text-center transition-all ${
              dragActive ? "border-cyan-400 bg-cyan-950/15" : "border-slate-800 border-dashed"
            }`}
          >
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isPending} />
            <div className="flex flex-col items-center justify-center space-y-3">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="max-h-40 rounded-lg border border-slate-800" />
              ) : (
                <div className="p-4 bg-slate-800 rounded-full border border-slate-700/80 text-cyan-400">
                  <ImageUp className="w-7 h-7" />
                </div>
              )}
              <p className="text-[11px] font-bold text-slate-200">Drag & Drop, or click to browse</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Select Screenshot
              </button>
            </div>
          </div>
        </div>
      }
      analyzeButton={
        <div className="text-center text-[10px] text-slate-500 font-mono">
          Select an image on the left — analysis starts automatically.
        </div>
      }
      resultPanel={
        result && (
          <>
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <ScanText className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Extracted Text (OCR)</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-400 font-mono bg-slate-950/60 p-4 rounded border border-slate-900 whitespace-pre-wrap">
                {result.extracted_text || "No text extracted."}
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">AI Analysis</h3>
              </div>
              <p className="text-xs text-slate-300 font-mono">{result.ai_analysis.summary}</p>
              <div className="grid grid-cols-1 gap-3 pt-2">
                {result.ai_analysis.indicators.map((ind: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300 font-mono bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                    <FileWarning className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{ind}</span>
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

export default ScreenshotScanner;
