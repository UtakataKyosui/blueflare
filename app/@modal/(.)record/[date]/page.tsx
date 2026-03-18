import { Modal } from "@/components/modal";
import { VoiceRecorder } from "@/components/voice-recorder";

export default async function RecordModal({ params }: { params: Promise<{ date: string }> }) {
  const resolvedParams = await params;
  const date = resolvedParams.date;

  return (
    <Modal>
      <div className="py-6 px-4">
        <h2 className="text-xl font-bold mb-4 text-center">{date} の記録を追加</h2>
        <VoiceRecorder initialDate={date} />
      </div>
    </Modal>
  );
}
