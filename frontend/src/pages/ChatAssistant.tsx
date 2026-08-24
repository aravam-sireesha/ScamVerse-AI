import React, { useState, useRef, useEffect } from "react";
import { useScanner } from "../hooks/useScanner";
import { useTranslation } from "react-i18next";
import { Bot, Send, User, ShieldAlert, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  risk_score?: number;
}

function ChatAssistant() {
  const { i18n, t } = useTranslation();
  const { chatMutation } = useScanner();
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([
    { role: "assistant", content: t("chat.greeting", "Hi! Paste a message, link, or describe a call and ask: Is this safe? Can I trust this website? Should I click this link?") }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, chatMutation.isPending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message) return;

    const history = turns.map(({ role, content }) => ({ role, content }));
    setTurns((prev) => [...prev, { role: "user", content: message }]);
    setInput("");

    chatMutation.mutate(
      { message, history, language: i18n.language },
      {
        onSuccess: (data) => {
          setTurns((prev) => [...prev, { role: "assistant", content: data.reply, risk_score: data.risk_score }]);
        },
        onError: () => {
          setTurns((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
        }
      }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-9rem)]">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">AI Chat Assistant</h1>
        <p className="text-slate-400 text-sm mt-1">
          Ask in plain language — "Is this message safe?", "Can I trust this website?", "Should I click this link?"
        </p>
      </div>

      {/* Conversation window */}
      <div ref={scrollRef} className="glass-panel flex-1 rounded-xl border border-slate-800 p-6 overflow-y-auto space-y-4">
        <AnimatePresence initial={false}>
          {turns.map((turn, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${turn.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                turn.role === "user" ? "bg-cyan-950 text-cyan-400 border border-cyan-500/30" : "bg-slate-800 text-slate-300 border border-slate-700"
              }`}>
                {turn.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[75%] rounded-xl px-4 py-3 text-xs leading-relaxed font-mono whitespace-pre-wrap ${
                turn.role === "user"
                  ? "bg-cyan-950/40 border border-cyan-500/20 text-cyan-100"
                  : "bg-slate-950/60 border border-slate-800 text-slate-300"
              }`}>
                {turn.role === "assistant" && typeof turn.risk_score === "number" && (
                  <div className={`flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-wider ${
                    turn.risk_score > 60 ? "text-rose-400" : "text-emerald-400"
                  }`}>
                    {turn.risk_score > 60 ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>Risk score: {turn.risk_score}/100</span>
                  </div>
                )}
                {turn.content}
              </div>
            </motion.div>
          ))}

          {chatMutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="rounded-xl px-4 py-3 text-xs font-mono bg-slate-950/60 border border-slate-800 text-slate-500">
                Thinking...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a suspicious message, link, or ask a question..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
          disabled={chatMutation.isPending}
        />
        <button
          type="submit"
          disabled={chatMutation.isPending || !input.trim()}
          className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default ChatAssistant;
