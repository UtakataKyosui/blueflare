import { Modal } from "@/components/modal";
import { DiaryEntryDetail } from "@/components/diary-entry-detail";
import { redirect } from "next/navigation";

export default async function EntryModal({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Ideally, fetch only ONE entry by id. Since we only have a GET all API right now,
  // we either fetch all and find, or assume the API will handle it.
  // Using absolute URL isn't safe during build for fetch in app router without localhost prepended.
  // Instead of fetching server side (which needs base url), we will fetch client side or just use generic placeholder 
  // until we have a proper DB lookup here or client wrap it.
  // For simplicity and to reuse the existing GET /api/diary API:
  const res = await fetch("http://localhost:8787/api/diary", { cache: 'no-store' });
  if (!res.ok) return <Modal><div className="p-8">Error loading entry.</div></Modal>;
  const data = (await res.json()) as { entries?: any[] };
  const entry = data.entries?.find((e: any) => e.id === id);

  if (!entry) {
    return (
      <Modal>
        <div className="p-8 text-center text-muted-foreground">Entry not found.</div>
      </Modal>
    );
  }

  return (
    <Modal>
      <div className="py-6 px-4">
        <DiaryEntryDetail entry={entry} />
      </div>
    </Modal>
  );
}
