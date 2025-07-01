import { NextResponse } from "next/server";
import { chatSessionSend } from "@/configs/AiModel";

export async function POST(request) {
  try {
    const { prompt, history, imageBase64 } = await request.json();

    const result = await chatSessionSend({ prompt, history, imageBase64 });

    return NextResponse.json({
      result: {
        text: result.text || "[Empty response]",
        files: result.files,
        images: result.images,
      },
    });
  } catch (error) {
    console.error("Error in /api/ai-chat:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
