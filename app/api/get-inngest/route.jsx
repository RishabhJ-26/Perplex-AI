import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { runId } = await request.json();
    
    // For now, return a mock completed response
    // This simulates the AI task being completed
    const mockResponse = {
      data: [
        {
          id: runId,
          status: "Completed",
          output: {
            answer: "This is a mock AI response for testing purposes. The search was successful and here's what I found about your query.",
            sources: [
              {
                title: "Mock Source 1",
                url: "https://example.com/source1",
                description: "This is a mock source for testing"
              },
              {
                title: "Mock Source 2", 
                url: "https://example.com/source2",
                description: "Another mock source for testing"
              }
            ]
          }
        }
      ]
    };
    
    return NextResponse.json(mockResponse);
    
  } catch (error) {
    console.error("Get Inngest API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}