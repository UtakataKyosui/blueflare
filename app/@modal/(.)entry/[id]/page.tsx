import { Modal } from "@/components/modal";
import { DiaryEntryDetail } from "@/components/diary-entry-detail";
import { getDb } from "@/db/drizzle";
import { diaryEntries } from "@/db/schema";
import { getAuth } from "@/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export default async function EntryModal({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return <Modal><div className="p-8">Unauthorized.</div></Modal>;
  }

  const db = getDb();
  const results = await db
    .select()
    .from(diaryEntries)
    .where(and(eq(diaryEntries.id, id), eq(diaryEntries.userId, session.user.id)))
    .limit(1);

  const entry = results[0];

  if (!entry) {
    return (
      <Modal>
        <div className="p-8 text-center text-muted-foreground">Entry not found.</div>
      </Modal>
    );
  }

  const entryForDisplay = {
    ...entry,
    createdAt: entry.createdAt.toISOString(),
  };

  return (
    <Modal>
      <div className="py-6 px-4">
        <DiaryEntryDetail entry={entryForDisplay} />
      </div>
    </Modal>
  );
}
