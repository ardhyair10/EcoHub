"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { safeFetchJson } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  time: string;
}

function formatMarkdownText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|\n)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index} className="italic opacity-90">{part.slice(1, -1)}</em>;
    }
    if (part === "\n") {
      return <br key={index} />;
    }
    return part;
  });
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "🌱 **Halo! Saya Eco-Assistant AI** 👋\n\nAda yang bisa saya bantu seputar pemilahan sampah, poin per kg, lokasi Pos RW, atau katalog produk daur ulang hari ini?",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const msg = textToSend || input;
    if (!msg.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const newMsg: ChatMessage = { sender: "user", text: msg, time: timeStr };
    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await safeFetchJson(res);

      if (data.success && data.data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.data.reply,
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Maaf, terjadi kesalahan pada server assistant.",
            time: timeStr,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Maaf, terjadi gangguan koneksi.",
          time: timeStr,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "📍 Di mana lokasi Pos RW?",
    "🍳 Berapa poin minyak jelantah?",
    "🔌 Berapa poin sampah e-Waste?",
    "🍾 Syarat setor botol plastik PET?",
    "📦 Berapa poin kardus & kertas?",
    "📜 Siapa penandatangan sertifikat?",
    "🛍️ Katalog barang Marketplace?",
    "🤝 Cara dapat poin dari Event?",
    "🏆 Gimana cara dapet badge?",
    "🎯 Berapa target poin bulanan?",
    "🪙 Berapa nilai 1 Eco-Point?",
    "🏢 Apa itu B2B Bulk Waste Hub?",
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[80] w-14 h-14 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group"
        aria-label="Tanya AI Eco-Assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <Bot className="h-7 w-7 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[80] w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[520px] transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-emerald-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm flex items-center gap-1.5">
                  Eco-Assistant AI <Sparkles className="h-3.5 w-3.5 text-accent" />
                </h3>
                <p className="text-xs text-white/80">Edukasi & Panduan Daur Ulang</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm bg-slate-50/50 dark:bg-slate-950/50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    m.sender === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 text-foreground border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm"
                  }`}
                >
                  <div className="leading-relaxed">{formatMarkdownText(m.text)}</div>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      m.sender === "user" ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    {m.time}
                  </p>
                </div>
                {m.sender === "user" && (
                  <div className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-2.5 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs">Mengetik...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 font-medium"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <Input
              placeholder="Tanyakan seputar daur ulang..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 text-sm h-10"
              disabled={loading}
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWidget;
