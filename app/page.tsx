"use client";
import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { create } from "zustand";
import confetti from "canvas-confetti";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

import CheckoutModal from "@/components/CheckoutModal";
import OmniscientClerk from "@/components/OmniscientClerk";
import WishlistSidebar from "@/components/WishlistSidebar";
import VibeSearch from "@/components/VibeSearch";
import ExistentialFooter from "@/components/ExistentialFooter";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// --- GLOBAL STORE ---
interface CartItem { id: number; title: string; price: number; image: string; quantity: number; }
interface CartState {
  cart: CartItem[];
  addItem: (product: any) => void;
  removeItem: (id: number) => void;
  decreaseItem: (id: number) => void;
  totalPrice: () => number;
  clearCart: () => void;
}

const useStore = create<CartState>((set, get) => ({
  cart: [],
  addItem: (product) => set((state) => {
    const exists = state.cart.find(item => item.id === product.id);
    if (exists) return { cart: state.cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) };
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),
  removeItem: (id) => set((state) => ({ cart: state.cart.filter(item => item.id !== id) })),
  decreaseItem: (id) => set((state) => ({
    cart: state.cart
      .map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item)
      .filter(item => item.quantity > 0)
  })),
  totalPrice: () => get().cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
  clearCart: () => set({ cart: [] }),
}));

// --- CATEGORIES & PRODUCTS ---
const CATEGORIES = [
  { name: "Electronics", color: "from-blue-600 to-blue-900", darkColor: "#172554", accentHex: "#60a5fa" },
  { name: "Home",        color: "from-amber-500 to-orange-800", darkColor: "#431407", accentHex: "#fbbf24" },
  { name: "Apparel",     color: "from-pink-500 to-rose-900", darkColor: "#4c0519", accentHex: "#f472b6" },
  { name: "Sports",      color: "from-emerald-500 to-teal-900", darkColor: "#022c22", accentHex: "#34d399" },
  { name: "Books",       color: "from-purple-600 to-indigo-900", darkColor: "#1e1b4b", accentHex: "#a78bfa" },
];

