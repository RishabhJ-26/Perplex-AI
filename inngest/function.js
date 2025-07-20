import supabase from "../services/supabase";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);
export const llmModel = inngest.createFunction(
  { id: "llm-model" },
  { event: "llm-model" },
  async ({ event, step }) => {
    const searchInput = event.data.searchInput;
    const searchResult = event.data.searchResult;
    const recordId = event.data.recordId;

    const aiResp = await step.ai.infer("generate-ai-llm-model-call", {
      model: step.ai.models.gemini({
        model: "gemini-1.5-flash",
        apiKey: process.env.GEMINI_API_KEY,
      }),
      body: {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Summarize and search about this topic based on input sources. Return Markdown text with proper formatting.\n\nUser Input: ${searchInput}\n\nSearch Result:\n${JSON.stringify(
                  searchResult
                )}`,
              },
            ],
          },
        ],
      },
    });

    const responseText =
      aiResp?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    const saveToDb = await step.run("saveToDb", async () => {
      const { data, error } = await supabase
        .from("Chats")
        .update({ aiResp: responseText })
        .eq("id", recordId)
        .select();

      if (error) throw error;
      return data;
    });
  }
);
