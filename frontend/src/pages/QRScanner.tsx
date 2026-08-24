import React, { useState, useRef } from "react";
import { useScanner } from "../hooks/useScanner";
import { QrCode, IndianRupee, Link2, AlertTriangle } from "lucide-react";
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

function QRScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { qrScanMutation } = useScanner();

  const processFile = async (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    const base64 = await fileToBase64(file);
    qrScanMutation.mutate({ image_base64: base64 });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const result = qrScanMutation.data;
  const isPending = qrScanMutation.isPending;

  return (
    <WorkspaceShell
      title="QR Code Scanner"
      description="Detects malicious URLs, phishing links, and fake payment QR codes before you scan them with a payment app."
      icon={QrCode}
      isPending={isPending}
      hasResult={!!result}
      pendingLabel="Decoding QR & Checking Destination"
      gauge={result && <RiskGauge score={result.risk_score} confidence={result.confidence_score} label="Risk" />}
      inputPanel={
        <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isPending} />
          <div className="flex flex-col items-center justify-center space-y-3">
            {previewUrl ? (
              <img src={previewUrl} alt="qr preview" className="w-32 h-32 object-contain rounded-lg border border-slate-800 bg-white p-2" />
            ) : (
              <div className="p-4 bg-slate-800 rounded-full border border-slate-700/80 text-cyan-400">
                <QrCode className="w-7 h-7" />
              </div>
            )}
            <p className="text-[11px] font-bold text-slate-200">Upload a QR code image</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Select QR Image
            </button>
          </div>
        </div>
      }
      analyzeButton={
        <div className="text-center text-[10px] text-slate-500 font-mono">
          Select a QR image on the left — decoding starts automatically.
        </div>
      }
      resultPanel={
        result && (
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3">
              {result.qr_type === "payment" ? (
                <IndianRupee className="w-6 h-6 text-amber-400 shrink-0" />
              ) : (
                <Link2 className="w-6 h-6 text-cyan-400 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs text-slate-400 uppercase font-mono">Decoded Payload ({result.qr_type})</p>
                <p className="text-sm text-white font-mono break-all">{result.decoded_url || "Unreadable"}</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400 font-mono bg-slate-950/60 p-4 rounded border border-slate-900">
              {result.ai_analysis.summary}
            </p>

            <div className="space-y-2">
              {result.ai_analysis.indicators.map((ind: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300 font-mono">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{ind}</span>
                </div>
              ))}
            </div>

            {result.ai_analysis.suggested_action && (
              <div className="border-t border-slate-800 pt-4 text-xs text-rose-300 font-mono">
                {result.ai_analysis.suggested_action}
              </div>
            )}
          </div>
        )
      }
    />
  );
}

export default QRScanner;
