export const CATEGORIES = [
  { name: "Electronics", color: "from-blue-400 to-blue-900", darkColor: "#1e3a8a" },
  { name: "Fashion", color: "from-rose-400 to-rose-900", darkColor: "#881337" },
  { name: "Home", color: "from-emerald-400 to-emerald-900", darkColor: "#064e3b" },
  { name: "Accessories", color: "from-amber-400 to-amber-900", darkColor: "#78350f" }
];

export const MOCK_PRODUCTS = Array.from({ length: 50 }).map((_, i) => {
  const cat = CATEGORIES[i % CATEGORIES.length];
  
  // Generating generic but requirement-compliant descriptions
  const descriptions = [
    "A high-performance device designed for modern professionals.",
    "Elegant design meets everyday functionality in this premium piece.",
    "Experience the perfect blend of style and durability.",
    "Engineered with precision for a superior user experience."
  ];

  return {
    id: (i + 1).toString(), // IDs are better as strings for URL routing
    title: `Premium ${cat.name} Item ${i + 1}`,
    price: Math.floor(Math.random() * 450) + 50,
    category: cat.name,
    description: descriptions[i % descriptions.length], // Requirement: Description
    stock: Math.floor(Math.random() * 25) + 5,         // Requirement: Stock Quantity
    image: i % 2 === 0 
      ? "https://www.pngmart.com/files/15/Apple-Watch-Series-5-PNG-Transparent-Image.png" 
      : "https://www.pngmart.com/files/1/Backpack-PNG-Transparent-Image.png",
  };
});