
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { word, sentence, contextStr } = await req.json();

    if (!word || !sentence) {
      return NextResponse.json(
        { error: "Word and sentence are required" },
        { status: 400 }
      );
    }

    // Default to English explanation if not specified, 
    // but the prompt logic handles providing both Target + Native (English default for now)
    // We could pass user's native language if available in profile.

    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_TRANSLATION_MODEL || "gemini-2.0-flash-exp" });

    const prompt = `
      You are an expert language tutor.
      
      Task: Translate and explain the word "${word}" in the context of the sentence: "${sentence}".
      
      Provide the output in JSON format with the following keys:
      - "translation": The direct translation of the word in English.
      - "explanation_en": A clear explanation of the word's usage in this specific context, written in English.
      - "explanation_target": A clear explanation of the word's usage in this specific context, written in the SAME language as the sentence itself (for immersion).
      
      Keep explanations concise but helpful for a learner.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean markdown code blocks if present
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "");

    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to generate translation" },
      { status: 500 }
    );
  }
}