const MOCK_PRODUCTS = [
  { title: "iPhone 15 Pro", price: 999, category: "Electronics", image: "/products/iPhone_15_Pro.jpg", desc: "A marvel of titanium engineering and powerful performance." },
  { title: "Samsung 4K OLED TV 55", price: 1299, category: "Electronics", image: "/products/Samsung_4K_OLED_TV_55.jpg", desc: "Cinematic brilliance in the comfort of your living room." },
  { title: "Sony XM5 Headphones", price: 349, category: "Electronics", image: "/products/sony_xm5_headphones.jpg", desc: "Industry-leading noise cancellation for pure audio bliss." },
  { title: "MacBook Air M2", price: 1099, category: "Electronics", image: "/products/MacBook_Air_M2.jpg", desc: "Supercharged by M2, incredibly thin and incredibly fast." },
  { title: "iPad Pro 13", price: 1099, category: "Electronics", image: "/products/iPad_Pro_13.jpg", desc: "The ultimate iPad experience with XDR display technology." },
  { title: "Canon EOS R50 Camera", price: 679, category: "Electronics", image: "/products/Canon_EOS_R50_Camera.jpg", desc: "Perfect for creators looking to upgrade their visual storytelling." },
  { title: "Gaming Mechanical Keyboard", price: 89, category: "Electronics", image: "/products/Gaming_Mechanical_Keyboard.jpg", desc: "Tactile, precise, and built for those who love the click." },
  { title: "Logitech MX Master 3 Mouse", price: 99, category: "Electronics", image: "/products/Logitech_MX_Master_3_Mouse.jpg", desc: "The gold standard for productivity and ergonomic design." },
  { title: "Amazon Echo Dot (5th Gen)", price: 49, category: "Electronics", image: "/products/Amazon_Echo_Dot(5th Gen).jpg", desc: "Smart audio that fills your room with helpful intelligence." },
  { title: "Dell 27 Monitor", price: 329, category: "Electronics", image: "/products/Dell_27_Monitor.jpg", desc: "Crystal clear resolution for work and gaming." },
  { title: "Minimalist Leather Sofa", price: 1499, category: "Home", image: "/products/Minimalist_Leather_Sofa.jpg", desc: "Premium top-grain leather for a timeless aesthetic." },
  { title: "Bamboo Coffee Table", price: 249, category: "Home", image: "/products/Bamboo_Coffee_Table.jpg", desc: "Sustainable elegance for the modern home." },
  { title: "Blackout Curtains Set", price: 59, category: "Home", image: "/products/Blackout_Curtains_Set.jpg", desc: "Sleep deeper with total light control." },
  { title: "Smart LED Bulb Pack (4pcs)", price: 39, category: "Home", image: "/products/Smart_LED_Bulb_Pack(4pcs).jpg", desc: "Millions of colors to match every mood." },
  { title: "Scented Candle Gift Set", price: 45, category: "Home", image: "/products/Scented_Candle_Gift_Set.jpg", desc: "Hand-poured luxury scents." },
  { title: "Wall Mounted Bookshelf", price: 79, category: "Home", image: "/products/Wall_Mounted_Bookshelf.jpg", desc: "Minimalist display solution." },
  { title: "Ceramic Plant Pot Set", price: 35, category: "Home", image: "/products/Ceramic_Plant_Pot_Set.jpg", desc: "Handcrafted ceramics for your plants." },
  { title: "Memory Foam Mattress Topper", price: 129, category: "Home", image: "/products/Memory_Foam_Mattress_Topper.jpg", desc: "Five-star hotel comfort." },
  { title: "Stainless Steel Cookware Set", price: 189, category: "Home", image: "/products/Stainless_Steel_Cookware_Set.jpg", desc: "Professional grade stainless steel." },
  { title: "Bathroom Vanity Mirror", price: 119, category: "Home", image: "/products/Bathroom_Vanity_Mirror.jpg", desc: "Integrated lighting for beauty." },
  { title: "Men's Classic Fit Chinos", price: 49, category: "Apparel", image: "/products/Men's_Classic_Fit_Chinos.jpg", desc: "The versatile essential for any wardrobe." },
  { title: "Women's Oversized Hoodie", price: 44, category: "Apparel", image: "/products/Women's_Oversized_Hoodie.jpg", desc: "Unmatched comfort in a relaxed fit." },
  { title: "Slim Fit Denim Jacket", price: 69, category: "Apparel", image: "/products/Slim_Fit_Denim_Jacket.jpg", desc: "Rugged style that gets better with age." },
  { title: "Women's Floral Maxi Dress", price: 59, category: "Apparel", image: "/products/Women's_Floral_Maxi_Dress.jpg", desc: "Flowing elegance for summer evenings." },
  { title: "Men's Merino Wool Sweater", price: 89, category: "Apparel", image: "/products/Men's_Merino_Wool_Sweater.jpg", desc: "Premium merino wool." },
  { title: "Women's Yoga Leggings", price: 39, category: "Apparel", image: "/products/Women's_Yoga_Leggings.jpg", desc: "High-performance fabric." },
  { title: "Men's Formal Oxford Shirt", price: 55, category: "Apparel", image: "/products/Men's_Formal_Oxford_Shirt.jpg", desc: "Sharp, tailored, and ready." },
  { title: "Unisex Puffer Jacket", price: 99, category: "Apparel", image: "/products/Unisex_Puffer_Jacket.jpg", desc: "Ultra-light insulation." },
  { title: "Women's Linen Wide Leg Pants", price: 52, category: "Apparel", image: "/products/Women's_Linen_Wide_Leg_Pants.jpg", desc: "Ultimate breathable summer fabric." },
  { title: "Kids Graphic T-Shirt Pack (3pcs)", price: 29, category: "Apparel", image: "/products/Kids_Graphic_T-Shirt_Pack(3pcs).jpg", desc: "Soft organic cotton." },
  { title: "Yoga Mat Premium", price: 45, category: "Sports", image: "/products/Yoga_Mat_Premium.jpg", desc: "High-grip surface." },
  { title: "Adjustable Dumbbell Set", price: 299, category: "Sports", image: "/products/Adjustable_Dumbbell_Set.jpg", desc: "Complete home strength workout." },
  { title: "Running Shoes (Men's)", price: 119, category: "Sports", image: "/products/Running_Shoes(Men's).jpg", desc: "Responsive cushioning." },
  { title: "Resistance Bands Set (5pcs)", price: 24, category: "Sports", image: "/products/Resistance_Bands_Set(5pcs).jpg", desc: "Portable and versatile." },
  { title: "Smart Fitness Watch", price: 179, category: "Sports", image: "/products/Smart_Fitness_Watch.jpg", desc: "Track health in style." },
  { title: "Foam Roller", price: 29, category: "Sports", image: "/products/Foam_Roller.jpg", desc: "Essential recovery tool." },
  { title: "Basketball (Size 7)", price: 34, category: "Sports", image: "/products/Basketball_(Size 7).jpg", desc: "Pro-grip texture." },
  { title: "Cycling Helmet", price: 79, category: "Sports", image: "/products/Cycling_Helmet.jpg", desc: "Aero-dynamic protection." },
  { title: "Jump Rope Speed Cable", price: 18, category: "Sports", image: "/products/Jump_Rope_Speed_Cable.jpg", desc: "Lightning fast rotations." },
  { title: "Gym Duffel Bag", price: 55, category: "Sports", image: "/products/Gym_Duffel_Bag.jpg", desc: "Organized storage." },
  { title: "The Atomic Habits (Book)", price: 16, category: "Books", image: "/products/The_Atomic_Habits(Book).jpg", desc: "Small changes, remarkable results." },
  { title: "Dune (Hardcover)", price: 28, category: "Books", image: "/products/Dune_(Hardcover).jpg", desc: "The sci-fi masterpiece." },
  { title: "The Psychology of Money", price: 18, category: "Books", image: "/products/The_Psychology_of_Money.jpg", desc: "Timeless lessons on wealth." },
  { title: "Sapiens A Brief History", price: 17, category: "Books", image: "/products/Sapiens_A_Brief_History.jpg", desc: "A brief history of humankind." },
  { title: "Deep Work by Cal Newport", price: 15, category: "Books", image: "/products/Deep_Work_by_Cal_Newport.jpg", desc: "Focused success in a distracted world." },
  { title: "Harry Potter Box Set (7 Books)", price: 89, category: "Books", image: "/products/Harry_Potter_Box_Set(7 Books).jpg", desc: "The complete Wizarding journey." },
  { title: "Think and Grow Rich", price: 12, category: "Books", image: "/products/Think_and_Grow_Rich.jpg", desc: "Original guide to financial mindset." },
  { title: "The Lean Startup", price: 19, category: "Books", image: "/products/The_Lean_Startup.jpg", desc: "Innovation for radical success." },
  { title: "1984 by George Orwell", price: 13, category: "Books", image: "/products/1984_by_George_Orwell.jpg", desc: "Chilling vision of the future." },
  { title: "Zero to One by Peter Thiel", price: 17, category: "Books", image: "/products/Zero_to_One_by_Peter_Thiel.jpg", desc: "How to build the future." },
].map((p, i) => ({ ...p, id: i }));

