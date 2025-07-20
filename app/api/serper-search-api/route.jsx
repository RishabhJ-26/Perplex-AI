import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    
    const { searchInput, searchType } = body;

    if (!searchInput) {
      return NextResponse.json(
        { error: "Search input is required" },
        { status: 400 }
      );
    }
    

    const data = JSON.stringify({
      "q": searchInput,
      "num": 10,
      "type": searchType?.toLowerCase() || "search"
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://google.serper.dev/search',
      headers: { 
        'X-API-KEY': process.env.SERPER_API_KEY, 
        'Content-Type': 'application/json'
      },
      data: data
    };

    const response = await axios.request(config);
    
    return NextResponse.json(response.data);

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 }
    );
  }
}
