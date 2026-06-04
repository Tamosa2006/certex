"use client";

import { useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, totalPrice } = useCart();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const formRef = useRef(null);

  // Animation when step changes
  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );
  }, [step]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
  };

  if (step === 3) return <OrderSuccess />;

  return (
    <main className="container mx-auto px-6 py-12 max-w-4xl">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className={`h-1 flex-1 ${step >= 1 ? "bg-black" : "bg-gray-200"}`} />
        <div className={`h-1 flex-1 ${step >= 2 ? "bg-black" : "bg-gray-200"}`} />
        <div className="absolute w-full flex justify-between -top-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`w-5 h-5 rounded-full border-4 border-white ${step >= s ? "bg-black" : "bg-gray-300"}`} 
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Forms */}
        <div ref={formRef}>
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>
              <input required className="w-full p-3 border rounded-lg" placeholder="Full Name" />
              <input required className="w-full p-3 border rounded-lg" placeholder="Street Address" />
              <div className="flex gap-4">
                <input required className="w-1/2 p-3 border rounded-lg" placeholder="City" />
                <input required className="w-1/2 p-3 border rounded-lg" placeholder="ZIP Code" />
              </div>
              <button type="submit" className="w-full bg-black text-white py-4 rounded-lg font-bold">
                Continue to Payment
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
              <div className="p-4 border-2 border-black rounded-lg bg-gray-50 flex items-center justify-between">
                <span>Credit Card (Mock)</span>
                <div className="flex gap-2 text-xs">💳</div>
              </div>
              <input required className="w-full p-3 border rounded-lg" placeholder="Card Number (0000 0000 0000 0000)" />
              <div className="flex gap-4">
                <input required className="w-1/2 p-3 border rounded-lg" placeholder="MM/YY" />
                <input required className="w-1/2 p-3 border rounded-lg" placeholder="CVC" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold">
                Complete Purchase
              </button>
              <button onClick={() => setStep(1)} className="w-full text-gray-500 text-sm">Back to Shipping</button>
            </form>
          )}
        </div>

        {/* Right: Summary Card */}
        <div className="bg-gray-50 p-6 rounded-2xl h-fit">
          <h3 className="font-bold mb-4 border-b pb-2">Your Order</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.title}</span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}

function OrderSuccess() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6">
        ✓
      </div>
      <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 mb-8 text-lg">Thank you for your purchase. Your items are on the way.</p>
      <Link href="/" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition">
        Back to Shop
      </Link>
    </div>
  );
}