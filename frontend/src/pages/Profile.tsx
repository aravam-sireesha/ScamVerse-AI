import React from "react";
import { useAppSelector } from "../store";
import { useTranslation } from "react-i18next";
import { UserCircle2, Bell, Languages, ShieldCheck, KeyRound } from "lucide-react";

function Profile() {
  const { currentUser } = useAppSelector((state) => state.ui);
  const { i18n } = useTranslation();

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <UserCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white m-0">Profile & Settings</h1>
          <p className="text-slate-400 text-xs mt-0.5">Account details, notification, and language preferences.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border border-cyan-500/50 bg-cyan-950/50 flex items-center justify-center font-bold text-cyan-400 text-xl">
            {currentUser?.username?.slice(0, 2).toUpperCase() || "SA"}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{currentUser?.username || "sec_admin"}</p>
            <p className="text-xs text-cyan-400 font-mono">{currentUser?.role?.toUpperCase() || "PRINCIPAL SOC ANALYST"}</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-500 font-mono block mb-1">Username</label>
            <input
              defaultValue={currentUser?.username || ""}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-slate-500 font-mono block mb-1">Role</label>
            <input
              defaultValue={currentUser?.role || ""}
              disabled
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Languages className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Language</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { code: "en", label: "English" },
            { code: "hi", label: "हिंदी" },
            { code: "ta", label: "தமிழ்" },
            { code: "te", label: "తెలుగు" },
            { code: "kn", label: "ಕನ್ನಡ" },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`px-4 py-2 rounded-lg text-xs font-mono border transition-colors ${
                i18n.language === lang.code
                  ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Bell className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Notifications</h3>
        </div>
        <label className="flex items-center justify-between text-xs text-slate-300">
          <span>Email me when a critical threat is detected</span>
          <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-500" />
        </label>
        <label className="flex items-center justify-between text-xs text-slate-300">
          <span>Weekly analytics digest</span>
          <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-500" />
        </label>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <KeyRound className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Security</h3>
        </div>
        <button className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 rounded-lg text-xs text-slate-300 font-mono transition-colors">
          Change Password
        </button>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Settings are stored locally in this demo build — wire up a real user API before production.</span>
      </div>
    </div>
  );
}

export default Profile;
