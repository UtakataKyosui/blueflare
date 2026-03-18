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
    <div className="flex flex-col items-center justify-center p-8 bg-card rounded-2xl shadow-sm border border-border mt-6">
      <h2 className="text-xl font-semibold mb-4 text-card-foreground">Record your reflection</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
        Speak your mind. We'll transcribe it, analyze your mood, and provide a thoughtful reflection.
      </p>

      <div className="flex items-center space-x-4">
        {!isRecording && !isProcessing ? (
          <Button
            size="lg"
            className="rounded-full w-20 h-20 bg-primary hover:bg-primary/90 transition-transform active:scale-95"
            onClick={startRecording}
          >
            <Mic className="w-8 h-8 text-primary-foreground" />
          </Button>
        ) : isRecording ? (
          <Button
            size="lg"
            variant="destructive"
            className="rounded-full w-20 h-20 animate-pulse"
            onClick={stopRecording}
          >
            <Square className="w-8 h-8" />
          </Button>
        ) : (
          <Button disabled size="lg" className="rounded-full w-20 h-20">
            <Loader2 className="w-8 h-8 animate-spin" />
          </Button>
        )}
      </div>
      
      {isRecording && <p className="mt-4 text-sm font-medium text-destructive animate-pulse">Recording...</p>}
      {isProcessing && <p className="mt-4 text-sm font-medium text-muted-foreground">Processing with Cloudflare AI...</p>}
    </div>
  );
}
