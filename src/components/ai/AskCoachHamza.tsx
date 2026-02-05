"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/Card";
import { useAI, useAIReady } from "@/lib/ai/hooks";
import { BookQAInput, BookQAOutput } from "@/lib/ai/types";
import { buildBookQAPrompts } from "@/lib/ai/prompts/book-qa";

interface Message {
  id: string;
  role: "user" | "coach";
  question?: string;
  answer?: BookQAOutput;
}

export function AskCoachHamza() {
  const ready = useAIReady();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [currentInput, setCurrentInput] = useState<BookQAInput | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const buildPrompts = useCallback(
    (i: BookQAInput) => buildBookQAPrompts(i),
    []
  );

  const { data, loading, error, generate, reset } = useAI<
    BookQAInput,
    BookQAOutput
  >("book-qa", currentInput, buildPrompts);

  // When we get a response, add it to messages
  useEffect(() => {
    if (data && currentInput) {
      setMessages((prev) => [
        ...prev,
        {
          id: `coach-${Date.now()}`,
          role: "coach",
          answer: data,
        },
      ]);
      setCurrentInput(null);
      reset();
    }
  }, [data, currentInput, reset]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion("");

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", question: q },
    ]);

    setCurrentInput({ question: q });
    // generate will be triggered because currentInput changed
    setTimeout(() => generate(), 50);
  };

  const suggestedQuestions = [
    "How should I train during Ramadan?",
    "What should I eat for Sahoor?",
    "How do I stay hydrated?",
    "Can I still compete while fasting?",
  ];

  if (!ready) {
    return (
      <Card>
        <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
          Add your OpenAI API key in Settings to use Ask Coach Hamza
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 160px)" }}>
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-1 space-y-3 pb-4">
        {messages.length === 0 && (
          <div className="pt-8 text-center">
            <div
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold mb-4"
              style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
            >
              H
            </div>
            <p className="text-lg font-bold mb-1">Ask Coach Hamza</p>
            <p className="text-xs mb-6" style={{ color: "var(--muted)" }}>
              Questions about fasting, training, nutrition, and Ramadan
            </p>
            <div className="space-y-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuestion(q);
                    setTimeout(() => {
                      setMessages((prev) => [
                        ...prev,
                        { id: `user-${Date.now()}`, role: "user", question: q },
                      ]);
                      setCurrentInput({ question: q });
                      setTimeout(() => generate(), 50);
                    }, 0);
                    setQuestion("");
                  }}
                  className="block w-full text-left rounded-xl px-4 py-3 text-sm transition-all active:scale-[0.98]"
                  style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.role === "user" && (
                <div className="flex justify-end">
                  <div
                    className="rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]"
                    style={{ background: "rgba(201, 168, 76, 0.15)" }}
                  >
                    <p className="text-sm">{msg.question}</p>
                  </div>
                </div>
              )}
              {msg.role === "coach" && msg.answer && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl rounded-bl-md px-4 py-3 max-w-[90%]"
                    style={{ background: "var(--surface-1)" }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {msg.answer.answer}
                    </p>
                    {msg.answer.bookReferences.length > 0 && (
                      <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--card-border)" }}>
                        <p className="text-[10px] font-medium mb-1" style={{ color: "var(--accent-gold)" }}>
                          Book References
                        </p>
                        {msg.answer.bookReferences.map((ref, i) => (
                          <p key={i} className="text-[11px]" style={{ color: "var(--muted)" }}>
                            {ref}
                          </p>
                        ))}
                      </div>
                    )}
                    {msg.answer.relatedTopics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.answer.relatedTopics.map((topic) => (
                          <button
                            key={topic}
                            onClick={() => {
                              setQuestion(topic);
                            }}
                            className="rounded-full px-2.5 py-1 text-[10px]"
                            style={{
                              background: "rgba(201, 168, 76, 0.08)",
                              color: "var(--accent-gold)",
                            }}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md px-4 py-3" style={{ background: "var(--surface-1)" }}>
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--accent-gold)", animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--accent-gold)", animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--accent-gold)", animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs text-center py-2" style={{ color: "#e55" }}>
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 pt-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask Coach Hamza..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
          />
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || loading}
            className="rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-[0.96] disabled:opacity-40"
            style={{ background: "var(--accent-gold)", color: "#000" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 9h14M10 3l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
