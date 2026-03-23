import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import { DeleteEntryButton } from "@/components/delete-entry-button";
import { getTranslations, getLocale } from "next-intl/server";

type DiaryEntry = {
  id: string;
  transcription: string;
  sentiment: string;
  reflection: string;
  createdAt: string;
};

export async function DiaryEntryDetail({ entry }: { entry: DiaryEntry }) {
  const t = await getTranslations("diary");
  const locale = await getLocale();
  const dateFnsLocale = locale === "ja" ? ja : enUS;

  let sentimentLabel = t("neutral");
  let sentimentColor = "text-muted-foreground";
  let sentimentIcon = "💭";

  try {
    const parsed = JSON.parse(entry.sentiment);
    if (Array.isArray(parsed) && parsed[0]?.label) {
      if (parsed[0].label === "POSITIVE") {
        sentimentLabel = t("positive");
        sentimentColor = "text-emerald-500 dark:text-emerald-400";
        sentimentIcon = "✨";
      } else if (parsed[0].label === "NEGATIVE") {
        sentimentLabel = t("negative");
        sentimentColor = "text-rose-500 dark:text-rose-400";
        sentimentIcon = "🌧️";
      }
    }
  } catch (e) {}

  return (
    <div className="flex flex-col gap-6 w-full text-foreground/90 py-2">
      <div className="flex flex-col items-center gap-2 mb-4 border-b border-black/10 dark:border-white/10 pb-6">
        <div className="flex w-full justify-end">
          <DeleteEntryButton entryId={entry.id} />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {format(new Date(entry.createdAt), "PPP • p", { locale: dateFnsLocale })}
        </span>
        <div
          className={`text-sm font-semibold flex items-center gap-1.5 ${sentimentColor}`}
        >
          <span className="text-lg">{sentimentIcon}</span>
          {sentimentLabel}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("transcription")}
        </h4>
        <p className="text-base italic leading-relaxed pl-4 border-l-2 border-primary/30">
          &ldquo;{entry.transcription}&rdquo;
        </p>
      </div>

      <div className="space-y-4 mt-4 bg-muted/30 p-5 rounded-xl border border-black/10 dark:border-white/5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
          {t("aiReflection")}
        </h4>
        <p className="text-sm font-medium leading-relaxed">{entry.reflection}</p>
      </div>
    </div>
  );
}
