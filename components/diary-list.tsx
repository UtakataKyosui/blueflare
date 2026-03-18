"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type DiaryEntry = {
  id: string;
  transcription: string;
  sentiment: string;
  reflection: string;
  createdAt: string;
};

export function DiaryList({ refreshKey }: { refreshKey: number }) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/diary");
        if (response.ok) {
          const data = (await response.json()) as { entries?: DiaryEntry[] };
          setEntries(data.entries || []);
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [refreshKey]);

  if (isLoading) {
    return <div className="mt-8 text-center text-muted-foreground animate-pulse">Loading entries...</div>;
  }

  if (entries.length === 0) {
    return <div className="mt-8 text-center text-muted-foreground">No entries yet. Start recording above!</div>;
  }

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-semibold">Past Entries</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => {
          let sentimentStatus = "Neutral";
          try {
             // Basic parsing since sentiment might be raw output from distilbert
             const parsed = JSON.parse(entry.sentiment);
             // Distilbert output typically [{ label: "POSITIVE", score: 0.99 }]
             if (Array.isArray(parsed) && parsed[0]?.label) {
               sentimentStatus = parsed[0].label === "POSITIVE" ? "Positive ☀️" : "Negative 🌧️";
             }
          } catch(e) {}

          return (
            <div key={entry.id} className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {format(new Date(entry.createdAt), "MMM d, yyyy h:mm a")}
                </span>
                <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full">{sentimentStatus}</span>
              </div>
              <div className="mt-2 mb-4">
                <p className="text-sm italic text-muted-foreground line-clamp-3">"{entry.transcription}"</p>
              </div>
              <div className="mt-auto pt-4 border-t border-border">
                <p className="text-sm font-medium leading-relaxed">{entry.reflection}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
