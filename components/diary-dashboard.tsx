"use client";

import { useState } from "react";
import { VoiceRecorder } from "./voice-recorder";
import { DiaryList } from "./diary-list";

export function DiaryDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEntryAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-6 pt-10 pb-4">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
          AI Voice Diary
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Speak your mind freely. Let our AI transcribe, analyze your mood, and provide thoughtful reflections.
        </p>
      </div>
      
      <div className="relative z-10 w-full flex justify-center">
        <VoiceRecorder onEntryAdded={handleEntryAdded} />
      </div>
      
      <div className="relative z-10 mt-16 pb-20">
        <DiaryList refreshKey={refreshKey} />
      </div>
    </div>
  );
}
