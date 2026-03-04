export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt provided." },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key missing in environment." },
        { status: 500 }
      );
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      model: "claude-3-haiku-latest",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text =
      (response.content &&
        response.content[0] &&
        "text" in response.content[0] &&
        response.content[0].text) ||
      "";

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "AI request failed." },
      { status: 500 }
    );
  }
}