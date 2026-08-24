import React from "react";
import { Info, Layers, Cpu, Database, ShieldCheck, GitBranch } from "lucide-react";

const PIPELINE = [
  { stage: "Ingest", detail: "Text, URL, screenshot, QR image, or audio upload from the client." },
  { stage: "Extraction", detail: "OCR (Tesseract) for images, speech-to-text for audio, feature extraction for URLs." },
  { stage: "AI / NLP Analysis", detail: "Ollama-backed LLM + rule-based heuristics score scam likelihood." },
  { stage: "Risk Scoring", detail: "0-100 risk score with confidence, indicators, and suggested action." },
  { stage: "Persistence", detail: "Threat record saved to MongoDB, surfaced on Dashboard & Analytics in real time." },
];

const STACK = [
  { label: "Frontend", value: "React + TypeScript, Redux Toolkit, TanStack Query, Tailwind, Framer Motion" },
  { label: "Backend", value: "FastAPI (Python), Motor (async MongoDB driver)" },
  { label: "AI Layer", value: "Ollama local LLM, pytesseract OCR, OpenCV QR decode, SpeechRecognition STT" },
  { label: "Database", value: "MongoDB — threats, scans, reports collections" },
  { label: "Extension", value: "Chrome Manifest V3 — background worker + content script" },
];

function About() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white m-0">About & Architecture</h1>
          <p className="text-slate-400 text-xs mt-0.5">How ScamShield is built, and how a scan request flows through the system.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <GitBranch className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Detection Pipeline</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {PIPELINE.map((p, i) => (
            <div key={p.stage} className="relative bg-slate-950/60 border border-slate-900 rounded-lg p-4">
              <span className="text-[10px] font-mono text-cyan-400">{String(i + 1).padStart(2, "0")}</span>
              <h4 className="text-xs font-bold text-white mt-1">{p.stage}</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{p.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Layers className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Technology Stack</h3>
        </div>
        <div className="space-y-3">
          {STACK.map((s) => (
            <div key={s.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs border-b border-slate-900 pb-3 last:border-0">
              <span className="text-slate-500 font-mono w-28 shrink-0">{s.label}</span>
              <span className="text-slate-300">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">8 Detection Modules</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            URL, Email, Screenshot, QR, Voice, Job Post, Deepfake scanners, plus a conversational AI Chat Assistant —
            each backed by its own scoring service and reachable from the Detection Workspace.
          </p>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Privacy Note</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Uploaded content is analyzed to produce a risk score and is not shared with third parties.
            Update this section with your actual data-retention policy before going live publicly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
