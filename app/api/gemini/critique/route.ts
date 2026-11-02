import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { title, category, author, style, location, currentText, action } =
      await req.json();

    const ai = getGeminiClient();
    if (!ai) {
      // Graceful fallback if API key is not yet set in environment
      return NextResponse.json({
        success: true,
        source: "fallback",
        critique: `[Curatorial Peer Review for "${title}"]\n\nThis manuscript effectively interrogates the phenomenological intersection of ${style || "contemporary architectural practice"} and ${location || "regional climate"}. The spatial analysis displays rigorous fidelity to material honesty, evoking Juhani Pallasmaa's tactile theories and Kenneth Frampton's critical regionalism.\n\nRecommendation: Approved for Vol. 48 Proof Staging.`,
        pullQuote: `Architecture in ${location || "the contemporary city"} does not merely shelter; it actively recalibrates our sensory perception of material silence.`,
        synopsis: `An incisive architectural investigation into ${title}, evaluating tectonic honesty and sustainable spatial materiality.`,
      });
    }

    let prompt = "";
    if (action === "generate-synopsis") {
      prompt = `You are the Senior Curatorial Peer Reviewer at "FORM & FIELD", a prestigious international architectural journal published between Zurich and Milan.
Draft an authoritative, poetic, and intellectually rigorous curatorial synopsis (2-3 sentences) and a resonant pull-quote for an architectural monograph.
Title: "${title}"
Category: "${category}"
Author: "${author}"
Architectural Style: "${style}"
Location: "${location}"
${currentText ? `Manuscript notes: "${currentText}"` : ""}

Respond in clean JSON format:
{
  "synopsis": "...",
  "pullQuote": "..."
}`;
    } else {
      prompt = `You are Dr. Helena Vance, Editor-in-Chief of "FORM & FIELD", an international spatial design and architecture journal (Zurich / Milan).
Conduct a formal, rigorous curatorial peer review of the following monograph manuscript:
Title: "${title}"
Category: "${category}"
Author: "${author}"
Style: "${style}"
Location: "${location}"
Current draft text: "${currentText || title}"

Provide an intellectual appraisal focusing on:
1. Spatial phenomenology & tectonic honesty (referencing architectural theory like Pallasmaa, Frampton, Zumthor, or Scarpa).
2. Tectonic clarity and material ethics.
3. A compelling pull-quote for the broadsheet layout.
4. Curatorial recommendation (e.g., "Approved for 300 DPI Proof Staging" or "Revision Recommended").

Respond in clean JSON format:
{
  "critique": "...",
  "pullQuote": "...",
  "recommendation": "Approved for 300 DPI Proof Staging"
}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const rawText = response.text || "{}";
    let parsedData = {};
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = {
        critique: rawText,
        pullQuote: `Materiality in ${location || "contemporary architecture"} serves as an anchor against transient acceleration.`,
      };
    }

    return NextResponse.json({
      success: true,
      source: "gemini",
      ...parsedData,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Unknown error during API generation";
    console.error("Error generating curatorial critique:", err);
    return NextResponse.json(
      {
        success: false,
        error: message,
        critique:
          "Curatorial review generated via offline Zurich desk protocol.",
        pullQuote:
          "The quiet discipline of architectural space remains resilient across generational shifts.",
      },
      { status: 500 },
    );
  }
}
