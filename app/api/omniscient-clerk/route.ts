import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  "iPhone 15 Pro": "A marvel of titanium engineering and powerful performance.",
  "Samsung 4K TV": "Cinematic brilliance in the comfort of your living room.",
  "Sony WH-1000XM5": "Industry-leading noise cancellation for pure audio bliss.",
  "MacBook Air M2": "Supercharged by M2, incredibly thin and incredibly fast.",
  "iPad Pro 12.9": "The ultimate iPad experience with XDR display technology.",
  "Canon EOS R50": "Perfect for creators looking to upgrade their visual storytelling.",
  "Mechanical Keyboard": "Tactile, precise, and built for those who love the click.",
  "MX Master 3": "The gold standard for productivity and ergonomic design.",
  "Echo Dot 5th Gen": "Smart audio that fills your room with helpful intelligence.",
  "Dell 27 Monitor": "Crystal clear resolution for work and gaming.",
  "Leather Sofa": "Premium top-grain leather for a timeless aesthetic.",
  "Bamboo Table": "Sustainable elegance for the modern home.",
  "Blackout Curtains": "Sleep deeper with total light control.",
  "Smart LED Bulbs": "Millions of colors to match every mood.",
  "Scented Candles": "Hand-poured luxury scents.",
  "Floating Shelf": "Minimalist display solution.",
  "Ceramic Pot Set": "Handcrafted ceramics for your plants.",
  "Mattress Topper": "Five-star hotel comfort.",
  "Cookware Set": "Professional grade stainless steel.",
  "Vanity Mirror": "Integrated lighting for beauty.",
  "Classic Chinos": "The versatile essential for any wardrobe.",
  "Oversized Hoodie": "Unmatched comfort in a relaxed fit.",
  "Denim Jacket": "Rugged style that gets better with age.",
  "Maxi Dress": "Flowing elegance for summer evenings.",
  "Wool Sweater": "Premium merino wool.",
  "Yoga Leggings": "High-performance fabric.",
  "Oxford Shirt": "Sharp, tailored, and ready.",
  "Puffer Jacket": "Ultra-light insulation.",
  "Linen Pants": "Ultimate breathable summer fabric.",
  "Kids T-Shirt": "Soft organic cotton.",
  "Premium Yoga Mat": "High-grip surface.",
  "Dumbbell Set": "Complete home strength workout.",
  "Running Shoes": "Responsive cushioning.",
  "Resistance Bands": "Portable and versatile.",
  "Fitness Watch": "Track health in style.",
  "Foam Roller": "Essential recovery tool.",
  "Basketball": "Pro-grip texture.",
  "Cycling Helmet": "Aero-dynamic protection.",
  "Speed Rope": "Lightning fast rotations.",
  "Gym Duffel": "Organized storage.",
  "Atomic Habits": "Small changes, remarkable results.",
  "Dune": "The sci-fi masterpiece.",
  "Psychology of Money": "Timeless lessons on wealth.",
  "Sapiens": "A brief history of humankind.",
  "Deep Work": "Focused success in a distracted world.",
  "Harry Potter Box": "The complete Wizarding journey.",
  "Think & Grow Rich": "Original guide to financial mindset.",
  "The Lean Startup": "Innovation for radical success.",
  "1984": "Chilling vision of the future.",
  "Zero to One": "How to build the future.",
};

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // --- Step 1: Check env vars ---
    const groqKey = process.env.GROQ_API_KEY;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!groqKey) {
      console.error("[Clerk] GROQ_API_KEY is missing from .env.local");
      return NextResponse.json({ error: "Missing Groq API key." }, { status: 500 });
    }
    if (!convexUrl) {
      console.error("[Clerk] NEXT_PUBLIC_CONVEX_URL is missing from .env.local");
      return NextResponse.json({ error: "Missing Convex URL." }, { status: 500 });
    }

    // --- Step 2: Fetch products from Convex ---
    let dbProducts: any[] = [];
    try {
      const convex = new ConvexHttpClient(convexUrl);
      dbProducts = await convex.query(api.products.getAll);
      console.log(`[Clerk] Fetched ${dbProducts.length} products from Convex`);
    } catch (convexError) {
      console.error("[Clerk] Convex fetch failed:", convexError);
      dbProducts = [];
    }

    // --- Step 3: Build product context ---
    const productContext = dbProducts.length === 0
      ? "No products are currently available in the database."
      : dbProducts.map((p) => {
          const desc = PRODUCT_DESCRIPTIONS[p.title] ?? "No description available.";
          const stockStatus = p.stock === 0 ? "OUT OF STOCK" : `${p.stock} in stock`;
          return `- ${p.title} | Category: ${p.category} | Price: $${p.price} | Stock: ${stockStatus} | About: ${desc}`;
        }).join("\n");

    const systemPrompt = `You are "The Omniscient Clerk", a shopping assistant. Your ONLY job is to recommend products from the catalog below.

ABSOLUTE RULES — NEVER BREAK THESE:
1. ONLY use products, prices, and stock info from the LIVE PRODUCT CATALOG below. Copy the price EXACTLY as written.
2. NEVER invent, guess, or modify any product name, price, or stock number. If it is not in the catalog, it does not exist.
3. NEVER recommend a product marked OUT OF STOCK.
4. NEVER recommend a product whose price exceeds the user's budget.
5. ALWAYS respond in this exact format, one line per product, nothing else:

• [Product Name] — $[exact price from catalog] — [one reason why]
• [Product Name] — $[exact price from catalog] — [one reason why]

6. Max 3 products per response.
7. After listing products, add one final line: Total: $[sum]
8. If no products fit, say: "Nothing in our catalog fits that need right now."

LIVE PRODUCT CATALOG:
${productContext}`;

    // --- Step 4: Call Groq (free, no credit card needed) ---
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("[Clerk] Groq API error:", groqRes.status, errText);

      if (groqRes.status === 429) {
        return NextResponse.json(
          { error: "⏳ Too many requests — please wait a moment and try again!" },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `Groq error ${groqRes.status}: ${errText}` },
        { status: 500 }
      );
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("[Clerk] Unhandled error:", error?.message ?? error);
    return NextResponse.json({ error: error?.message ?? "Something went wrong." }, { status: 500 });
  }
}