// Deterministic fallback stock per product (used only if Convex title doesn't match)
const FALLBACK_STOCK: Record<number, number> = {
  0:15, 1:8, 2:22, 3:10, 4:12, 5:6, 6:30, 7:25, 8:20, 9:14,
  10:4, 11:9, 12:18, 13:27, 14:24, 15:11, 16:7, 17:13, 18:5, 19:16,
  20:23, 21:19, 22:28, 23:17, 24:8, 25:21, 26:14, 27:12, 28:26, 29:30,
  30:18, 31:10, 32:15, 33:25, 34:9, 35:20, 36:22, 37:7, 38:29, 39:11,
  40:30, 41:24, 42:27, 43:19, 44:28, 45:13, 46:16, 47:21, 48:23, 49:17,
};

// --- COMPONENTS ---
const CartSidebar = ({ isOpen, onClose, onCheckout, onStockChange }: { isOpen: boolean, onClose: () => void, onCheckout: () => void, onStockChange: (id: number, delta: number) => void }) => {
  const { cart, removeItem, decreaseItem, totalPrice } = useStore();
  const incrementStock = useMutation(api.products.incrementStock);
  const sidebarRef = useRef(null);
  useGSAP(() => { gsap.to(sidebarRef.current, { x: isOpen ? 0 : "105%", duration: 1, ease: "expo.out" }); }, [isOpen]);

  const handleRemove = async (item: { id: number; title: string; quantity: number }) => {
    // ✅ Restore stock in UI instantly
    onStockChange(item.id, item.quantity);
    removeItem(item.id);
    for (let i = 0; i < item.quantity; i++) {
      incrementStock({ title: item.title }).catch(() => {});
    }
  };

  const handleDecrease = async (item: { id: number; title: string; quantity: number }) => {
    // ✅ Restore 1 unit in UI instantly
    onStockChange(item.id, 1);
    decreaseItem(item.id);
    incrementStock({ title: item.title }).catch(() => {});
  };

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[150] transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <div ref={sidebarRef} className="fixed top-0 right-0 h-full w-full md:w-[480px] z-[200] translate-x-full flex">
        <div className="flex-1 glass backdrop-blur-[45px] border-l border-white/10 p-12 flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-16 text-white">
            <h2 className="text-4xl font-black uppercase tracking-tighter">Your Bag</h2>
            <button onClick={onClose} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 border border-white/20 px-6 py-2 rounded-full transition-all">Close</button>
          </div>
          <div className="flex-1 space-y-8 overflow-y-auto pr-4 custom-scrollbar text-white">
            {cart.length === 0 && <p className="opacity-20 italic text-sm text-center mt-20">Bag is empty...</p>}
            {cart.map((item) => (
              <div key={item.id} className="flex gap-6 items-center">
                <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden shrink-0 flex items-center justify-center">
                  <img src={item.image} className="w-full h-full object-contain p-1" />
                </div>
                <div className="flex-1"><h4 className="text-[11px] font-black uppercase truncate">{item.title}</h4><p className="text-sm font-bold opacity-40">${item.price} x{item.quantity}</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleDecrease(item); }} className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all text-sm font-black">−</button>
                  <span className="text-white font-black text-sm w-4 text-center">{item.quantity}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleRemove(item); }} className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-red-400 hover:border-red-400 transition-all text-xs font-black">✕</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-white">
            <div className="flex justify-between items-end mb-8"><span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Subtotal</span><span className="text-5xl font-black tracking-tighter">${totalPrice()}</span></div>
            <button onClick={onCheckout} className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:invert transition-all">Checkout Now</button>
          </div>
        </div>
      </div>
    </>
  );
};

