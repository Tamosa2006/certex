"use client";
import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const CRISIS_LINES = [
  "you will die someday. at least your cart will be full.",
  "every product here was made by someone who also questions their existence.",
  "you opened a shopping app instead of calling your mom.",
  "the item you just added won't fix it. but maybe the next one will.",
  "capitalism is a construct. so is your wishlist.",
  "somewhere, a philosopher is adding noise-cancelling headphones to their cart.",
  "your ancestors survived ice ages so you could buy a scented candle.",
  "what if the real product was the friends we added to cart along the way?",
  "you have 47 browser tabs open and this is the one you came back to.",
  "the universe is 13.8 billion years old. your cart expires in 30 days.",
  "you're not buying things. you're buying the feeling of buying things.",
  "do you even remember what you came here to buy?",
  "a star collapsed for billions of years to form the atoms in your new hoodie.",
  "nothing is real. but free shipping is.",
  "your future self will also add things to cart and not check out.",
  "shopping is just telling yourself a story about who you'll become.",
  "the checkout button has never solved an existential crisis. and yet.",
];

const THOUGHTS = [
  { q: "are you happy?", a: "add to cart anyway." },
  { q: "what is the meaning of life?", a: "probably not this keyboard." },
  { q: "do you really need this?", a: "define 'need'." },
  { q: "will this make you whole?", a: "it's $49. worth a shot." },
  { q: "why are you here?", a: "the algorithm brought you." },
];

export default function ExistentialFooter({ itemCount = 50 }: { itemCount?: number }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [thought, setThought] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [tick, setTick] = useState(0);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Rotate the crisis line every 5s
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentLine(prev => (prev + 1) % CRISIS_LINES.length);
      setShowAnswer(false);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Existential clock tick
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Fade line on change
  useGSAP(() => {
    gsap.fromTo(lineRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );
  }, [currentLine]);

  const nextThought = () => {
    setThought(prev => (prev + 1) % THOUGHTS.length);
    setShowAnswer(false);
  };

  return (
    <footer
      ref={footerRef}
      className="relative w-full border-t border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden"
    >
      {/* Subtle noise grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-12 py-16">

        {/* Top row — the rotating existential statement */}
        <div className="text-center mb-14">
          <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.5em] mb-4">
            ✦ existential crisis corner ✦
          </p>
          <p
            ref={lineRef}
            className="text-white/60 text-lg font-bold italic max-w-2xl mx-auto leading-relaxed"
          >
            "{CRISIS_LINES[currentLine]}"
          </p>
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-5">
            {CRISIS_LINES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentLine(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentLine ? "w-6 bg-white/60" : "w-1.5 bg-white/15"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Middle row — 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">

          {/* Col 1 — The philosophical Q&A */}
          <div className="glass border border-white/8 rounded-3xl p-7">
            <p className="text-white/25 text-[9px] font-black uppercase tracking-widest mb-4">deep thoughts</p>
            <p className="text-white font-black text-lg uppercase tracking-tight mb-3">
              {THOUGHTS[thought].q}
            </p>
            {showAnswer ? (
              <p className="text-white/50 italic text-sm mb-5 animate-pulse">
                → {THOUGHTS[thought].a}
              </p>
            ) : (
              <button
                onClick={() => setShowAnswer(true)}
                className="text-[9px] font-black uppercase tracking-widest text-white/30 border border-white/15 px-4 py-2 rounded-full hover:text-white hover:border-white/40 transition-all mb-5"
              >
                face the truth
              </button>
            )}
            <button
              onClick={nextThought}
              className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white/60 transition-all flex items-center gap-2"
            >
              <span>another one</span> <span>→</span>
            </button>
          </div>

          {/* Col 2 — The existential clock */}
          <div className="glass border border-white/8 rounded-3xl p-7 flex flex-col items-center justify-center text-center">
            <p className="text-white/25 text-[9px] font-black uppercase tracking-widest mb-4">seconds you've spent here</p>
            <p className="text-6xl font-black tracking-tighter text-white tabular-nums">
              {tick}
            </p>
            <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest mt-3">
              that's {tick} seconds closer to the void
            </p>
            <div className="w-full bg-white/5 rounded-full h-1 mt-5 overflow-hidden">
              <div
                className="h-full bg-white/30 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((tick / 120) * 100, 100)}%` }}
              />
            </div>
            <p className="text-white/15 text-[8px] font-black uppercase tracking-widest mt-2">
              life meter
            </p>
          </div>

          {/* Col 3 — Consumerism stats */}
          <div className="glass border border-white/8 rounded-3xl p-7">
            <p className="text-white/25 text-[9px] font-black uppercase tracking-widest mb-5">fun facts™</p>
            <div className="space-y-4">
              {[
                { stat: "73%", label: "of wishlist items are never bought" },
                { stat: "∞", label: "tabs open on average" },
                { stat: "0", label: "problems solved by shopping" },
                { stat: "1", label: "life. spend it wisely. or don't." },
              ].map(({ stat, label }) => (
                <div key={label} className="flex items-center gap-4">
                  <span className="text-white font-black text-xl tracking-tighter w-10 shrink-0">{stat}</span>
                  <span className="text-white/35 text-[10px] font-bold uppercase tracking-wider leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-[8px] font-black text-white">S</span>
            </div>
            <div>
              <p className="text-white font-black text-sm uppercase tracking-tighter">SHOP. Disney Premium</p>
              <p className="text-white/20 text-[8px] font-bold uppercase tracking-widest">© 2026 · {itemCount} products · 0 answers.</p>
            </div>
          </div>

          <p className="text-white/15 text-[9px] font-bold italic text-center">
            "we are not responsible for any enlightenment, regret, or cart abandonment caused by this footer."
          </p>

          <div className="flex gap-6">
            {["Instagram", "Dribbble"].map(s => (
              <span key={s} className="text-white/25 text-[9px] font-black uppercase tracking-widest hover:text-white/60 cursor-pointer transition-all">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}