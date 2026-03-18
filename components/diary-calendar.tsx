"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

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

export function DiaryCalendar({ onSelectDate, selectedDate, refreshKey }: DiaryCalendarProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch("/api/diary");
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
    })
  );

  return (
    <Card className="w-full max-w-md mx-auto bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-center">記録カレンダー</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          className="rounded-md"
          modifiers={{
            hasEntry: (date) => entryDates.has(format(date, "yyyy-MM-dd")),
          }}
          modifiersStyles={{
            hasEntry: {
              fontWeight: "bold",
              textDecoration: "underline",
              textDecorationColor: "hsl(var(--primary))",
              textDecorationThickness: "2px",
              textUnderlineOffset: "4px"
            }
          }}
        />
      </CardContent>
    </Card>
  );
}
