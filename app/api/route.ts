import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return NextResponse.json({
      text: message.content[0]?.text || "",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "AI request failed." },
      { status: 500 }
    );
  }
}