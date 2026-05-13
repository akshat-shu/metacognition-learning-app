"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { EmoticonFace } from "@/components/EmoticonFace";
import { MessageBubble } from "@/components/MessageBubble";
import { ScenarioCard } from "@/components/ScenarioCard";
import { sampleBrief } from "@/lib/briefs/sample-physics";
import {
  createSessionId,
  getStoredSessionId,
  setStoredSessionId,
  storeRecap,
} from "@/lib/session";
import type { EmoticonState, SessionRecap } from "@/lib/types";

type ChatTurn = {
  id: string;
  role: "user" | "student";
  content: string;
};

type SseEventPayloads = {
  student_token: { token: string };
  final: { sessionId: string; emoticon: EmoticonState; tag: string };
  done: { ok: boolean };
  error: { message: string };
};

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

function parseSseEvents(chunk: string): Array<{ event: string; data: string }> {
  return chunk
    .split("\n\n")
    .filter((part) => part.trim().length > 0)
    .map((part) => {
      const lines = part.split("\n");
      let event = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) {
          event = line.slice("event:".length).trim();
        } else if (line.startsWith("data:")) {
          data += line.slice("data:".length).trim();
        }
      }
      return { event, data };
    });
}

export function Chat() {
  const router = useRouter();
  const brief = useMemo(() => sampleBrief, []);
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "";
    }
    const existing = getStoredSessionId();
    if (existing) {
      return existing;
    }
    const generated = createSessionId();
    setStoredSessionId(generated);
    return generated;
  });
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreamingStudent, setIsStreamingStudent] = useState(false);
  const [ending, setEnding] = useState(false);
  const [tag, setTag] = useState("Start with a probing question.");
  const [emoticon, setEmoticon] = useState<EmoticonState>("neutral");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const streamingStudentIdRef = useRef<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const tokenBufferRef = useRef<string>("");

  useEffect(() => {
    if (!transcriptRef.current) {
      return;
    }
    transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [turns, loading]);

  const pushStudentToken = (token: string) => {
    tokenBufferRef.current += token;
    setIsStreamingStudent(true);
  };

  const consumeSseEvent = (entry: { event: string; data: string }) => {
    if (!entry.data) {
      return;
    }
    switch (entry.event) {
      case "student_token": {
        const payload = JSON.parse(entry.data) as SseEventPayloads["student_token"];
        pushStudentToken(payload.token);
        break;
      }
      case "final": {
        const payload = JSON.parse(entry.data) as SseEventPayloads["final"];
        // Add the buffered message to turns if there are tokens
        if (tokenBufferRef.current.trim().length > 0) {
          setTurns((current) => [...current, { id: makeId(), role: "student", content: tokenBufferRef.current }]);
        }
        // Reset buffer
        tokenBufferRef.current = "";
        streamingStudentIdRef.current = null;
        setTag(payload.tag);
        setEmoticon(payload.emoticon);
        setSessionId(payload.sessionId);
        setStoredSessionId(payload.sessionId);
        break;
      }
      case "error": {
        const payload = JSON.parse(entry.data) as SseEventPayloads["error"];
        setStatusMessage(payload.message);
        break;
      }
      default:
        break;
    }
  };

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) {
      return;
    }

    const activeSessionId = sessionId || createSessionId();
    if (!sessionId) {
      setSessionId(activeSessionId);
      setStoredSessionId(activeSessionId);
    }

    setStatusMessage("");
    setLoading(true);
    setIsStreamingStudent(false);
    streamingStudentIdRef.current = null;
    setTurns((current) => [...current, { id: makeId(), role: "user", content: trimmed }]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          briefId: brief.id,
          userMessage: trimmed,
        }),
      });

      if (res.status === 409) {
        const hardCap = (await res.json()) as {
          hardCapReached?: boolean;
          message?: string;
        };
        if (hardCap.hardCapReached) {
          setStatusMessage(hardCap.message ?? "Session turn limit reached.");
          return;
        }
      }

      if (!res.ok || !res.body) {
        throw new Error(`Failed to open chat stream. Status: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";


      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        while (buffer.includes("\n\n")) {
          const boundary = buffer.indexOf("\n\n");
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          const parsed = parseSseEvents(`${rawEvent}\n\n`);
          for (const entry of parsed) {
            consumeSseEvent(entry);
          }
        }
      }

      if (buffer.trim().length > 0) {
        const parsed = parseSseEvents(`${buffer}\n\n`);
        for (const entry of parsed) {
          consumeSseEvent(entry);
        }
      }
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Request failed unexpectedly.",
      );
    } finally {
      setLoading(false);
      setIsStreamingStudent(false);
      streamingStudentIdRef.current = null;
    }
  };

  const handleEndSession = async () => {
    if (!sessionId || ending) {
      return;
    }
    setEnding(true);
    setStatusMessage("");
    try {
      const res = await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) {
        throw new Error("Could not generate recap.");
      }
      const payload = (await res.json()) as { recap: SessionRecap };
      storeRecap(sessionId, payload.recap);
      router.push(`/recap/${sessionId}`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to end this session.",
      );
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-6 bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50 w-full min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <ScenarioCard
          personaName={brief.persona.name}
          subject={brief.subject}
          scenario={brief.scenario}
          onEndSession={handleEndSession}
          ending={ending}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_280px]">
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden max-h-[500px]">
            <div ref={transcriptRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {turns.length === 0 ? (
                <p className="text-center text-sm text-slate-500 italic py-4">
                  Start by asking a question about how falling objects behave.
                </p>
              ) : (
                turns.map((turn) => (
                  <MessageBubble
                    key={turn.id}
                    role={turn.role}
                    content={turn.content}
                    name={brief.persona.name}
                  />
                ))
              )}
              {loading && !isStreamingStudent ? (
                <p className="text-sm text-slate-500 italic animate-pulse">Thinking...</p>
              ) : null}
            </div>

            <form onSubmit={handleSend} className="border-t border-slate-200 bg-white p-4">
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={loading}
                  placeholder="Teach by probing their reasoning..."
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-blue-400 focus:border-blue-400 disabled:bg-slate-100 disabled:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={loading || input.trim().length === 0}
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                >
                  Send
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            <EmoticonFace state={emoticon} />
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md flex-shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Current signal
              </p>
              <p className="mt-3 text-sm font-medium text-slate-700 leading-relaxed">{tag}</p>
            </div>
            {statusMessage ? (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900 shadow-sm">
                {statusMessage}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
