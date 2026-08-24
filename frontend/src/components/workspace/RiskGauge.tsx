import React from "react";

interface RiskGaugeProps {
  score: number;
  label?: string;
  confidence?: number;
}

function getRiskColor(score: number) {
  if (score > 75) return "text-rose-500 border-rose-500 bg-rose-500/10";
  if (score > 40) return "text-orange-500 border-orange-500 bg-orange-500/10";
  return "text-emerald-500 border-emerald-500 bg-emerald-500/10";
}

function getVerdict(score: number) {
  if (score > 75) return "CRITICAL RISK";
  if (score > 40) return "SUSPICIOUS";
  return "LOOKS SAFE";
}

function RiskGauge({ score, label = "Risk Index", confidence }: RiskGaugeProps) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-24 h-24 rounded-full border-2 flex flex-col items-center justify-center ${getRiskColor(score)}`}>
        <span className="text-2xl font-extrabold">{Math.round(score)}%</span>
        <span className="text-[8px] uppercase font-mono font-bold tracking-wider opacity-75">{label}</span>
      </div>
      <p className="text-[11px] text-center mt-4 text-slate-300 font-bold uppercase tracking-wider">
        {getVerdict(score)}
      </p>
      {typeof confidence === "number" && (
        <p className="text-[10px] text-slate-500 font-mono mt-1">
          Confidence: {confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence)}%
        </p>
      )}
    </div>
  );
}

export default RiskGauge;
