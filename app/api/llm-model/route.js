import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Set this in your environment

// Add a helper function for retry logic
async function callGeminiWithRetry(model, prompt, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      // Check for 503 error or overloaded message
      const isOverloaded = error?.message?.includes("503") || error?.message?.toLowerCase().includes("overloaded");
      if (isOverloaded && i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Gemini API is overloaded. Please try again later.");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { searchInput, searchResult, recordId } = body;

    if (!searchInput || !recordId) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // Prepare the prompt for Gemini
    const organicResults = (searchResult || []).filter(item =>
      item.type === 'organic' || item.type === 'knowledgeGraph'
    ).slice(0, 6);

    const prompt = `You are an expert news and information summarizer. Based on the following search results for "${searchInput}", write a comprehensive, detailed summary (at least 4-5 paragraphs, or 300+ words) that covers all important and trending information.

Start your response with a section titled '**SUMMARY**' (in bold using Markdown), and in that section, provide a clear, concise summary paragraph that gives the most important facts and context about the topic, before any background or details.

After the SUMMARY section, add a section titled '**Detailed Summary**' (in bold using Markdown) and provide a detailed summary of the topic.

Then, add a section titled '**Key Points:**' (in bold using Markdown) and provide a list of 5-7 key points (as bullet points or a numbered list) with the most important facts, scores, or news.

Do NOT just list the website or channel names. Focus on:
- The latest scores, breaking news, or trending facts that appear at the top of the results.
- Any key details, numbers, or updates that a user would want to know first.
- If there is a live event, mention the current status or score.
- Only mention the source if it adds credibility or context (e.g., "according to ESPN...").
- Make the summary clear, user-friendly, and avoid generic statements or about sections.

Here are the search results:

${organicResults.map((result, index) =>
  `${index + 1}. ${result.title}\n${result.description}\nSource: ${result.long_name}`
).join('\n\n')}

**SUMMARY**
**Detailed Summary**
**Key Points:**`;

    // Call Gemini API with the correct model name
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });
    const aiSummary = await callGeminiWithRetry(model, prompt);

    // Store the AI response in the database
    const { data: updateData, error: updateError } = await supabase
      .from("Chats")
      .update({
        aiResp: aiSummary
      })
      .eq("id", recordId)
      .select();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to store AI response", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json("ai-completed");

  } catch (error) {
    // Clean error handling for production (no console logs)
    return NextResponse.json(
      { error: "Internal server error", details: error.message, full: error },
      { status: 500 }
    );
  }
}
