"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

type RecorderState = "idle" | "recording" | "transcribing" | "done";

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [transcript, setTranscript] = useState("");
  const [useFallback, setUseFallback] = useState(false);

  // Web Speech API refs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // MediaRecorder refs for fallback
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Check for Web Speech API support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasSpeechAPI =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in (window as any));

  const startWebSpeech = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = () => {
      // Fall back to MediaRecorder
      setUseFallback(true);
      setState("idle");
    };

    recognition.onend = () => {
      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim());
        setState("done");
      } else {
        setState("idle");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState("recording");
  }, [onTranscript]);

  const startMediaRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setState("transcribing");

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", blob, "recording.webm");

        try {
          const res = await fetch("/api/ai/whisper", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Transcription failed");
          const data = (await res.json()) as { text: string };
          setTranscript(data.text);
          onTranscript(data.text);
          setState("done");
        } catch {
          setState("idle");
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch {
      setState("idle");
    }
  }, [onTranscript]);

  const start = useCallback(() => {
    if (!useFallback && hasSpeechAPI) {
      startWebSpeech();
    } else {
      startMediaRecorder();
    }
  }, [useFallback, hasSpeechAPI, startWebSpeech, startMediaRecorder]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return { state, transcript, start, stop, setTranscript };
}

