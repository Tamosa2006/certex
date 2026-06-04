import { mutation } from "./_generated/server";

const PRODUCTS = [
  // --- ELECTRONICS ---
  { id: 0, title: "iPhone 15 Pro", price: 999, category: "Electronics", stock: 15, image: "/products/iPhone_15_Pro.jpg" },
  { id: 1, title: "Samsung 4K OLED TV 55", price: 1299, category: "Electronics", stock: 8, image: "/products/Samsung_4K_OLED_TV_55.jpg" },
  { id: 2, title: "Sony XM5 Headphones", price: 349, category: "Electronics", stock: 22, image: "/products/sony_xm5_headphones.jpg" },
  { id: 3, title: "MacBook Air M2", price: 1099, category: "Electronics", stock: 10, image: "/products/MacBook_Air_M2.jpg" },
  { id: 4, title: "iPad Pro 13", price: 1099, category: "Electronics", stock: 12, image: "/products/iPad_Pro_13.jpg" },
  { id: 5, title: "Canon EOS R50 Camera", price: 679, category: "Electronics", stock: 6, image: "/products/Canon_EOS_R50_Camera.jpg" },
  { id: 6, title: "Gaming Mechanical Keyboard", price: 89, category: "Electronics", stock: 30, image: "/products/Gaming_Mechanical_Keyboard.jpg" },
  { id: 7, title: "Logitech MX Master 3 Mouse", price: 99, category: "Electronics", stock: 25, image: "/products/Logitech_MX_Master_3_Mouse.jpg" },
  { id: 8, title: "Amazon Echo Dot (5th Gen)", price: 49, category: "Electronics", stock: 40, image: "/products/Amazon_Echo_Dot(5th Gen).jpg" },
  { id: 9, title: "Dell 27 Monitor", price: 329, category: "Electronics", stock: 14, image: "/products/Dell_27_Monitor.jpg" },

  // --- HOME ---
  { id: 10, title: "Minimalist Leather Sofa", price: 1499, category: "Home", stock: 4, image: "/products/Minimalist_Leather_Sofa.jpg" },
  { id: 11, title: "Bamboo Coffee Table", price: 249, category: "Home", stock: 9, image: "/products/Bamboo_Coffee_Table.jpg" },
  { id: 12, title: "Blackout Curtains Set", price: 59, category: "Home", stock: 35, image: "/products/Blackout_Curtains_Set.jpg" },
  { id: 13, title: "Smart LED Bulb Pack (4pcs)", price: 39, category: "Home", stock: 50, image: "/products/Smart_LED_Bulb_Pack(4pcs).jpg" },
  { id: 14, title: "Scented Candle Gift Set", price: 45, category: "Home", stock: 60, image: "/products/Scented_Candle_Gift_Set.jpg" },
  { id: 15, title: "Wall Mounted Bookshelf", price: 79, category: "Home", stock: 20, image: "/products/Wall_Mounted_Bookshelf.jpg" },
  { id: 16, title: "Ceramic Plant Pot Set", price: 35, category: "Home", stock: 18, image: "/products/Ceramic_Plant_Pot_Set.jpg" },
  { id: 17, title: "Memory Foam Mattress Topper", price: 129, category: "Home", stock: 11, image: "/products/Memory_Foam_Mattress_Topper.jpg" },
  { id: 18, title: "Stainless Steel Cookware Set", price: 189, category: "Home", stock: 7, image: "/products/Stainless_Steel_Cookware_Set.jpg" },
  { id: 19, title: "Bathroom Vanity Mirror", price: 119, category: "Home", stock: 13, image: "/products/Bathroom_Vanity_Mirror.jpg" },

  // --- APPAREL ---
  { id: 20, title: "Men's Classic Fit Chinos", price: 49, category: "Apparel", stock: 45, image: "/products/Men's_Classic_Fit_Chinos.jpg" },
  { id: 21, title: "Women's Oversized Hoodie", price: 44, category: "Apparel", stock: 38, image: "/products/Women's_Oversized_Hoodie.jpg" },
  { id: 22, title: "Slim Fit Denim Jacket", price: 69, category: "Apparel", stock: 27, image: "/products/Slim_Fit_Denim_Jacket.jpg" },
  { id: 23, title: "Women's Floral Maxi Dress", price: 59, category: "Apparel", stock: 22, image: "/products/Women's_Floral_Maxi_Dress.jpg" },
  { id: 24, title: "Men's Merino Wool Sweater", price: 89, category: "Apparel", stock: 16, image: "/products/Men's_Merino_Wool_Sweater.jpg" },
  { id: 25, title: "Women's Yoga Leggings", price: 39, category: "Apparel", stock: 33, image: "/products/Women's_Yoga_Leggings.jpg" },
  { id: 26, title: "Men's Formal Oxford Shirt", price: 55, category: "Apparel", stock: 29, image: "/products/Men's_Formal_Oxford_Shirt.jpg" },
  { id: 27, title: "Unisex Puffer Jacket", price: 99, category: "Apparel", stock: 19, image: "/products/Unisex_Puffer_Jacket.jpg" },
  { id: 28, title: "Women's Linen Wide Leg Pants", price: 52, category: "Apparel", stock: 24, image: "/products/Women's_Linen_Wide_Leg_Pants.jpg" },
  { id: 29, title: "Kids Graphic T-Shirt Pack (3pcs)", price: 29, category: "Apparel", stock: 55, image: "/products/Kids_Graphic_T-Shirt_Pack(3pcs).jpg" },

  // --- SPORTS ---
  { id: 30, title: "Yoga Mat Premium", price: 45, category: "Sports", stock: 28, image: "/products/Yoga_Mat_Premium.jpg" },
  { id: 31, title: "Adjustable Dumbbell Set", price: 299, category: "Sports", stock: 10, image: "/products/Adjustable_Dumbbell_Set.jpg" },
  { id: 32, title: "Running Shoes (Men's)", price: 119, category: "Sports", stock: 17, image: "/products/Running_Shoes(Men's).jpg" },
  { id: 33, title: "Resistance Bands Set (5pcs)", price: 24, category: "Sports", stock: 42, image: "/products/Resistance_Bands_Set(5pcs).jpg" },
  { id: 34, title: "Smart Fitness Watch", price: 179, category: "Sports", stock: 15, image: "/products/Smart_Fitness_Watch.jpg" },
  { id: 35, title: "Foam Roller", price: 29, category: "Sports", stock: 36, image: "/products/Foam_Roller.jpg" },
  { id: 36, title: "Basketball (Size 7)", price: 34, category: "Sports", stock: 23, image: "/products/Basketball_(Size 7).jpg" },
  { id: 37, title: "Cycling Helmet", price: 79, category: "Sports", stock: 14, image: "/products/Cycling_Helmet.jpg" },
  { id: 38, title: "Jump Rope Speed Cable", price: 18, category: "Sports", stock: 48, image: "/products/Jump_Rope_Speed_Cable.jpg" },
  { id: 39, title: "Gym Duffel Bag", price: 55, category: "Sports", stock: 21, image: "/products/Gym_Duffel_Bag.jpg" },

  // --- BOOKS ---
  { id: 40, title: "The Atomic Habits (Book)", price: 16, category: "Books", stock: 70, image: "/products/The_Atomic_Habits(Book).jpg" },
  { id: 41, title: "Dune (Hardcover)", price: 28, category: "Books", stock: 44, image: "/products/Dune_(Hardcover).jpg" },
  { id: 42, title: "The Psychology of Money", price: 18, category: "Books", stock: 55, image: "/products/The_Psychology_of_Money.jpg" },
  { id: 43, title: "Sapiens A Brief History", price: 17, category: "Books", stock: 49, image: "/products/Sapiens_A_Brief_History.jpg" },
  { id: 44, title: "Deep Work by Cal Newport", price: 15, category: "Books", stock: 62, image: "/products/Deep_Work_by_Cal_Newport.jpg" },
  { id: 45, title: "Harry Potter Box Set (7 Books)", price: 89, category: "Books", stock: 20, image: "/products/Harry_Potter_Box_Set(7 Books).jpg" },
  { id: 46, title: "Think and Grow Rich", price: 12, category: "Books", stock: 75, image: "/products/Think_and_Grow_Rich.jpg" },
  { id: 47, title: "The Lean Startup", price: 19, category: "Books", stock: 40, image: "/products/The_Lean_Startup.jpg" },
  { id: 48, title: "1984 by George Orwell", price: 13, category: "Books", stock: 58, image: "/products/1984_by_George_Orwell.jpg" },
  { id: 49, title: "Zero to One by Peter Thiel", price: 17, category: "Books", stock: 35, image: "/products/Zero_to_One_by_Peter_Thiel.jpg" },
];

export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").collect();
    for (const p of existing) {
      await ctx.db.delete(p._id);
    }
    for (const product of PRODUCTS) {
      await ctx.db.insert("products", product);
    }
    return `✅ Seeded ${PRODUCTS.length} products with images successfully.`;
  },
});