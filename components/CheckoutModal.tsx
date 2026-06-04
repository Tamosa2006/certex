"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import HaggleAgent from "@/components/HaggleAgent";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCart: any[];
  initialTotal: number;
  clearCart: () => void;
  userId?: string;
}

export default function CheckoutModal({ isOpen, onClose, initialCart, initialTotal, clearCart, userId }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI">("COD");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [discount, setDiscount] = useState(0);

  const placeOrder = useMutation(api.orders.placeOrder);
  const incrementStock = useMutation(api.products.incrementStock);

  const discountedTotal = +(initialTotal * (1 - discount)).toFixed(2);

  // ✅ Cancel = restore stock for every cart item, then close
  const handleCancel = async () => {
    try {
      for (const item of initialCart) {
        for (let i = 0; i < item.quantity; i++) {
          await incrementStock({ title: item.title });
        }
      }
    } catch (e) {
      console.error("Failed to restore stock:", e);
    }
    onClose();
  };

  const handleConfirmOrder = async () => {
    if (!name || !address) {
      alert("Please fill in your name and delivery address.");
      return;
    }
    if (!initialCart || initialCart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);

      await placeOrder({
        name: String(name),
        address: String(address),
        totalAmount: discountedTotal,
        paymentMethod: paymentMethod,
        status: "pending",
        createdAt: Date.now(),
        userId: userId,
      });

      // ✅ Order confirmed — stock stays decremented, just clear cart and close
      clearCart();
      onClose();
      setTimeout(() => window.location.reload(), 1500);

    } catch (error) {
      console.error("Convex error:", error);
      alert("Failed to place order. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="relative bg-zinc-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-lg text-white max-h-[90vh] overflow-y-auto">

        {/* ✅ Close button now calls handleCancel instead of onClose */}
        <button
          onClick={handleCancel}
          className="absolute top-8 right-8 text-white/30 hover:text-white text-xl font-black transition-all hover:rotate-90 duration-300"
        >
          ✕
        </button>

        <h2 className="text-3xl font-black uppercase mb-8 text-center">Finalize Order</h2>

        {/* Price display */}
        <div className="bg-white/5 p-6 rounded-3xl mb-6 border border-white/5 text-center">
          <p className="text-[10px] uppercase opacity-40 font-bold mb-1">Total Amount</p>
          {discount > 0 ? (
            <>
              <p className="text-2xl font-black tracking-tighter line-through opacity-30">${initialTotal}</p>
              <p className="text-5xl font-black tracking-tighter text-emerald-400">${discountedTotal}</p>
              <p className="text-emerald-400 text-[10px] font-black mt-1 uppercase tracking-widest">
                {(discount * 100).toFixed(0)}% haggle discount applied 🎉
              </p>
            </>
          ) : (
            <p className="text-5xl font-black tracking-tighter text-emerald-400">${initialTotal}</p>
          )}
        </div>

        {/* Haggle Agent */}
        <HaggleAgent
          cartTotal={initialTotal}
          cartItems={initialCart}
          currentDiscount={discount}
          onDiscountApplied={(d) => setDiscount(d)}
          userId={userId}
        />

        {/* Form fields */}
        <div className="space-y-4 mt-6 mb-8">
          <input
            type="text"
            placeholder="YOUR FULL NAME"
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-white transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder="DELIVERY ADDRESS"
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-white transition-all h-24"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Payment method */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/10">
          <button
            onClick={() => setPaymentMethod("COD")}
            className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${paymentMethod === "COD" ? "bg-white text-black" : "opacity-40"}`}
          >
            Cash on Delivery
          </button>
          <button
            onClick={() => setPaymentMethod("UPI")}
            className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${paymentMethod === "UPI" ? "bg-white text-black" : "opacity-40"}`}
          >
            UPI / QR Code
          </button>
        </div>

        {paymentMethod === "UPI" && (
          <div className="flex flex-col items-center mb-8 bg-white p-6 rounded-3xl">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=YOUR_VPA@okaxis&am=${discountedTotal}`}
              alt="Payment QR"
              className="w-40 h-40 mb-2"
            />
            <p className="text-black text-[10px] font-bold">SCAN TO PAY ${discountedTotal}</p>
          </div>
        )}

        <button
          onClick={handleConfirmOrder}
          disabled={loading}
          className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase hover:invert transition-all disabled:opacity-50"
        >
          {loading ? "Placing Order..." : `Confirm & Pay $${discountedTotal}`}
        </button>
      </div>
    </div>
  );
}