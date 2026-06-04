"use client";
import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface VibeSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: any) => void;
  userId: string | null;
  mockProducts?: any[]; // kept for backwards compat, no longer used
}

interface VibeResult {
  vibeName: string;
  vibeDescription: string;
  colors: string[];
  keywords: string[];
  matchedProductIds: number[];
  matchReasons: Record<string, string>;
}

export default function VibeSearch({ isOpen, onClose, onAddToCart, userId, mockProducts = [] }: VibeSearchProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState<VibeResult | null>(null);
  const [matchedProducts, setMatchedProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allProducts = useQuery(api.products.getAll) ?? [];
  const decrementStock = useMutation(api.products.decrementStock);
  const addToWishlist = useMutation(api.wishlist.addToWishlist);

  // image is now stored directly in Convex DB — no lookup needed

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) { setError("Please upload an image file."); return; }
    setMediaType(f.type);
    setResult(null);
    setError(null);
    setAddedIds(new Set());
    setMatchedProducts([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleAnalyze = async () => {
    if (!imageBase64 || allProducts.length === 0) return;
    setLoading(true);
    setError(null);
    const steps = ["Reading your image...", "Extracting the vibe...", "Identifying colours & mood...", "Matching your catalog...", "Curating your storefront..."];
    let i = 0;
    setLoadingStep(steps[0]);
    const interval = setInterval(() => { i = (i + 1) % steps.length; setLoadingStep(steps[i]); }, 1200);
    try {
      const productCatalog = allProducts.map((p: any) => ({ id: p.id, title: p.title, category: p.category, price: p.price }));
      const res = await fetch("/api/vibe-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mediaType, productCatalog }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");

      // ✅ Always inject image from mockProducts — Convex DB may not have image field
      const matched = allProducts
        .filter((p: any) => (data.matchedProductIds ?? []).includes(p.id))
        .map((p: any) => ({
          ...p,
          image: mockProducts.find((m: any) => m.title === p.title)?.image
               || mockProducts.find((m: any) => m.id === p.id)?.image
               || p.image
               || "",
        }));

      setResult(data);
      setMatchedProducts(matched);
    } catch (err: any) {
      setError(err.message);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: any) => {
    try {
      await decrementStock({ title: product.title });
      onAddToCart({ id: product.id, title: product.title, price: product.price, image: product.image ?? "", category: product.category });
      setAddedIds(prev => new Set(prev).add(product.id));
    } catch { alert("Out of stock!"); }
  };

  const handleWishlist = async (product: any) => {
    if (!userId) { alert("Sign in to save to wishlist!"); return; }
    await addToWishlist({ userId, productId: product.id, title: product.title, price: product.price, image: product.image ?? "", category: product.category });
  };

  const reset = () => { setPreview(null); setImageBase64(null); setResult(null); setMatchedProducts([]); setError(null); setAddedIds(new Set()); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl">
        <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-xl px-10 pt-10 pb-6 border-b border-white/5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">✦</span>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Vibe Search</h2>
              </div>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest ml-9">Upload an image — we'll find your aesthetic</p>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white font-black text-xl transition-all hover:rotate-90 duration-300">✕</button>
          </div>
        </div>

        <div className="px-10 pb-10 pt-8">
          {!result && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${dragOver ? "border-white/60 bg-white/5" : "border-white/15 hover:border-white/30"}`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                {preview ? (
                  <div>
                    <img src={preview} className="max-h-64 mx-auto rounded-2xl object-contain shadow-2xl" />
                    <p className="mt-4 text-white/40 text-xs font-bold uppercase tracking-widest">Click to change image</p>
                  </div>
                ) : (
                  <div className="text-white/20 space-y-4">
                    <div className="text-6xl">⬆</div>
                    <div>
                      <p className="text-white/60 font-black text-lg uppercase tracking-tight">Drop your image here</p>
                      <p className="text-white/20 text-xs mt-1 font-bold uppercase tracking-widest">Pinterest boards, outfits, rooms, art — anything</p>
                    </div>
                  </div>
                )}
              </div>
              {error && <p className="text-red-400 text-sm font-bold text-center">{error}</p>}
              {preview && !loading && (
                <button onClick={handleAnalyze} className="w-full bg-white text-black font-black text-sm uppercase tracking-widest py-5 rounded-2xl hover:bg-white/90 transition-all active:scale-95">
                  ✦ Analyse My Vibe
                </button>
              )}
              {loading && (
                <div className="text-center space-y-4 py-8">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                  <p className="text-white/60 text-sm font-bold uppercase tracking-widest animate-pulse">{loadingStep}</p>
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-10">
              <div className="flex gap-6 items-start">
                <img src={preview!} className="w-28 h-28 rounded-2xl object-cover border border-white/10 shrink-0" />
                <div className="flex-1">
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Your Vibe</p>
                  <h3 className="text-4xl font-black uppercase tracking-tighter text-white leading-none mb-2">{result.vibeName}</h3>
                  <p className="text-white/50 text-sm italic">{result.vibeDescription}</p>
                  <div className="flex gap-2 mt-4 items-center">
                    <span className="text-white/20 text-[10px] font-black uppercase tracking-widest mr-1">Palette</span>
                    {(result.colors ?? []).map((c, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border border-white/10 shadow-lg" style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                  <div className="flex gap-2 mt-5 flex-wrap">
                    {(result.keywords ?? []).map((k, i) => (
                      <span key={i} className="text-[10px] font-black uppercase tracking-widest border border-white/15 text-white/40 px-3 py-1.5 rounded-full">{k}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/8" />

              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-white/25 text-[10px] font-black uppercase tracking-widest mb-0.5">Curated for your vibe</p>
                    <h4 className="text-white font-black uppercase text-xl tracking-tight">{matchedProducts.length} Matched Picks</h4>
                  </div>
                  <button onClick={reset} className="text-[10px] font-black uppercase tracking-widest border border-white/15 text-white/40 hover:text-white hover:border-white/40 px-5 py-2.5 rounded-full transition-all">↩ Search Again</button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {matchedProducts.map((product) => {
                    const added = addedIds.has(product.id);
                    const isOOS = product.stock === 0;
                    return (
                      <div key={product.id} className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden group hover:border-white/20 transition-all duration-300">
                        
                        {/* ✅ Fixed image area — white bg + object-contain so local product images display correctly */}
                        <div className="aspect-square bg-white flex items-center justify-center relative overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-[85%] h-[85%] object-contain group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://placehold.co/400x400/1e293b/white?text=${encodeURIComponent(product.title)}`;
                            }}
                          />
                          {result.matchReasons?.[String(product.id)] && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <p className="text-white/70 text-[9px] font-bold leading-snug">{result.matchReasons[String(product.id)]}</p>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mb-1">{product.category}</p>
                          <h5 className="text-white font-black text-sm uppercase tracking-tight leading-tight mb-1">{product.title}</h5>
                          <p className="text-white font-black text-lg mb-3">${product.price}</p>
                          {isOOS ? (
                            <div className="text-center text-[9px] font-black uppercase text-white/20 border border-white/10 rounded-xl py-2">Out of Stock</div>
                          ) : added ? (
                            <div className="text-center text-[9px] font-black uppercase text-green-400 border border-green-400/30 rounded-xl py-2">✓ Added to Cart</div>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => handleAddToCart(product)} className="flex-1 bg-white text-black font-black text-[9px] uppercase tracking-widest py-2.5 rounded-xl hover:invert transition-all active:scale-95">Add to Cart</button>
                              <button onClick={() => handleWishlist(product)} className="w-9 h-9 border border-white/15 rounded-xl flex items-center justify-center text-white/30 hover:text-red-400 hover:border-red-400/30 transition-all text-sm" title="Save to Wishlist">♡</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}