"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";

type DiaryEntry = {
  id: string;
  transcription: string;
  sentiment: string;
  reflection: string;
  createdAt: string;
};

interface DiaryCalendarProps {
  onSelectDate: (date: Date | undefined) => void;
  selectedDate: Date | undefined;
  refreshKey: number;
}

export function DiaryCalendar({
  onSelectDate,
  selectedDate,
  refreshKey,
}: DiaryCalendarProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const t = useTranslations("diary");
  const locale = useLocale();
  const dateFnsLocale = locale === "ja" ? ja : enUS;

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch("/api/diary", { cache: "no-store" });
        if (response.ok) {
          const data = (await response.json()) as { entries?: DiaryEntry[] };
          setEntries(data.entries || []);
        }
      } catch (error) {
        console.error("Error fetching entries for calendar:", error);
      }
    };
    fetchEntries();
  }, [refreshKey]);

  // 記録がある日付のセットを作成 (YYYY-MM-DD 形式)
  const entryDates = new Set(
    entries.map((entry) => {
      const date = new Date(entry.createdAt);
      return format(date, "yyyy-MM-dd");
    }),
  );

  return (
    <Card className="w-full bg-card/40 backdrop-blur-xl border-black/10 dark:border-white/10 shadow-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-center">
          {t("calendar")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          className="rounded-md"
          locale={dateFnsLocale}
          modifiers={{
            hasEntry: (date) => entryDates.has(format(date, "yyyy-MM-dd")),
          }}
          modifiersClassNames={{
            hasEntry:
              "bg-blue-500 text-white font-bold hover:bg-blue-600 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 rounded-md",
          }}
        />
      </CardContent>
    </Card>
  );
}
