import { chatSessionSend } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt, history, imageBase64 } = await req.json();
    const result = await chatSessionSend({ prompt, history, imageBase64 });

    return NextResponse.json({ files: result.files });
  } catch (error) {
    console.error("Error in gen-ai-code:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
