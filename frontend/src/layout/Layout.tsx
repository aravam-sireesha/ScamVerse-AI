import React from "react";
import { NavLink } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAppSelector } from "../store";
import { Server, Terminal, Radio } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { currentUser } = useAppSelector((state) => state.ui);
  const { systemStatus } = useAppSelector((state) => state.threats);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 cyber-grid">
      {/* Fixed Sidebar component */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Top Operational Header */}
        <header className="h-16 px-8 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>GATEWAY:</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>OLLAMA AI:</span>
              <span className="text-cyan-400 font-bold">{systemStatus.ollamaStatus.toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>DB CLUSTER:</span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
          </div>

          {/* User Profile Info */}
          {currentUser && (
            <NavLink to="/dashboard/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-200">{currentUser.username}</p>
                <p className="text-[10px] text-cyan-400 font-mono tracking-wider">{currentUser.role.toUpperCase()}</p>
              </div>
              <div className="w-8 h-8 rounded-full border border-cyan-500/50 bg-cyan-950/50 flex items-center justify-center font-bold text-cyan-400 text-xs">
                SA
              </div>
            </NavLink>
          )}
        </header>

        {/* Content Container */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;