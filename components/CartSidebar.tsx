"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useStore } from "./store"; 
import CheckoutModal from "./CheckoutModal";

export default function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Ensure we are pulling the correct state from the store
  const { cart, removeItem, totalPrice } = useStore() as any;
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Calculate total safely (handling both function and number types)
  const currentTotal = typeof totalPrice === 'function' ? totalPrice() : totalPrice;

  useGSAP(() => {
    gsap.to(sidebarRef.current, { x: isOpen ? 0 : "105%", duration: 1, ease: "expo.out" });
  }, [isOpen]);

  const handleCheckoutClick = () => {
    if (!cart || cart.length === 0) {
      alert("Your bag is empty!");
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <div 
        onClick={onClose} 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      />
      
      <div ref={sidebarRef} className="fixed top-0 right-0 h-full w-full md:w-[480px] z-[200] translate-x-full flex">
        <div className="flex-1 bg-zinc-900/90 backdrop-blur-3xl border-l border-white/10 p-12 flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Your Bag</h2>
            <button onClick={onClose} className="text-[10px] text-white/50 hover:text-white border border-white/20 px-6 py-2 rounded-full uppercase">Close</button>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto pr-4 custom-scrollbar">
            {cart.length === 0 ? (
              <p className="text-white/30 uppercase text-[10px] font-bold">The bag is currently empty.</p>
            ) : (
              cart.map((item: any) => (
                <div key={item.id} className="flex gap-6 items-center">
                  <div className="w-20 h-20 bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                    <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                  </div>
                  <div className="flex-1 text-white">
                    <h4 className="text-[11px] font-black uppercase truncate">{item.title}</h4>
                    <p className="text-[14px] font-bold opacity-40">₹{item.price} x{item.quantity}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-white opacity-40 hover:opacity-100">✕</button>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex justify-between items-end mb-8 text-white">
              <span className="text-[10px] font-black uppercase opacity-30">Subtotal</span>
              <span className="text-5xl font-black tracking-tighter">₹{currentTotal}</span>
            </div>
            <button 
              onClick={handleCheckoutClick} 
              className="w-full bg-white text-black py-6 rounded-full font-black uppercase hover:invert transition-all active:scale-95"
            >
              Checkout Now
            </button>
          </div>
        </div>
      </div>

      {/* MODAL MOUNTING LOGIC */}
      {isCheckoutOpen && (
        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          initialCart={cart} // Using the direct state reference
          initialTotal={Number(currentTotal)} clearCart={function (): void {
            throw new Error("Function not implemented.");
          } }        />
      )}
    </>
  );
}