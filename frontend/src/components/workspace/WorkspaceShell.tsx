import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface WorkspaceShellProps {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Left column — the raw input controls (text box, file drop, upload, etc.) */
  inputPanel: React.ReactNode;
  /** Center column — the primary action + live status/progress + at-a-glance risk gauge */
  analyzeButton: React.ReactNode;
  isPending: boolean;
  pendingLabel: string;
  pendingSubLabel?: string;
  gauge?: React.ReactNode;
  /** Right column — full findings: summary, indicators, breakdowns */
  resultPanel: React.ReactNode;
  hasResult: boolean;
}

/**
 * Every scanner in the Detection Workspace follows the same three-lane layout:
 *   Left    -> Input
 *   Center  -> Analyze button + live status + risk gauge
 *   Right   -> Full result / findings panel
 * This keeps all 7 modules feeling like one consistent enterprise SOC tool
 * instead of 7 differently-shaped pages.
 */
function WorkspaceShell({
  title,
  description,
  icon: Icon,
  inputPanel,
  analyzeButton,
  isPending,
  pendingLabel,
  pendingSubLabel,
  gauge,
  resultPanel,
  hasResult,
}: WorkspaceShellProps) {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white m-0">{title}</h1>
          <p className="text-slate-400 text-xs mt-0.5">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT — Input */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-xl border border-slate-800 p-5">
            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">Input</h3>
            {inputPanel}
          </div>
        </div>

        {/* CENTER — Analyze control + status + gauge */}
        <div className="lg:col-span-3">
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-5 lg:sticky lg:top-24">
            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Analyze</h3>
            {analyzeButton}

            <AnimatePresence mode="wait">
              {isPending && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center space-y-3 pt-2"
                >
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <Icon className="w-6 h-6 text-cyan-400 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">{pendingLabel}</p>
                  {pendingSubLabel && <p className="text-[10px] text-slate-500 font-mono">{pendingSubLabel}</p>}
                </motion.div>
              )}

              {!isPending && hasResult && gauge && (
                <motion.div key="gauge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                  {gauge}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT — Result / findings */}
        <div className="lg:col-span-5 space-y-4">
          <AnimatePresence mode="wait">
            {!hasResult && !isPending && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel rounded-xl border border-dashed border-slate-800 p-10 flex flex-col items-center justify-center text-center h-full min-h-[280px]"
              >
                <Icon className="w-8 h-8 text-slate-700 mb-3" />
                <p className="text-xs text-slate-600 font-mono">Results will appear here once analysis runs.</p>
              </motion.div>
            )}
            {hasResult && (
              <motion.div key="result" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {resultPanel}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceShell;
