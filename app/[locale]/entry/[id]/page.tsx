import { setRequestLocale, getTranslations } from "next-intl/server";
import { DiaryEntryDetail } from "@/components/diary-entry-detail";
import { getDb } from "@/db/drizzle";
import { diaryEntries } from "@/db/schema";
import { getAuth } from "@/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export default async function EntryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("entry");

  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return <div className="p-8">{t("unauthorized")}</div>;
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
      <div className="p-8 text-center text-muted-foreground">
        {t("notFound")}
      </div>
    );
  }

  const entryForDisplay = {
    ...entry,
    createdAt: entry.createdAt.toISOString(),
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
      <div className="w-full max-w-lg bg-card/40 backdrop-blur-xl border border-black/10 dark:border-white/10 p-8 rounded-3xl shadow-2xl">
        <DiaryEntryDetail entry={entryForDisplay} />
      </div>
    </div>
  );
}
