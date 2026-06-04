"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import confetti from "canvas-confetti";

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onAddToCart: (product: any) => void;
}

export default function WishlistSidebar({ isOpen, onClose, userId, onAddToCart }: WishlistSidebarProps) {
  const sidebarRef = useRef(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const decrementStock = useMutation(api.products.decrementStock);
  const removeFromWishlist = useMutation(api.wishlist.removeFromWishlist);

  const handleAddToCart = async (item: any) => {
    if (!userId) return;
    setAddingId(item.productId);
    try {
      await decrementStock({ title: item.title });
      onAddToCart({ id: item.productId, title: item.title, price: item.price, image: item.image, category: item.category });
      await removeFromWishlist({ userId, productId: item.productId });
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 }, colors: ['#ffffff'] });
    } catch {
      alert("Sorry, this item is out of stock!");
    } finally {
      setAddingId(null);
    }
  };

  useGSAP(() => {
    gsap.to(sidebarRef.current, { x: isOpen ? 0 : "105%", duration: 1, ease: "expo.out" });
  }, [isOpen]);

  const wishlist = useQuery(
    api.wishlist.getWishlist,
    userId ? { userId } : "skip"
  ) ?? [];

  const handleRemove = async (productId: number) => {
    if (!userId) return;
    await removeFromWishlist({ userId, productId });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[150] transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Sidebar */}
      <div ref={sidebarRef} className="fixed top-0 right-0 h-full w-full md:w-[480px] z-[200] translate-x-full flex">
        <div className="flex-1 glass backdrop-blur-[45px] border-l border-white/10 p-12 flex flex-col shadow-2xl">

          {/* Header */}
          <div className="flex justify-between items-center mb-16 text-white">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter">Wishlist</h2>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Saved for later</p>
            </div>
            <button
              onClick={onClose}
              className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 border border-white/20 px-6 py-2 rounded-full transition-all"
            >
              Close
            </button>
          </div>

          {/* Not signed in */}
          {!userId && (
            <div className="flex-1 flex flex-col items-center justify-center text-white opacity-30 gap-4">
              <span className="text-5xl">♡</span>
              <p className="text-sm font-black uppercase tracking-widest">Sign in to save wishlist</p>
            </div>
          )}

          {/* Empty */}
          {userId && wishlist.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-white gap-4">
              <span className="text-6xl opacity-10">♡</span>
              <p className="opacity-20 italic text-sm text-center">Nothing saved yet...<br />tap ♡ on any product</p>
            </div>
          )}

          {/* Items */}
          {userId && wishlist.length > 0 && (
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar text-white">
              {wishlist.map((item) => (
                <div key={item._id} className="flex gap-5 items-center group">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                    <img src={item.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-black uppercase truncate">{item.title}</h4>
                    <p className="text-white/40 text-[10px] font-bold uppercase mt-0.5">{item.category}</p>
                    <p className="text-white font-black text-sm mt-1">${item.price}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 items-end">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={addingId === item.productId}
                      className="bg-white text-black px-4 py-1.5 rounded-xl font-black text-[10px] uppercase hover:invert transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {addingId === item.productId ? "Adding..." : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="opacity-20 hover:opacity-100 text-red-400 font-bold transition-all text-xs"
                      title="Remove from wishlist"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer count */}
          {userId && wishlist.length > 0 && (
            <div className="mt-8 pt-8 border-t border-white/10 text-white">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Saved Items</span>
                <span className="text-3xl font-black tracking-tighter">{wishlist.length}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}