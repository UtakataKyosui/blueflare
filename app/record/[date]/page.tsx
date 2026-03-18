import { VoiceRecorder } from "@/components/voice-recorder";

export default async function RecordPage({ params }: { params: Promise<{ date: string }> }) {
  const resolvedParams = await params;
  const date = resolvedParams.date;
  
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">{date} の記録を追加</h1>
        <VoiceRecorder initialDate={date} />
      </div>
    </div>
  );
}
