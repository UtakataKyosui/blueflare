import { DiaryEntryDetail } from "@/components/diary-entry-detail";

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const res = await fetch("http://localhost:8787/api/diary", { cache: 'no-store' });
  if (!res.ok) return <div className="p-8">Error loading entry.</div>;
  const data = (await res.json()) as { entries?: any[] };
  const entry = data.entries?.find((e: any) => e.id === id);

  if (!entry) {
    return <div className="p-8 text-center text-muted-foreground">Entry not found.</div>;
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
      <div className="w-full max-w-lg bg-card/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <DiaryEntryDetail entry={entry} />
      </div>
    </div>
  );
}