// ✅ UPDATED ProductCard — flex-col, no absolute overlap, image fixed height, info auto-height
const ProductCard = ({ product, onOpen, stock, onStockChange, userId, wishlisted, onWishlistToggle }: { product: any, onOpen: (p: any) => void, stock: number, onStockChange: (id: number, delta: number) => void, userId: string | null, wishlisted: boolean, onWishlistToggle: (p: any) => void }) => {
  const addItem = useStore(state => state.addItem);
  const decrementStock = useMutation(api.products.decrementStock);
  const imgRef = useRef<HTMLImageElement>(null);
  useGSAP(() => { gsap.to(imgRef.current, { y: -6, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut" }); });

  const isOutOfStock = stock === 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    // ✅ Update UI instantly
    onStockChange(product.id, -1);
    addItem(product);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 }, colors: ['#ffffff'] });
    // Fire DB mutation in background
    decrementStock({ title: product.title }).catch(() => {
      // Rollback local adjustment if DB fails
      onStockChange(product.id, 1);
    });
  };

  return (
    // Pure flex-col — image on top, info below, ZERO overlap
    <div onClick={() => onOpen(product)} className="product-card group flex flex-col cursor-pointer select-none">

      {/* IMAGE BUBBLE — fixed 220px height, white bg, object-contain with padding */}
      <div className="relative w-full rounded-[2rem] bg-white overflow-hidden shadow-xl transition-transform duration-500 group-hover:scale-[1.02] z-10" style={{ height: "220px" }}>
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
        {/* Wishlist inside image bubble, top-right */}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlistToggle(product); }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-90 ${
            wishlisted ? "border-red-400/60 text-red-500 bg-red-50" : "border-black/10 text-black/30 bg-white/70 hover:text-black/60"
          }`}
        >
          <span className="text-sm leading-none">{wishlisted ? "♥" : "♡"}</span>
        </button>
      </div>

      {/* INFO BUBBLE — auto height, full title always visible, never clipped */}
      <div className="glass border border-white/10 rounded-[2rem] px-6 py-5 flex flex-col gap-2.5 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/25 -mt-6 pt-10 z-0">
        <p className="text-white/35 text-[9px] font-black uppercase tracking-[0.2em]">{product.category}</p>

        {/* Full title — wraps freely across as many lines as needed */}
        <h3 className="text-white font-black uppercase tracking-tight text-[13px] leading-snug break-words">
          {product.title}
        </h3>

        <div>
          {isOutOfStock ? (
            <span className="text-red-400 text-[9px] font-black uppercase tracking-widest">⊘ Out of stock</span>
          ) : stock <= 5 ? (
            <span className="text-amber-400 text-[9px] font-black uppercase tracking-widest">⚡ Only {stock} left</span>
          ) : (
            <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">✓ {stock} in stock</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-white font-black text-[22px] tracking-tighter leading-none">${product.price}</span>
          {isOutOfStock ? (
            <span className="text-[9px] font-black uppercase tracking-widest text-red-400/50 border border-red-400/20 px-4 py-2 rounded-xl cursor-not-allowed whitespace-nowrap">Unavailable</span>
          ) : (
            <button onClick={handleAdd} className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:invert active:scale-95 transition-all duration-150 shadow-sm whitespace-nowrap">Add</button>
          )}
        </div>
      </div>
    </div>
  );
};

const QuickView = ({ product, onClose, stock, onStockChange }: { product: any | null, onClose: () => void, stock: number, onStockChange: (id: number, delta: number) => void }) => {
  const addItem = useStore(state => state.addItem);
  const decrementStock = useMutation(api.products.decrementStock);
  const modalRef = useRef(null);
  useGSAP(() => { if (product) gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }); }, [product]);
  if (!product) return null;

  const isOutOfStock = stock === 0;

  const handleAdd = async () => {
    if (isOutOfStock) return;
    // ✅ Update UI instantly
    onStockChange(product.id, -1);
    addItem(product);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 }, colors: ['#ffffff'] });
    onClose();
    // Fire DB mutation in background
    decrementStock({ title: product.title }).catch(() => {
      onStockChange(product.id, 1);
    });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 md:p-12">
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      <div ref={modalRef} className="glass relative w-full max-w-6xl overflow-hidden rounded-[4rem] border border-white/10 flex flex-col md:flex-row h-auto md:h-[70vh] shadow-2xl">
        <button onClick={onClose} className="absolute top-8 right-8 z-50 text-white opacity-40 hover:opacity-100 text-xl">✕</button>
        <div className="w-full md:w-1/2 p-12 flex items-center justify-center bg-white rounded-l-[4rem]">
          <img src={product.image} className="max-w-full max-h-full object-contain" />
        </div>
        <div className="w-full md:w-1/2 p-16 flex flex-col justify-center text-white">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 mb-4">{product.category}</span>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-tight mb-8">{product.title}</h2>
          <p className="text-lg opacity-60 leading-relaxed mb-8">{product.desc}</p>
          <div className="mb-8">
            {isOutOfStock ? (
              <span className="text-red-400 text-[11px] font-black uppercase tracking-widest">⊘ Not Available</span>
            ) : stock <= 5 ? (
              <span className="text-amber-400 text-[11px] font-black uppercase tracking-widest">⚡ Only {stock} left</span>
            ) : (
              <span className="text-emerald-400 text-[11px] font-black uppercase tracking-widest">✓ {stock} in stock</span>
            )}
          </div>
          <div className="items-center gap-12 hidden md:flex">
            <span className="text-5xl font-black tracking-tighter">${product.price}</span>
            {isOutOfStock ? (
              <span className="flex-1 text-center bg-red-500/10 text-red-400/60 border border-red-500/20 py-6 rounded-3xl font-black uppercase tracking-widest text-xs cursor-not-allowed">Not Available</span>
            ) : (
              <button onClick={handleAdd} className="flex-1 bg-white text-black py-6 rounded-3xl font-black uppercase tracking-widest text-xs hover:invert transition-all">Add to Bag</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function DisneyStore() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceLimit, setPriceLimit] = useState(1500);
  const [theme, setTheme] = useState({ gradient: "from-slate-800 to-slate-950", shHex: "#0f172a", accentHex: "#ffffff" });
  const [isGlitching, setIsGlitching] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isVibeSearchOpen, setIsVibeSearchOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<any>(null);

  // ✅ Local stock adjustments — instant UI update regardless of DB title match
  const [localStockAdjust, setLocalStockAdjust] = useState<Record<number, number>>({});

  const adjustLocalStock = (productId: number, delta: number) => {
    setLocalStockAdjust(prev => ({ ...prev, [productId]: (prev[productId] ?? 0) + delta }));
  };

  const mainRef = useRef(null);
  const logoBoxRef = useRef(null);

  const addToWishlist = useMutation(api.wishlist.addToWishlist);
  const removeFromWishlist = useMutation(api.wishlist.removeFromWishlist);
  const wishlistItems = useQuery(api.wishlist.getWishlist, userId ? { userId } : "skip") ?? [];
  const wishlistIds = new Set(wishlistItems.map((w: any) => w.productId));

  const handleWishlistToggle = async (product: any) => {
    if (!userId) { alert("Please sign in to save to wishlist!"); return; }
    if (wishlistIds.has(product.id)) {
      await removeFromWishlist({ userId, productId: product.id });
    } else {
      await addToWishlist({ userId, productId: product.id, title: product.title, price: product.price, image: product.image, category: product.category });
    }
  };

  const dbProducts = useQuery(api.products.getAll) ?? [];
  const stockMap = Object.fromEntries(dbProducts.map(p => [p.title, p.stock]));

  // ✅ Merge DB stock with local adjustments for instant UI feedback
  const getStock = (product: any) => {
    const dbStock = stockMap[product.title] ?? (FALLBACK_STOCK[product.id] ?? 10);
    const adj = localStockAdjust[product.id] ?? 0;
    return Math.max(0, dbStock + adj);
  };

  const cart = useStore(state => state.cart);
  const totalPrice = useStore(state => state.totalPrice);
  const clearCart = useStore(state => state.clearCart);
  const cartCount = useStore(state => state.cart.reduce((acc, item) => acc + item.quantity, 0));

  const filtered = useMemo(() => MOCK_PRODUCTS.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) &&
    (selectedCategory === "All" || p.category === selectedCategory) &&
    p.price <= priceLimit
  ), [search, selectedCategory, priceLimit]);

  useGSAP(() => {
    ScrollTrigger.batch(".product-card", {
      onEnter: (elements) => {
        gsap.fromTo(elements,
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 1, ease: "power3.out", overwrite: true }
        );
      },
      once: false
    });
  }, { scope: mainRef, dependencies: [filtered] });

  const handleCategoryChange = (name: string) => {
    const cat = CATEGORIES.find(c => c.name === name);
    setSelectedCategory(name);
    setTheme(cat ? { gradient: cat.color, shHex: cat.darkColor, accentHex: cat.accentHex } : { gradient: "from-slate-800 to-slate-950", shHex: "#0f172a", accentHex: "#ffffff" });
  };

  const onLogoMove = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    gsap.to(logoBoxRef.current, { x: x * 0.4, y: y * 0.4, rotationY: x * 0.5, rotationX: -y * 0.5, duration: 0.3 });
  };

  return (
    <main ref={mainRef} className={`relative min-h-screen transition-all duration-1000 bg-gradient-to-br ${theme.gradient} text-white overflow-x-hidden pb-0`}>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} onStockChange={adjustLocalStock} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialCart={cart}
        initialTotal={totalPrice()}
        clearCart={clearCart}
        userId={userId ?? undefined}
      />

      <VibeSearch
        isOpen={isVibeSearchOpen}
        onClose={() => setIsVibeSearchOpen(false)}
        onAddToCart={(product) => useStore.getState().addItem(product)}
        userId={userId ?? null}
        mockProducts={MOCK_PRODUCTS}
      />

      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} userId={userId ?? null} onAddToCart={(product) => useStore.getState().addItem(product)} />
      <QuickView product={activeProduct} onClose={() => setActiveProduct(null)} stock={activeProduct ? getStock(activeProduct) : 0} onStockChange={adjustLocalStock} />
      <OmniscientClerk />

      {/* HEADER */}
      <header className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-12 h-32 transition-opacity ${isCartOpen || activeProduct ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center gap-6 min-w-[300px] cursor-pointer" onMouseMove={onLogoMove} onMouseEnter={() => setIsGlitching(true)} onMouseLeave={() => { setIsGlitching(false); gsap.to(logoBoxRef.current, { x: 0, y: 0, rotationX: 0, rotationY: 0 }); }}>
          <div ref={logoBoxRef} style={{ backgroundColor: theme.shHex }} className="w-16 h-16 rounded-2xl shadow-2xl border border-white/20 transition-colors duration-1000 shrink-0" />
          <div className={isGlitching ? 'animate-pulse' : ''}>
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none flex items-baseline gap-0">
                <span style={{ color: theme.accentHex }} className="transition-colors duration-700">CAR</span>
                <span className="text-white">TEX.</span>
              </h1>
            <p className="text-[9px] font-bold tracking-[0.6em] opacity-40 uppercase mt-2">Presented by UEM</p>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <input type="text" placeholder="Search..." className="glass px-10 py-3 rounded-full w-80 lg:w-[420px] outline-none text-sm focus:border-white/40 transition-all" onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-col items-end gap-3 min-w-[300px]">
          <div className="flex items-center">
            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <button className="px-6 py-2 bg-white/10 hover:bg-white hover:text-black backdrop-blur-md border border-white/20 rounded-full transition-all duration-300 text-[10px] font-black uppercase tracking-[2px]">Sign In</button>
              </SignInButton>
            )}
            {isLoaded && isSignedIn && (
              <div className="flex items-center gap-3 px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
                <span className="text-[9px] font-bold opacity-50 uppercase tracking-widest ml-2">Account</span>
                <UserButton />
              </div>
            )}
          </div>
          <div className="glass px-6 py-2 rounded-full flex items-center gap-4 w-80 border border-white/5">
            <input type="range" min="0" max="1500" step="50" value={priceLimit} onChange={(e) => setPriceLimit(parseInt(e.target.value))} className="flex-1 accent-white h-1 opacity-50 cursor-pointer" />
            <span className="text-[10px] font-black w-12 text-right tracking-tighter">${priceLimit}</span>
          </div>
        </div>
      </header>

      {/* SIDE NAVIGATION */}
      <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-6 items-center">
        <button onClick={() => setIsVibeSearchOpen(true)} className="w-14 h-14 glass rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all shadow-2xl" title="Vibe Search">
          <span className="text-base">✦</span>
        </button>
        <button onClick={() => setIsWishlistOpen(true)} className="w-14 h-14 glass rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all shadow-2xl" title="Wishlist">
          <span className="text-sm">{wishlistIds.size > 0 ? "♥" : "♡"}</span>
        </button>
        <button onClick={() => setIsCartOpen(true)} className="cart-btn-trigger w-14 h-14 glass rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all shadow-2xl">
          <span className="text-[10px] font-black">{cartCount}</span>
        </button>
        <button onClick={() => handleCategoryChange("All")} className={`w-3 h-3 rounded-full border-2 border-white transition-all ${selectedCategory === "All" ? "bg-white scale-150 shadow-[0_0_15px_white]" : "opacity-30 hover:opacity-100"}`} />
        {CATEGORIES.map(c => (
          <button key={c.name} onClick={() => handleCategoryChange(c.name)} className={`w-3 h-3 rounded-full border-2 border-white transition-all ${selectedCategory === c.name ? "bg-white scale-150 shadow-[0_0_15px_white]" : "opacity-30 hover:opacity-100"}`} />
        ))}
      </nav>

      {/* PRODUCTS SECTION */}
      <section className="pt-52 px-6 lg:px-32">
        <div className="flex justify-center gap-3 mb-16 flex-wrap">
          {['All', ...CATEGORIES.map(c => c.name)].map(n => (
            <button key={n} onClick={() => handleCategoryChange(n)} className={`px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === n ? "bg-white text-black scale-110 shadow-2xl" : "glass opacity-50 hover:opacity-100"}`}>{n}</button>
          ))}
        </div>

        {/* ✅ gap-6 replaces gap-x-12 gap-y-40 — no more huge vertical gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filtered.map(p => <ProductCard key={p.id} product={p} onOpen={setActiveProduct} stock={getStock(p)} onStockChange={adjustLocalStock} userId={userId ?? null} wishlisted={wishlistIds.has(p.id)} onWishlistToggle={handleWishlistToggle} />)}
        </div>
      </section>

      {/* EXISTENTIAL CRISIS FOOTER */}
      <ExistentialFooter itemCount={filtered.length} />
    </main>
  );
}
