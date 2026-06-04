import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mediaType, productCatalog } = body;

    if (!imageBase64) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 });

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mediaType};base64,${imageBase64}` },
              },
              {
                type: "text",
                text: `You are a precise visual product matcher. Your job is to find products that DIRECTLY match what is shown in this image — not loosely related items.

STRICT MATCHING RULES:
1. If the image shows a SPECIFIC product (e.g. headphones), ONLY match that exact product type first, then closely related accessories.
2. Do NOT match unrelated products just because they share a category. If the image shows headphones, do NOT include keyboards, monitors, or TVs.
3. Match by: exact product type > same use case > complementary accessories > similar aesthetic only.
4. If you can identify the exact product in the image, that product must be first in matchedProductIds.
5. Only expand to aesthetic/vibe matches if the image is abstract (a mood board, room, painting, outfit flat lay).

PRODUCT CATALOG:
${JSON.stringify(productCatalog)}

Respond ONLY with raw JSON — no markdown, no backticks, no extra text. Use exactly this structure:
{"vibeName":"2-4 word name describing what you see","vibeDescription":"one sentence describing the image content and mood","colors":["#hex1","#hex2","#hex3"],"keywords":["word1","word2","word3"],"matchedProductIds":[1,5,12],"matchReasons":{"1":"exact reason tied to the image","5":"exact reason"}}

Pick 4 to 10 products. Only use id values from the catalog. Be precise — quality over quantity.`,
              },
            ],
          },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      if (groqRes.status === 429) return NextResponse.json({ error: "Too many requests — try again shortly." }, { status: 429 });
      return NextResponse.json({ error: `Groq error ${groqRes.status}: ${errText.slice(0, 200)}` }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const rawText: string = groqData.choices?.[0]?.message?.content ?? "";

    let vibeData: any;
    try {
      vibeData = JSON.parse(rawText.trim());
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return NextResponse.json({ error: "AI returned invalid format. Try again." }, { status: 500 });
      vibeData = JSON.parse(jsonMatch[0]);
    }

    return NextResponse.json(vibeData);

  } catch (error: any) {
    console.error("[VibeSearch]", error?.message);
    return NextResponse.json({ error: error?.message ?? "Something went wrong" }, { status: 500 });
  }
}