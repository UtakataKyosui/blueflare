"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";

export function VoiceRecorder({ onEntryAdded }: { onEntryAdded: () => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to record your diary entry.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const response = await fetch("/api/diary", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio");
      }

      onEntryAdded();
    } catch (error) {
      console.error("Error submitting entry:", error);
      alert("Failed to process your diary entry. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-card/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 dark:border-white/5 mt-6 relative overflow-hidden transition-all duration-300 hover:shadow-primary/5 w-full max-w-lg">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <h2 className="text-2xl font-semibold mb-3 text-foreground tracking-tight z-10">Record your reflection</h2>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md z-10 leading-relaxed">
        Tap the microphone and start speaking. When you're finished, we'll process your thoughts into a beautiful entry.
      </p>

      <div className="relative flex items-center justify-center z-10 h-32 w-32">
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping duration-1000" />
            <div className="absolute inset-2 rounded-full bg-destructive/30 animate-pulse duration-700" />
          </>
        )}
        
        {!isRecording && !isProcessing ? (
          <Button
            size="lg"
            className="relative rounded-full w-24 h-24 bg-primary hover:bg-primary/90 transition-all duration-300 active:scale-95 shadow-xl hover:shadow-primary/50"
            onClick={startRecording}
          >
            <Mic className="w-10 h-10 text-primary-foreground" />
          </Button>
        ) : isRecording ? (
          <Button
            size="lg"
            variant="destructive"
            className="relative rounded-full w-24 h-24 transition-all duration-300 active:scale-95 shadow-xl shadow-destructive/50"
            onClick={stopRecording}
          >
            <Square className="w-10 h-10" />
          </Button>
        ) : (
          <Button disabled size="lg" className="relative rounded-full w-24 h-24 bg-muted text-muted-foreground border-white/10">
            <Loader2 className="w-10 h-10 animate-spin" />
          </Button>
        )}
      </div>
      
      <div className="h-8 mt-6 z-10">
        {isRecording && <p className="text-sm font-medium text-destructive animate-pulse">Recording your voice...</p>}
        {isProcessing && <p className="text-sm font-medium text-primary animate-pulse flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Processing with Cloudflare AI...</p>}
      </div>
    </div>
  );
}
