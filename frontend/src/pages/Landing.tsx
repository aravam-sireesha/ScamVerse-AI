import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, Cpu, Lock, Globe, CheckCircle2, ArrowRight } from "lucide-react";

interface QuickScanResult {
  status: "compromised" | "secure";
  score: number;
  details: string;
}

function Landing() {
  const navigate = useNavigate();
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<QuickScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [liveBlocks, setLiveBlocks] = useState(140283);

  // Simulate threat counter increase
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBlocks((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    setScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setScanning(false);
      const isScam = scanInput.includes("bank") || scanInput.includes("win") || scanInput.includes("login") || scanInput.length > 25;
      setScanResult({
        status: isScam ? "compromised" : "secure",
        score: isScam ? Math.floor(Math.random() * 20) + 78 : Math.floor(Math.random() * 15) + 3,
        details: isScam 
          ? "CRITICAL: Threat vector detected matching phishing registration fingerprint." 
          : "SECURE: Target verified. No active indicators of social engineering scam identified."
      });
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 cyber-grid relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Top Navigation */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-900/60 sticky top-0 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white uppercase m-0 leading-none">ScamShield</h1>
            <span className="text-[9px] font-mono text-cyan-400 tracking-widest block mt-0.5">ENTERPRISE SECURITY</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-xs font-mono text-slate-400">
            SHIELD ACTIVE: <span className="text-cyan-400 font-bold">14,204 SITES PROTECTED</span>
          </span>
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-xs font-semibold tracking-wider hover:bg-cyan-400 hover:text-slate-950 transition-all duration-300"
          >
            <span>Launch SOC Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side Info */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/30 text-cyan-400 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span>Ollama Neural Processing Active</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-white m-0">
            Next-Gen AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Scam & Threat Protection
            </span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-lg">
            Protect your organization from phishing links, fake recruitment fraud, business email compromise, and synthetic voice deepfakes with a unified zero-trust AI analyzer.
          </p>

          {/* Core Metric Counters */}
          <div className="grid grid-cols-3 gap-6 border-y border-slate-900 py-6 max-w-md">
            <div>
              <p className="text-2xl font-extrabold text-white">{liveBlocks.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Scams Blocked</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-cyan-400">99.1%</p>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Detection rate</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">140ms</p>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Latency</p>
            </div>
          </div>

          {/* Action Call */}
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-all duration-200 cursor-pointer"
            >
              Start Free Threat Assessment
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById("demo-sandbox");
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium text-sm hover:bg-slate-800/60 transition-all duration-200"
            >
              Analyze a Threat
            </button>
          </div>
        </div>

        {/* Right Side Sandbox Simulator */}
        <div id="demo-sandbox" className="glass-panel glass-panel-glow p-8 rounded-2xl border border-slate-800 space-y-6 relative">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-slate-300">INTELLIGENT SANDBOX DEMO</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <form onSubmit={handleQuickScan} className="space-y-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Scan URL or Email Content
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., update-chasebank-account.com or urgent transfer wire"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                type="submit"
                disabled={scanning}
                className="px-5 py-3 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/30 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {scanning ? "Evaluating..." : "Scan"}
              </button>
            </div>
          </form>

          {/* Sandbox scan result simulation */}
          <AnimatePresence mode="wait">
            {scanning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 space-y-4"
              >
                <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono text-slate-400">Extracting features & running AI model weights...</p>
              </motion.div>
            )}

            {!scanning && scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-5 rounded-lg border ${
                  scanResult.status === "compromised" 
                    ? "border-rose-900/50 bg-rose-950/20 text-rose-200" 
                    : "border-emerald-950 bg-emerald-950/20 text-emerald-200"
                } space-y-3`}
              >
                <div className="flex items-center gap-3">
                  {scanResult.status === "compromised" ? (
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Status: {scanResult.status === "compromised" ? "Threat Flagged" : "Verified Clean"}
                    </p>
                    <p className="text-[10px] opacity-75 font-mono">Risk Index: {scanResult.score}% | Accuracy: 98.4%</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed font-mono bg-slate-950/60 p-3 rounded border border-slate-900">
                  {scanResult.details}
                </p>
              </motion.div>
            )}

            {!scanning && !scanResult && (
              <div className="border border-dashed border-slate-800 rounded-lg py-12 flex flex-col items-center justify-center text-center text-slate-500">
                <Lock className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-xs font-mono">Sandbox idle. Input suspicious artifact above to test.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Trust Badges / Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-xs font-mono text-slate-500">
            © 2026 ScamShield Enterprise. All Rights Reserved. ISO 27001 Certified.
          </div>
          <div className="flex gap-6 text-xs text-slate-400 font-mono">
            <span className="hover:text-cyan-400 cursor-pointer">Security Policy</span>
            <span className="hover:text-cyan-400 cursor-pointer">API Specs</span>
            <span className="hover:text-cyan-400 cursor-pointer">Contact SOC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
