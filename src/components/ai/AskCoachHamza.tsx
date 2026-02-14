"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/Card";
import { useAIReady, useAIStream } from "@/lib/ai/hooks";
import { BookQAOutput } from "@/lib/ai/types";
import { buildBookQAPrompts } from "@/lib/ai/prompts/book-qa";
import { useStore } from "@/store/useStore";
import { analyzeConversation, buildUserContext, updateMemoryFromConversation } from "@/lib/ai/memory";

const BOOK_PDF_URL = "https://drive.google.com/file/d/14dZVQGAeIvKDSNWyuHHARwkusKmgVue4/view";

interface Message {
  id: string;
  role: "user" | "coach";
  question?: string;
  answer?: BookQAOutput;
  streamText?: string;
}

interface AskCoachHamzaProps {
  initialQuestion?: string;
}

export function AskCoachHamza({ initialQuestion }: AskCoachHamzaProps = {}) {
  const ready = useAIReady();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamIdRef = useRef<string | null>(null);
  const lastUserQuestionRef = useRef<string>("");

  const { text: streamText, loading, error, generate: streamGenerate, reset: streamReset } = useAIStream();
  const initialTriggered = useRef(false);

  // Get user profile and memory from store
  const {
    userProfile,
    userMemory,
    days,
    updateUserMemory,
    addMemoryNote,
    incrementInteractionCount,
  } = useStore();

  // Build user context for personalized responses
  const userContext = useMemo(() => {
    // Get last 7 days of entries
    const today = new Date();
    const recentDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      if (days[dateStr]) {
        recentDays.push(days[dateStr]);
      }
    }
    return buildUserContext(userProfile, userMemory, recentDays);
  }, [userProfile, userMemory, days]);

  // Auto-trigger streaming when pendingQuestion is set
  useEffect(() => {
    if (!pendingQuestion) return;
    const q = pendingQuestion;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingQuestion(null);
    lastUserQuestionRef.current = q;

    const id = `coach-${Date.now()}`;
    streamIdRef.current = id;
    setMessages((prev) => [...prev, { id, role: "coach", streamText: "" }]);

    // Build prompts with user context for personalized responses
    const { systemPrompt, userPrompt } = buildBookQAPrompts({
      question: q,
      userContext,
      sport: userProfile.sport || undefined,
    });
    streamGenerate(systemPrompt, userPrompt);

    // Increment interaction count
    incrementInteractionCount();
  }, [pendingQuestion, streamGenerate, userContext, userProfile.sport, incrementInteractionCount]);

  // Update streaming message as text comes in
  useEffect(() => {
    if (!streamIdRef.current || !streamText) return;
    const id = streamIdRef.current;
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, streamText } : m))
    );
  }, [streamText]);

  // When streaming completes, try to parse structured response
  useEffect(() => {
    if (loading || !streamIdRef.current || !streamText) return;
    const id = streamIdRef.current;
    streamIdRef.current = null;

    let parsed: BookQAOutput | null = null;
    try {
      parsed = JSON.parse(streamText) as BookQAOutput;
    } catch {
      // Try extracting JSON from markdown
      const match = streamText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        try {
          parsed = JSON.parse(match[1].trim()) as BookQAOutput;
        } catch {
          // Not valid JSON
        }
      }
    }

    const answerText = parsed?.answer || streamText;

    if (parsed) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, answer: parsed!, streamText: undefined } : m
        )
      );
    } else {
      // Keep as raw text if not parseable
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                answer: {
                  answer: streamText,
                  bookReferences: [],
                  relatedTopics: [],
                },
                streamText: undefined,
              }
            : m
        )
      );
    }

    // Process conversation for memory learning
    if (lastUserQuestionRef.current && answerText) {
      const analysis = analyzeConversation(lastUserQuestionRef.current, answerText);

      // Update memory with learned preferences
      const memoryUpdates = updateMemoryFromConversation(userMemory, analysis);
      if (Object.keys(memoryUpdates).length > 0) {
        updateUserMemory(memoryUpdates);
      }

      // Save note if significant insight was found
      if (analysis.shouldSaveNote && analysis.noteContent) {
        addMemoryNote({
          context: lastUserQuestionRef.current.slice(0, 100),
          insight: analysis.noteContent,
          source: "ai-conversation",
        });
      }
    }

    streamReset();
  }, [loading, streamText, streamReset, userMemory, updateUserMemory, addMemoryNote]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamText]);

  // Auto-trigger initial question from URL param
  useEffect(() => {
    if (initialQuestion && !initialTriggered.current && ready) {
      initialTriggered.current = true;
      const q = initialQuestion.trim();
      if (q) {
        /* eslint-disable react-hooks/set-state-in-effect */
        setMessages([{ id: `user-${Date.now()}`, role: "user", question: q }]);
        setPendingQuestion(q);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    }
  }, [initialQuestion, ready]);

  const handleAsk = useCallback(
    (q: string) => {
      if (!q.trim() || loading) return;
      const trimmed = q.trim();
      setQuestion("");

      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "user", question: trimmed },
      ]);

      setPendingQuestion(trimmed);
    },
    [loading]
  );

  const handleSubmit = () => handleAsk(question);

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
          AI features are not available. Please enable the server route or add
          your OpenAI API key in Settings.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-1 space-y-3 pb-36 md:pb-40"
      >
        {messages.length === 0 && (
          <div className="pt-8 text-center">
            <div
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold mb-4"
              style={{
                background: "var(--selected-gold-bg)",
                color: "var(--accent-gold)",
              }}
            >
              H
            </div>
            <p className="text-lg font-bold mb-1">Ask Coach Hamza</p>
            <p
              className="text-xs mb-6"
              style={{ color: "var(--muted)" }}
            >
              Questions about fasting, training, nutrition, and Ramadan
            </p>
            <div className="space-y-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleAsk(q)}
                  className="block w-full text-left rounded-xl px-4 py-3 text-sm transition-all active:scale-[0.98]"
                  style={{
                    background: "var(--surface-1)",
                    color: "var(--foreground)",
                  }}
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
                    style={{ background: "var(--selected-gold-bg)" }}
                  >
                    <p className="text-sm">{msg.question}</p>
                  </div>
                </div>
              )}
              {msg.role === "coach" && msg.streamText !== undefined && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl rounded-bl-md px-4 py-3 max-w-[90%]"
                    style={{ background: "var(--surface-1)" }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {msg.streamText || (
                        <span className="flex gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full animate-pulse"
                            style={{
                              background: "var(--accent-gold)",
                              animationDelay: "0ms",
                            }}
                          />
                          <span
                            className="h-2 w-2 rounded-full animate-pulse"
                            style={{
                              background: "var(--accent-gold)",
                              animationDelay: "150ms",
                            }}
                          />
                          <span
                            className="h-2 w-2 rounded-full animate-pulse"
                            style={{
                              background: "var(--accent-gold)",
                              animationDelay: "300ms",
                            }}
                          />
                        </span>
                      )}
                    </p>
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
                      <div
                        className="mt-2 pt-2"
                        style={{
                          borderTop: "1px solid var(--card-border)",
                        }}
                      >
                        <p
                          className="text-[10px] font-medium mb-1"
                          style={{ color: "var(--accent-gold)" }}
                        >
                          Book References
                        </p>
                        {msg.answer.bookReferences.map((ref, i) => (
                          <p
                            key={i}
                            className="text-[11px]"
                            style={{ color: "var(--muted)" }}
                          >
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
                            onClick={() => handleAsk(topic)}
                            className="rounded-full px-2.5 py-1 text-[10px]"
                            style={{
                              background: "var(--selected-gold-bg)",
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

        {error && (
          <div
            className="text-xs text-center py-2"
            style={{ color: "#e55" }}
          >
            {error}
          </div>
        )}

        {/* Book Download Link */}
        {messages.length > 0 && (
          <div className="mt-6 pt-4 text-center" style={{ borderTop: "1px solid var(--card-border)" }}>
            <a
              href={BOOK_PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs transition-opacity hover:opacity-80"
              style={{ color: "var(--accent-gold)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download the complete book (PDF)
            </a>
          </div>
        )}
      </div>

      {/* Input - Fixed at bottom above nav */}
      <div
        className="fixed left-0 right-0 z-50 px-6 pb-2 pt-2 bottom-[calc(env(safe-area-inset-bottom,0px)+64px)] md:bottom-[90px]"
        style={{
          background: "var(--background)",
        }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask Coach Hamza..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              background: "var(--surface-1)",
              color: "var(--foreground)",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || loading}
            className="rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-[0.96] disabled:opacity-40"
            style={{ background: "var(--accent-gold)", color: "#000" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 9h14M10 3l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
