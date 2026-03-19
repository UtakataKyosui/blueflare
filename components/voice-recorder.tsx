"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// Web Speech API interfaces
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

export function VoiceRecorder({ initialDate }: { initialDate: string }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [llmProgress, setLlmProgress] = useState("");
  
  // Record date is controlled by the outer modal

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const reflectionWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      workerRef.current = new Worker(new URL("../lib/sentiment-worker.ts", import.meta.url), {
        type: 'module',
      });
      reflectionWorkerRef.current = new Worker(new URL("../lib/reflection-worker.ts", import.meta.url), {
        type: 'module',
      });
    }

    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "ja-JP"; // Default to Japanese, can be configured later

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Web Speech API is not supported in this browser.");
    }

    return () => {
      workerRef.current?.terminate();
      reflectionWorkerRef.current?.terminate();
    };
  }, []);

  const analyzeSentiment = (text: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!workerRef.current) return resolve([{ label: "UNKNOWN", score: 0 }]);
      
      workerRef.current.onmessage = (e) => {
        if (e.data.status === 'success') {
          resolve(e.data.result);
        } else if (e.data.status === 'error') {
          console.error("Sentiment analysis error:", e.data.error);
          resolve([{ label: "UNKNOWN", score: 0 }]);
        }
      };
      workerRef.current.postMessage({ text });
    });
  };

  const analyzeReflection = (text: string): Promise<string> => {
    return new Promise((resolve) => {
      if (!reflectionWorkerRef.current) return resolve("AIからの振り返りを生成できませんでした。");

      reflectionWorkerRef.current.onmessage = (e) => {
        const data = e.data;
        if (data.status === 'success') {
          resolve(data.result);
        } else if (data.status === 'error') {
          console.error("Reflection analysis error:", data.error);
          resolve("エラーが発生したため振り返りを生成できませんでした。");
        } else if (data.status === 'loading') {
          setLlmProgress(data.message);
        } else if (data.status === 'progress') {
          if (data.data.status === "downloading") {
            setLlmProgress(`${data.data.file} をダウンロード中... ${Math.round(data.data.progress || 0)}%`);
          } else if (data.data.status === "done") {
            setLlmProgress(`${data.data.file} ダウンロード完了`);
          }
        } else if (data.status === 'generating') {
          setLlmProgress("ユーザーの日記に基づいて振り返りを生成しています...");
        }
      };
      reflectionWorkerRef.current.postMessage({ text });
    });
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      alert("お使いのブラウザは音声認識に対応していません。（Chrome や Safari などの最新ブラウザをお試しください）");
      return;
    }
    try {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
      setIsEditing(false);
      // 録音中にバックグラウンドでAIモデルをプリロードしておく
      workerRef.current?.postMessage({ type: 'warmup' });
      reflectionWorkerRef.current?.postMessage({ type: 'warmup' });
    } catch (err) {
      console.error("Error starting speech recognition:", err);
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsEditing(true);
    }
  };

  const processTranscription = async (text: string) => {
    if (!text || text.trim() === "") {
      alert("音声をうまく聞き取れませんでした。もう一度お試しください！");
      setIsProcessing(false);
      return;
    }
    try {
      setLlmProgress("感情分析を実行中...");
      const sentimentResult = await analyzeSentiment(text);
      
      setLlmProgress("振り返りの生成を開始します...");
      const reflectionResult = await analyzeReflection(text);

      const formData = new FormData();
      formData.append("transcription", text);
      formData.append("sentiment", JSON.stringify(sentimentResult));
      formData.append("reflection", reflectionResult);
      formData.append("date", initialDate);

      const response = await fetch("/api/diary", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process text");
      }

      setTranscript("");
      setLlmProgress("");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("diary-updated"));
      }
      setTimeout(() => {
        router.back();
      }, 100);
    } catch (error) {
      console.error("Error submitting entry:", error);
      alert("Failed to process your diary entry. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPending) {
    return <div className="w-full max-w-md h-32 bg-muted/50 animate-pulse rounded-full mx-auto" />;
  }
  if (!session) {
    return null; // 非ログイン時はUIを出さない
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto relative">
      <div className="flex flex-col items-center justify-center p-10 bg-card/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 dark:border-white/5 relative overflow-hidden transition-all duration-300 hover:shadow-primary/5 w-full max-w-lg">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <h2 className="text-2xl font-semibold mb-3 text-foreground tracking-tight z-10">Record your reflection</h2>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md z-10 leading-relaxed">
        Tap the microphone and start speaking. When you're finished, we'll process your thoughts into a beautiful entry.
      </p>

      <div className="w-full mb-8 z-10 relative">
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <textarea
              className="w-full min-h-[120px] bg-black/5 dark:bg-white/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="認識されたテキストをここで手直しできます..."
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setIsEditing(false); setTranscript(""); }}>キャンセル</Button>
              <Button onClick={() => { setIsEditing(false); setIsProcessing(true); processTranscription(transcript); }}>保存して分析する</Button>
            </div>
          </div>
        ) : (
          <div className="w-full min-h-[60px] bg-black/5 dark:bg-white/5 rounded-xl p-4 flex items-center justify-center text-center">
            <p className="text-sm text-foreground/80 break-words w-full">
              {transcript || (isRecording ? "Listening..." : "Your words will appear here")}
            </p>
          </div>
        )}
      </div>

      <div className="relative flex items-center justify-center z-10 h-32 w-32">
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping duration-1000" />
            <div className="absolute inset-2 rounded-full bg-destructive/30 animate-pulse duration-700" />
          </>
        )}
        
        {!isRecording && !isProcessing && !isEditing ? (
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
        ) : isProcessing ? (
          <Button disabled size="lg" className="relative rounded-full w-24 h-24 bg-muted text-muted-foreground border-white/10">
            <Loader2 className="w-10 h-10 animate-spin" />
          </Button>
        ) : null}
      </div>
      
      <div className="min-h-8 mt-6 z-10 flex flex-col items-center justify-center text-center">
        {isRecording && <p className="text-sm font-medium text-destructive animate-pulse">Recording your voice...</p>}
        {isProcessing && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-primary animate-pulse flex items-center gap-2 mt-2">
              <Loader2 className="w-4 h-4 animate-spin"/> Processing with Local AI...
            </p>
            {llmProgress && <p className="text-xs text-muted-foreground w-full max-w-sm mt-1">{llmProgress}</p>}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
