'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';

type Turn = {
  role: 'user' | 'student';
  content: string;
};

type MetaEvent = {
  scores: Record<string, number>;
  emoticon: string;
  tag: string;
  state_transition: any;
  coachNudge: { nudge: string; type: string } | null;
  miscStates: Record<string, string>;
  intent: string;
};

type Props = {
  sessionId: string;
  initialMessages: Turn[];
  personaName: string;
  subject: string;
  onMeta: (meta: MetaEvent) => void;
  onEnd: () => void;
};

export default function Chat({ sessionId, initialMessages, personaName, subject, onMeta, onEnd }: Props) {
  const [messages, setMessages] = useState<Turn[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userMessage }),
      });

      if (!res.ok) throw new Error('Chat request failed');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let studentContent = '';

      // Add placeholder for student message
      setMessages(prev => [...prev, { role: 'student', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content') {
              studentContent += parsed.content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'student', content: studentContent };
                return updated;
              });
            } else if (parsed.type === 'meta') {
              onMeta(parsed as MetaEvent);
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const requestHint = async () => {
    setHintLoading(true);
    try {
      const res = await fetch('/api/coach/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        const data = await res.json();
        onMeta({
          scores: {},
          emoticon: '',
          tag: '',
          state_transition: null,
          coachNudge: data,
          miscStates: {},
          intent: '',
        } as any);
      }
    } catch (error) {
      console.error('Hint request error:', error);
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div>
          <span className="font-semibold text-gray-800">{personaName}</span>
          <span className="text-gray-400 mx-2">&middot;</span>
          <span className="text-gray-500 text-sm">{subject}</span>
        </div>
        <button
          onClick={onEnd}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          End session
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== 'student' && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-2xl px-4 py-3 rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
          <div className="relative group">
            <button
              onClick={requestHint}
              disabled={hintLoading || isStreaming}
              className="px-3 py-3 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-200 transition-colors disabled:opacity-50"
            >
              {hintLoading ? '...' : 'Hint'}
            </button>
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Get a strategy nudge from the coach. Small scoring penalty applies.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
