"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const navRef = useRef(null);
  const { cart } = useCart();

  // Calculate total items in cart
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  useGSAP(() => {
    // Professional "Slide Down" animation on load
    gsap.from(navRef.current, {
      y: -100,
      opacity: 0,
      duration: 1.2,
      ease: "expo.out",
    });
  }, { scope: navRef });

  return (
    <nav 
      ref={navRef} 
      className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-black transition-transform group-hover:rotate-12" />
          <span className="text-xl font-bold tracking-tighter uppercase">
            Generic<span className="text-blue-600">Shop</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium hover:text-blue-600 transition">
            Shop All
          </Link>
          <Link href="/categories" className="text-sm font-medium hover:text-blue-600 transition">
            Categories
          </Link>
          <Link href="/profile" className="text-sm font-medium hover:text-blue-600 transition">
            My Orders
          </Link>
        </div>

        {/* Cart Icon / Counter */}
        <div className="flex items-center gap-4">
          <Link 
            href="/cart" 
            className="relative flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-all active:scale-95"
          >
            Cart
            {totalItems > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}