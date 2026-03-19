"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DiaryList } from "./diary-list";
import { DiaryCalendar } from "./diary-calendar";
import { useSession } from "@/lib/auth-client";
import { format } from "date-fns";
import { Mic } from "lucide-react";
import { Button } from "./ui/button";

export function DiaryDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { data: session } = useSession();

  useEffect(() => {
    const handleUpdate = () => setRefreshKey((prev) => prev + 1);
    // モーダル側での保存完了を監視してダッシュボードを更新
    window.addEventListener("diary-updated", handleUpdate);
    return () => window.removeEventListener("diary-updated", handleUpdate);
  }, []);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 relative">
      <div className="text-center space-y-6 pt-10 pb-4">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
          AI Voice Diary
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Speak your mind freely. Let our AI transcribe, analyze your mood, and provide thoughtful reflections.
        </p>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none -z-10" />

      {session && (
        <div className="relative z-10 w-full flex flex-col items-center mt-8 px-4">
          <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[60%] transition-all duration-300">
            <DiaryCalendar refreshKey={refreshKey} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>

          {selectedDate && (
            <div className="mt-6">
              <Link href={`/record/${format(selectedDate, "yyyy-MM-dd")}`}>
                <Button className="rounded-full shadow-lg gap-2 text-primary-foreground">
                  <Mic className="w-4 h-4" />
                  {format(selectedDate, "M/d")} に記録する
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="relative z-10 mt-16 pb-20">
        {session && (
          <DiaryList refreshKey={refreshKey} selectedDate={selectedDate} />
        )}
      </div>
    </div>
  );
}
