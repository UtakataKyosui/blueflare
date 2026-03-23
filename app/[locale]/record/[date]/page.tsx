import { setRequestLocale } from "next-intl/server";
import { VoiceRecorder } from "@/components/voice-recorder";

export default async function RecordPage({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}) {
  const { locale, date } = await params;
  setRequestLocale(locale);

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
      <div className="w-full max-w-lg">
        <VoiceRecorder initialDate={date} />
      </div>
    </div>
  );
}
