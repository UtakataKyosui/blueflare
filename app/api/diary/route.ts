import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db/drizzle";
import { diaryEntries } from "@/db/schema";
import { getAuth } from "@/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    if (!audioFile) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    const { env } = getCloudflareContext();

    // 1. Transcription
    const audioBuffer = await audioFile.arrayBuffer();
    const transcriptionResult = (await env.AI.run("@cf/openai/whisper-large-v3-turbo" as any, {
      audio: [...new Uint8Array(audioBuffer)] as any,
    })) as { text: string };
    
    const text = transcriptionResult.text;

    // 2. Sentiment Analysis
    const sentimentResult = await env.AI.run("@cf/huggingface/distilbert-sst-2-int8" as any, {
      text,
    });
    const sentiment = JSON.stringify(sentimentResult);

    // 3. Reflection
    const messages = [
      { role: "system", content: "You are a thoughtful and empathetic diary companion. Listen to the user's daily reflection and respond with a short, encouraging summary or insight in Japanese." },
      { role: "user", content: text }
    ];
    const reflectionResult = (await env.AI.run("@cf/meta/llama-3.1-8b-instruct" as any, {
      messages,
    })) as { response: string };
    
    const reflection = reflectionResult.response;

    // 4. Save to DB
    const id = crypto.randomUUID();
    const db = getDb();
    await db.insert(diaryEntries).values({
      id,
      userId: session.user.id,
      transcription: text,
      sentiment,
      reflection,
      createdAt: new Date(),
    });

    return NextResponse.json({ id, text, sentiment, reflection });
  } catch (error) {
    console.error("Error processing diary entry:", error);
    return NextResponse.json({ error: "Failed to process diary entry" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const entries = await db.select().from(diaryEntries).where(eq(diaryEntries.userId, session.user.id)).orderBy(desc(diaryEntries.createdAt));

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching diary entries:", error);
    return NextResponse.json({ error: "Failed to fetch diary entries" }, { status: 500 });
  }
}
