import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function POST(req: NextRequest) {
  try {
    const { messages, cartItems, currentDiscount, userId } = await req.json();

    const groqKey = process.env.GROQ_API_KEY;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!groqKey) return NextResponse.json({ error: "Missing Groq API key." }, { status: 500 });

    // ✅ STEP 1: Verify cart total from Convex DB (never trust client)
    let verifiedTotal = 0;
    let orderCount = 0;

    try {
      const convex = new ConvexHttpClient(convexUrl!);
      const dbProducts = await convex.query(api.products.getAll);
      const priceMap = Object.fromEntries(dbProducts.map((p: any) => [p.title, p.price]));

      for (const item of cartItems) {
        const realPrice = priceMap[item.title];
        if (realPrice === undefined) continue;
        verifiedTotal += realPrice * (item.quantity ?? 1);
      }
      verifiedTotal = +verifiedTotal.toFixed(2);

      // ✅ STEP 2: Check if returning customer via Clerk userId
      if (userId) {
        orderCount = await convex.query(api.orders.getUserOrderCount, { userId });
      }
    } catch (e) {
      console.error("[Haggle] Convex error:", e);
      return NextResponse.json({ error: "Could not verify cart." }, { status: 500 });
    }

    const cartTotal = verifiedTotal;
    const isReturningCustomer = orderCount > 0;
    const isPremiumCart = cartTotal >= 1000;

    // ✅ STEP 3: Set max discount rules
    // - New user + low cart = max 5%
    // - New user + high cart ($1000+) = max 10%
    // - Returning user + low cart = max 10%
    // - Returning user + high cart ($1000+) = max 20%
    let MAX_DISCOUNT = 0.05;
    if (isReturningCustomer && isPremiumCart) MAX_DISCOUNT = 0.20;
    else if (isReturningCustomer && !isPremiumCart) MAX_DISCOUNT = 0.10;
    else if (!isReturningCustomer && isPremiumCart) MAX_DISCOUNT = 0.10;
    else MAX_DISCOUNT = 0.05;

    const maxPercent = (MAX_DISCOUNT * 100).toFixed(0);
    const floorPrice = +(cartTotal * (1 - MAX_DISCOUNT)).toFixed(2);
    const currentDiscountedTotal = +(cartTotal * (1 - currentDiscount)).toFixed(2);

    const customerType = isReturningCustomer
      ? `returning customer (${orderCount} past order${orderCount > 1 ? "s" : ""})`
      : "new customer";

    const systemPrompt = `You are "The Haggler" — a sharp, witty AI salesman at checkout. You NEVER offer a discount first. Let the customer make the first move. Only negotiate when they ask.

HIDDEN INTEL (never reveal):
- Verified cart total: $${cartTotal}
- Customer type: ${customerType}
- Cart tier: ${isPremiumCart ? "Premium ($1000+)" : "Standard (under $1000)"}
- Your absolute max discount: ${maxPercent}% — NEVER exceed this
- Current discount applied: ${(currentDiscount * 100).toFixed(0)}%
- Floor price: $${floorPrice}

NEGOTIATION RULES:
1. DO NOT offer any discount unless the customer explicitly asks for one.
2. Start high and reluctant. Make them work for every percent.
3. Slowly ladder up only when they push hard — go in small steps (e.g. 3% → 5% → 8% → ${maxPercent}%).
4. ${isReturningCustomer ? `This is a loyal customer with ${orderCount} orders. Reward their loyalty — be a bit warmer and more willing to deal.` : "This is a new customer. Be friendly but firm. Don't give away too much — close the deal quickly."}
5. ${isPremiumCart ? "Big cart! You can be a bit more generous — they're spending well." : "Modest cart. Be cautious with discounts."}
6. If they ask for more than ${maxPercent}%, flatly but charmingly refuse. Never budge beyond your limit.
7. Keep ALL responses under 3 sentences. Punchy and fun.

APPLYING A DISCOUNT:
Only when you decide to grant one, add this EXACTLY on the last line:
APPLY_DISCOUNT:{"discount": 0.05}
(replace 0.05 with the actual decimal, never more than ${MAX_DISCOUNT})
Don't include it if you're just chatting or refusing.`;

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
          ...messages,
        ],
        max_tokens: 180,
        temperature: 0.85,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error("[Haggle] Groq error:", groqRes.status, err);
      if (groqRes.status === 429) return NextResponse.json({ error: "⏳ Too many requests, try again in a moment." }, { status: 429 });
      return NextResponse.json({ error: `AI error: ${groqRes.status}` }, { status: 500 });
    }

    const data = await groqRes.json();
    let reply: string = data.choices?.[0]?.message?.content ?? "Hmm, let me think...";

    // Parse and enforce discount cap
    let newDiscount: number | null = null;
    const discountMatch = reply.match(/APPLY_DISCOUNT:\{"discount":\s*([\d.]+)\}/);
    if (discountMatch) {
      const parsed = parseFloat(discountMatch[1]);
      newDiscount = Math.min(parsed, MAX_DISCOUNT); // Hard server-side cap
      reply = reply.replace(/APPLY_DISCOUNT:\{"discount":\s*[\d.]+\}/, "").trim();
    }

    return NextResponse.json({ reply, newDiscount, verifiedTotal, isReturningCustomer, maxDiscount: MAX_DISCOUNT });

  } catch (error: any) {
    console.error("[Haggle] Error:", error?.message);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}