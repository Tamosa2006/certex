"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "I'm a CS student with a $1,200 budget 🎓",
  "What's your best noise-cancelling headphone?",
  "Compare the MacBook Air vs iPad Pro",
  "I want to set up a home gym under $400",
];

export default function OmniscientClerk() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const userText = text ?? input.trim();
    if (!userText || loading) return;

    const userMessage: Message = { role: "user", content: userText };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/omniscient-clerk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      const reply = res.status === 429
        ? "⏳ I'm a little overwhelmed right now — please wait a few seconds and try again!"
        : data.reply ?? `Error: ${data.error ?? "Unknown — check npm run dev terminal"}`;

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "ERROR: ${data?.error ?? 'Unknown error — check npm run dev terminal'}" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-10 right-10 z-[500] w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 font-black text-xl"
        title="Ask The Omniscient Clerk"
      >
        {isOpen ? "✕" : "✦"}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-32 right-10 z-[499] w-[400px] max-h-[600px] flex flex-col rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
        style={{ background: "rgba(10,10,10,0.97)", backdropFilter: "blur(40px)" }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 shrink-0">
          <p className="text-white font-black text-sm uppercase tracking-widest">✦ The Omniscient Clerk</p>
          <p className="text-white/30 text-[10px] mt-0.5 font-medium">Knows every product. Real-time stock. No hallucinations.</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          {messages.length === 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-white/30 text-xs text-center mb-4">Try asking something like...</p>
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="w-full text-left px-4 py-3 rounded-2xl border border-white/10 text-white/60 text-xs hover:bg-white/5 hover:text-white hover:border-white/30 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-white text-black font-semibold rounded-br-sm"
                    : "bg-white/8 text-white/90 border border-white/10 rounded-bl-sm"
                }`}
                style={msg.role === "assistant" ? { background: "rgba(255,255,255,0.06)" } : {}}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-2xl rounded-bl-sm border border-white/10 text-white/40 text-sm"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <span className="animate-pulse">Consulting the catalog...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-white/10 shrink-0 flex gap-3 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about our products..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-white/40 transition-all placeholder:text-white/20"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm hover:scale-105 transition-all disabled:opacity-30 shrink-0"
          >
            ↑
          </button>
        </div>
      </div>
    </>
  );
}