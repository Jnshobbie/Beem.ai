import {
  GoogleGenerativeAI,
  type GenerationConfig,
  type Content,
  type Part,
} from "@google/generative-ai";
import mime from "mime";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_NAME = "gemini-2.0-flash";

const CodeGenerationConfig: GenerationConfig = {
  temperature: 0.7,
  topP: 1,
  topK: 0,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

function imagePart(base64: string, mimeType = "image/png"): Part {
  return {
    inlineData: {
      mimeType,
      data: base64,
    },
  };
}

export async function chatSessionSend({
  prompt,
  history = [],
  imageBase64 = null,
}: {
  prompt: string;
  history?: Content[];
  imageBase64?: string | null;
}): Promise<{
  text: string;
  files: Record<string, string>;
  images: Array<{ mimeType: string; data: string; filename: string }>;
  updatedHistory: Content[];
}> {
  const model = ai.getGenerativeModel({ model: MODEL_NAME });

  const userParts: Part[] = [{ text: prompt }];
  if (imageBase64) userParts.push(imagePart(imageBase64));

  const userMessage: Content = {
    role: "user",
    parts: userParts,
  };

  const result = await model.generateContent({
    contents: [...history, userMessage],
    generationConfig: CodeGenerationConfig,
  });

  const response = result.response;
  const rawText = await response.text();

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    console.error("Invalid JSON from Gemini:", rawText);
    throw new Error("Gemini returned invalid JSON format.");
  }

  const files = parsed.files ?? {};
  const text = parsed.text ?? rawText;
  const images: any[] = [];

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.mimeType && part.inlineData?.data) {
      const ext = mime.getExtension(part.inlineData.mimeType) || "png";
      images.push({
        mimeType: part.inlineData.mimeType,
        data: part.inlineData.data,
        filename: `image-${Date.now()}.${ext}`,
      });
    }
  }

  const modelMessage: Content = {
    role: "model",
    parts,
  };

  const updatedHistory = [...history, userMessage, modelMessage];

  return {
    text,
    files,
    images,
    updatedHistory,
  };
}
