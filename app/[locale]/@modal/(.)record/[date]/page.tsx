import { Modal } from "@/components/modal";
import { VoiceRecorder } from "@/components/voice-recorder";

export default async function RecordModal({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const resolvedParams = await params;
  const date = resolvedParams.date;

  return (
    <Modal>
      <div className="py-6 px-4">
        <VoiceRecorder initialDate={date} />
      </div>
    </Modal>
  );
}
