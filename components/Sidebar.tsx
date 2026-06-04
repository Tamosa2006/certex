"use client";

interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
}

export default function Sidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
}: SidebarProps) {
  return (
    <aside className="w-full md:w-64 space-y-8 p-6 bg-gray-50 rounded-xl h-fit">
      <div>
        <h3 className="text-lg font-bold mb-4">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`block w-full text-left px-3 py-2 rounded-md transition ${
              selectedCategory === "All" ? "bg-black text-white" : "hover:bg-gray-200"
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`block w-full text-left px-3 py-2 rounded-md transition ${
                selectedCategory === cat ? "bg-black text-white" : "hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Max Price: ${priceRange[1]}</h3>
        <input
          type="range"
          min="0"
          max="500"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
        />
      </div>
    </aside>
  );
}