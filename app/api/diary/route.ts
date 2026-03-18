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
    const text = formData.get("text") as string;
    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "No transcription text provided" }, { status: 400 });
    }

    const { env } = getCloudflareContext();

    console.log("Transcription received from client:", text);

    // 2. Sentiment Analysis
    console.log("Starting sentiment analysis...");
    const sentimentResult = await env.AI.run("@cf/huggingface/distilbert-sst-2-int8" as any, {
      text,
    });
    const sentiment = JSON.stringify(sentimentResult);
    console.log("Sentiment successful:", sentiment);

    // 3. Reflection
    console.log("Starting reflection generation...");
    const messages = [
      { role: "system", content: "You are a thoughtful and empathetic diary companion. Listen to the user's daily reflection and respond with a short, encouraging summary or insight in Japanese." },
      { role: "user", content: text }
    ];
    const reflectionResult = (await env.AI.run("@cf/meta/llama-3.1-8b-instruct" as any, {
      messages,
    })) as { response: string };
    
    if (!reflectionResult || !reflectionResult.response) {
      console.error("Reflection failed:", reflectionResult);
      throw new Error("Reflection failed");
    }
    const reflection = reflectionResult.response;
    console.log("Reflection successful:", reflection);

    // 4. Save to DB
    console.log("Saving to database...");
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
    console.log("Save successful");

    return NextResponse.json({ id, text, sentiment, reflection });
  } catch (error) {
    console.error("Error processing diary entry:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return NextResponse.json({ error: "Failed to process diary entry", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
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
