"use client";
import { useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import { useStore } from "@/components/store";
import { useAuth } from "@clerk/nextjs";

interface ProductCardProps {
  product: any;
  onOpen: (p: any) => void;
  stock: number;
  userId: string | null;
  wishlisted: boolean;
  onWishlistToggle: (p: any) => void;
}

export default function ProductCard({
  product,
  onOpen,
  stock,
  userId,
  wishlisted,
  onWishlistToggle,
}: ProductCardProps) {
  const addItem = useStore((state: any) => state.addItem);
  const decrementStock = useMutation(api.products.decrementStock);
  const imgRef = useRef<HTMLImageElement>(null);
  const { userId: authUserId } = useAuth();
  const isOutOfStock = stock === 0;

  useGSAP(() => {
    gsap.to(imgRef.current, {
      y: -6,
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!authUserId) {
      document.getElementById("auth-trigger")?.click();
      return;
    }
    try {
      await decrementStock({ title: product.title });
      addItem(product);
      confetti({ particleCount: 25, spread: 55, origin: { y: 0.8 }, colors: ["#ffffff"] });
    } catch {
      alert("Sorry, this item just went out of stock!");
    }
  };

  return (
    // ✅ Pure flex-col — NO absolute positioning anywhere
    // Everything stacks top-to-bottom, nothing overlaps
    <div
      onClick={() => onOpen(product)}
      className="product-card group flex flex-col gap-3 cursor-pointer select-none"
    >
      {/* ── IMAGE BUBBLE ──────────────────────────────────────────
          Fixed 220px height. White background. object-contain with
          padding so EVERY image (portrait or landscape) fits cleanly
          inside without cropping or bleeding out.
      ──────────────────────────────────────────────────────────── */}
      <div className="relative w-full rounded-[2rem] bg-white overflow-hidden shadow-lg transition-transform duration-500 group-hover:scale-[1.02]" style={{ height: "220px" }}>
        <img
          ref={imgRef}
          src={product.image}
          alt={product.title}
          draggable={false}
          className="w-full h-full object-contain p-5"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/400x300/f1f5f9/334155?text=${encodeURIComponent(product.title)}`;
          }}
        />
        {/* Wishlist button sits INSIDE image bubble, top-right */}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlistToggle(product); }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-90 ${
            wishlisted
              ? "border-red-400/60 text-red-500 bg-red-50"
              : "border-black/10 text-black/30 bg-white/70 hover:text-black/60"
          }`}
        >
          <span className="text-sm leading-none">{wishlisted ? "♥" : "♡"}</span>
        </button>
      </div>

      {/* ── INFO BUBBLE ───────────────────────────────────────────
          Sits BELOW the image — completely separate, no overlap.
          Auto-height so the full title always fits regardless of length.
      ──────────────────────────────────────────────────────────── */}
      <div className="glass border border-white/10 rounded-[2rem] px-6 py-5 flex flex-col gap-2.5 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/25">

        {/* Category */}
        <p className="text-white/35 text-[9px] font-black uppercase tracking-[0.2em]">
          {product.category}
        </p>

        {/* Full title — wraps freely, never clipped */}
        <h3 className="text-white font-black uppercase tracking-tight text-[13px] leading-snug break-words">
          {product.title}
        </h3>

        {/* Stock badge */}
        <div>
          {isOutOfStock ? (
            <span className="text-red-400 text-[9px] font-black uppercase tracking-widest">⊘ Out of stock</span>
          ) : stock <= 5 ? (
            <span className="text-amber-400 text-[9px] font-black uppercase tracking-widest">⚡ Only {stock} left</span>
          ) : (
            <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">✓ {stock} in stock</span>
          )}
        </div>

        {/* Price + Add button */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-white font-black text-[22px] tracking-tighter leading-none">
            ${product.price}
          </span>
          {isOutOfStock ? (
            <span className="text-[9px] font-black uppercase tracking-widest text-red-400/50 border border-red-400/20 px-4 py-2 rounded-xl cursor-not-allowed whitespace-nowrap">
              Unavailable
            </span>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:invert active:scale-95 transition-all duration-150 shadow-sm whitespace-nowrap"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}