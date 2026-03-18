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
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Voice Diary</h1>
        <p className="text-muted-foreground">Record your thoughts and let our AI provide reflections.</p>
      </div>
      
      <VoiceRecorder onEntryAdded={handleEntryAdded} />
      
      <DiaryList refreshKey={refreshKey} />
    </div>
  );
}
