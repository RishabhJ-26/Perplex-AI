import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Test API is working" });
}

export async function POST(req) {
  try {
    const body = await req.json();
    return NextResponse.json({ 
      message: "Test POST is working", 
      received: body 
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      { error: "Test API error", details: error.message },
      { status: 500 }
    );
  }
} 