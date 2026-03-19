import { getDb } from "@/db/drizzle";
import { diaryEntries } from "@/db/schema";
import { getAuth } from "@/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    const result = await db
      .delete(diaryEntries)
      .where(and(eq(diaryEntries.id, id), eq(diaryEntries.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting diary entry:", error);
    return NextResponse.json({ error: "Failed to delete diary entry" }, { status: 500 });
  }
}
