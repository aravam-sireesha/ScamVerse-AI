import React from "react";
import { NavLink } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Link2,
  Mail,
  Briefcase,
  Video,
  Radio,
  BarChart3,
  FileText,
  ExternalLink,
  Bot,
  ImageUp,
  QrCode,
  Mic,
  Info,
  UserCircle2,
  Search
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

const navGroups = [
  {
    heading: null,
    links: [{ to: "/dashboard", label: "Executive Dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Detection Workspace",
    links: [
      { to: "/dashboard/chat", label: "AI Chat Assistant", icon: Bot },
      { to: "/dashboard/url", label: "URL Scan Engine", icon: Link2 },
      { to: "/dashboard/email", label: "Email Analyzer", icon: Mail },
      { to: "/dashboard/screenshot", label: "Screenshot Scanner", icon: ImageUp },
      { to: "/dashboard/qr", label: "QR Code Scanner", icon: QrCode },
      { to: "/dashboard/voice", label: "Voice Scam Detection", icon: Mic },
      { to: "/dashboard/job", label: "Job Post Vetting", icon: Briefcase },
      { to: "/dashboard/deepfake", label: "Deepfake Detection", icon: Video },
    ],
  },
  {
    heading: "Analytics & Intelligence",
    links: [
      { to: "/dashboard/threat-intel", label: "Threat Intel (SOC)", icon: Radio },
      { to: "/dashboard/analytics", label: "Analytics & Metrics", icon: BarChart3 },
      { to: "/dashboard/reports", label: "Investigation Reports", icon: FileText },
    ],
  },
  {
    heading: "System",
    links: [
      { to: "/dashboard/about", label: "About / Architecture", icon: Info },
      { to: "/dashboard/profile", label: "Profile & Settings", icon: UserCircle2 },
    ],
  },
];

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800/80 flex flex-col fixed left-0 top-0 z-50">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-800 flex items-center px-6 gap-3 shrink-0">
        <div className="p-2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-wider text-white uppercase">ScamShield</h2>
          <span className="text-[10px] font-mono text-cyan-400 tracking-widest">ENTERPRISE AI</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-4 space-y-5 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={gi} className="space-y-1">
            {group.heading && (
              <p className="px-4 pt-2 pb-1 text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                {group.heading === "Detection Workspace" && <Search className="w-3 h-3" />}
                {group.heading}
              </p>
            )}
            {group.links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/dashboard"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 ${
                      isActive
                        ? "bg-cyan-950/60 text-cyan-400 border-l-2 border-cyan-400 font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Multi-language toggle (English, Hindi, Tamil, Telugu, Kannada) */}
      <div className="px-4 pb-2 shrink-0">
        <LanguageSwitcher />
      </div>

      {/* Footer Branding / External Link */}
      <div className="p-4 border-t border-slate-800/80 shrink-0">
        <NavLink
          to="/"
          className="flex items-center justify-between px-4 py-3 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </span>
          <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase font-mono">v1.2</span>
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
