"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";

type DiaryEntry = {
  id: string;
  transcription: string;
  sentiment: string;
  reflection: string;
  createdAt: string;
};

export function DiaryList({ refreshKey, selectedDate }: { refreshKey: number, selectedDate?: Date }) {
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

  const filteredEntries = selectedDate 
    ? entries.filter(e => format(new Date(e.createdAt), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
    : entries;

  if (entries.length === 0) {
    return <div className="mt-8 text-center text-muted-foreground">No entries yet. Start recording above!</div>;
  }

  if (filteredEntries.length === 0) {
    return <div className="mt-8 text-center text-muted-foreground px-4 py-8 bg-muted/20 border border-white/5 rounded-xl">選択した日付には日記がありません。</div>;
  }

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center gap-3">
        <h3 className="text-2xl font-bold tracking-tight">
          {selectedDate ? `${format(selectedDate, "yyyy/MM/dd")} の記録` : "Past Entries"}
        </h3>
        {selectedDate && (
          <button 
            onClick={() => {/* will be handled by parent clearing it or just visual */}} 
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            (日付で絞り込み中)
          </button>
        )}
        <div className="h-[1px] flex-1 bg-border/50" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {filteredEntries.map((entry) => {
          let sentimentLabel = "Neutral";
          let sentimentColor = "bg-muted text-muted-foreground";
          let sentimentIcon = "💭";
          
          try {
             const parsed = JSON.parse(entry.sentiment);
             if (Array.isArray(parsed) && parsed[0]?.label) {
               if (parsed[0].label === "POSITIVE") {
                 sentimentLabel = "Positive";
                 sentimentColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                 sentimentIcon = "✨";
               } else if (parsed[0].label === "NEGATIVE") {
                 sentimentLabel = "Negative";
                 sentimentColor = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
                 sentimentIcon = "🌧️";
               }
             }
          } catch(e) {}

          return (
            <Link key={entry.id} href={`/entry/${entry.id}`} passHref>
              <div className="group cursor-pointer bg-card/60 backdrop-blur-md text-card-foreground p-6 rounded-3xl border border-white/10 dark:border-white/5 shadow-xl hover:shadow-2xl hover:bg-card/80 transition-all duration-300 flex flex-col relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
                
                <div className="flex items-start justify-between mb-4 gap-4">
                  <span className="text-sm font-medium text-muted-foreground/80">
                    {format(new Date(entry.createdAt), "MMMM d, yyyy")}
                  </span>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border flex items-center gap-1.5 whitespace-nowrap ${sentimentColor}`}>
                    <span>{sentimentIcon}</span>
                    {sentimentLabel}
                  </span>
                </div>
                
                <div className="relative flex-grow">
                  <p className="text-base text-foreground/90 leading-relaxed line-clamp-3">
                    {entry.transcription}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                  <span>{format(new Date(entry.createdAt), "h:mm a")}</span>
                  <span>View Details →</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
