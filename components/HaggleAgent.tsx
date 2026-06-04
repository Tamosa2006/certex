"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface HaggleAgentProps {
  cartTotal: number;
  cartItems: any[];
  currentDiscount: number;
  onDiscountApplied: (discount: number) => void;
  userId?: string;
}

export default function HaggleAgent({ cartTotal, cartItems, currentDiscount, onDiscountApplied, userId }: HaggleAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const discountedTotal = +(cartTotal * (1 - currentDiscount)).toFixed(2);
  const savedAmount = +(cartTotal * currentDiscount).toFixed(2);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Opening message from the Haggler
      setMessages([{
        role: "assistant",
        content: "Ah, a savvy shopper! Before you finalize... want to try your luck and negotiate? I warn you — I'm very good at this. 😏"
      }]);
    }
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
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
      const res = await fetch("/api/haggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          cartItems,
          currentDiscount,
          userId: userId ?? null,
        }),
      });

      const data = await res.json();
      const reply = data.reply ?? "Let me think...";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      // Apply discount if agent decided to grant one
      if (data.newDiscount !== null && data.newDiscount !== undefined) {
        if (data.newDiscount > currentDiscount) {
          onDiscountApplied(data.newDiscount);
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I got flustered. Try again!" }]);
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

  const STARTER_PROMPTS = [
    "Can I get a discount? 👀",
    "I'm a loyal customer!",
    "This is too expensive",
    "Give me your best deal",
  ];

  const maxDiscount = cartTotal >= 1000 ? 20 : 10;

  return (
    <div className="mt-6">


      {/* Discount badge — shows when discount is active */}
      {currentDiscount > 0 && (
        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-5 py-3 mb-4">
          <div>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">🎉 Haggle Discount Applied!</p>
            <p className="text-white text-xs mt-0.5 opacity-60">You saved <span className="text-emerald-400 font-black">${savedAmount}</span> ({(currentDiscount * 100).toFixed(0)}% off)</p>
          </div>
          <p className="text-emerald-400 font-black text-2xl tracking-tighter">${discountedTotal}</p>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full py-3 rounded-2xl border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
      >
        {isOpen ? "✕ Close Negotiation" : "💬 Negotiate with The Haggler"}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="mt-4 rounded-3xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-white font-black text-xs uppercase tracking-widest">🤝 The Haggler</p>
            <p className="text-white/30 text-[10px] mt-0.5">Convince me. I dare you.</p>
          </div>

          {/* Messages */}
          <div className="px-4 py-4 space-y-3 max-h-[280px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-white text-black font-semibold rounded-br-sm"
                      : "text-white/90 border border-white/10 rounded-bl-sm"
                  }`}
                  style={msg.role === "assistant" ? { background: "rgba(255,255,255,0.07)" } : {}}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm border border-white/10 text-white/30 text-xs" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <span className="animate-pulse">Thinking of a counter-offer...</span>
                </div>
              </div>
            )}

            {/* Starter prompts */}
            {messages.length <= 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="px-3 py-1.5 rounded-xl border border-white/10 text-white/40 text-[10px] hover:bg-white/5 hover:text-white transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/10 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Make your case..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-white/30 transition-all placeholder:text-white/20"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black text-xs hover:scale-105 transition-all disabled:opacity-30 shrink-0"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}