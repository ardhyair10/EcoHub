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
      text: "**Halo! Saya Eco-Assistant AI**\n\nAda yang bisa saya bantu seputar pemilahan sampah, metrik poin, lokasi Pos RW, atau katalog produk hari ini?",
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
    "Di mana lokasi Pos RW?",
    "Berapa poin minyak jelantah?",
    "Berapa poin sampah e-Waste?",
    "Syarat setor botol plastik PET?",
    "Berapa poin kardus & kertas?",
    "Siapa penandatangan sertifikat?",
    "Katalog barang Marketplace?",
    "Cara dapat poin dari Event?",
    "Gimana cara dapet badge?",
    "Berapa target poin bulanan?",
    "Berapa nilai 1 Eco-Point?",
    "Apa itu B2B Bulk Waste Hub?",
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[80] w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-all duration-300"
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
        <div className="fixed bottom-24 right-6 z-[80] w-full max-w-sm sm:max-w-md bg-card rounded-lg border border-border shadow-lg overflow-hidden flex flex-col h-[520px] transition-all duration-300">
          {/* Header */}
          <div className="bg-card border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-foreground flex items-center gap-1.5">
                  Eco-Assistant
                </h3>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm bg-muted/30">
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
                  className={`max-w-[80%] rounded-md px-4 py-2.5 ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground border border-border shadow-sm"
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
                  <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-1">
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
                <div className="bg-card rounded-md px-4 py-2.5 border border-border flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
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
                className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-2.5 py-1.5 rounded-md whitespace-nowrap flex-shrink-0 font-medium transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-card border-t border-border flex gap-2">
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
