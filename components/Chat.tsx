'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import styles from './Chat.module.css';

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

type Confidence = 'guessing' | 'thinking' | 'sure' | null;
type Move = 'ask-why' | 'edge-case' | 'show-example' | 'compare' | null;

const CONFIDENCE_TAGS: Record<Exclude<Confidence, null>, string> = {
  guessing: "[I'm guessing]",
  thinking: '[I think so]',
  sure:     "[I'm sure]",
};
const CONFIDENCE_LABELS: Record<Exclude<Confidence, null>, string> = {
  guessing: "I'm guessing",
  thinking: "I think so",
  sure:     "I'm sure",
};

const MOVE_TAGS: Record<Exclude<Move, null>, string> = {
  'ask-why':      '[move: ask-why]',
  'edge-case':    '[move: edge-case]',
  'show-example': '[move: show-example]',
  'compare':      '[move: compare]',
};
const MOVE_LABELS: Record<Exclude<Move, null>, string> = {
  'ask-why':      'Ask why',
  'edge-case':    'What if…',
  'show-example': 'Show example',
  'compare':      'Compare',
};
const MOVE_HINTS: Record<Exclude<Move, null>, string> = {
  'ask-why':      'Probe Sam\'s reasoning. "Why do you think that?"',
  'edge-case':    'Surface a counter-example. "What about a feather in a vacuum?"',
  'show-example': 'Anchor in something concrete. "Picture two bowling balls…"',
  'compare':      'Force a contrast. "How is this different from…?"',
};

export default function Chat({ sessionId, initialMessages, personaName, subject, onMeta, onEnd }: Props) {
  const [messages, setMessages]     = useState<Turn[]>(initialMessages);
  const [input, setInput]           = useState('');
  const [confidence, setConfidence] = useState<Confidence>(null);
  const [move, setMove]             = useState<Move>(null);
  const [isStreaming, setIsStreaming]   = useState(false);
  const [hintLoading, setHintLoading]  = useState(false);
  const [hintCooldownUntilTurn, setHintCooldownUntilTurn] = useState(0);
  const [turnCount, setTurnCount]  = useState(0);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const trimmed = input.trim();
    const prefixParts: string[] = [];
    if (confidence) prefixParts.push(CONFIDENCE_TAGS[confidence]);
    if (move) prefixParts.push(MOVE_TAGS[move]);
    const userMessage = prefixParts.length > 0
      ? `${prefixParts.join(' ')} ${trimmed}`
      : trimmed;
    setInput('');
    setConfidence(null);
    setMove(null);
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

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

      setMessages(prev => [...prev, { role: 'student', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
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
      setTurnCount(prev => prev + 1);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const hintOnCooldown = turnCount < hintCooldownUntilTurn;

  const requestHint = async () => {
    if (hintOnCooldown) return;
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
          scores: {}, emoticon: '', tag: '',
          state_transitions: [], coachNudge: data, miscStates: {}, intent: '',
        } as any);
        setHintCooldownUntilTurn(turnCount + 1);
      }
    } catch (error) {
      console.error('Hint request error:', error);
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <span className={styles.headerName}>{personaName}</span>
          <span className={styles.headerDot}>&middot;</span>
          <span className={styles.headerSubject}>{subject}</span>
        </div>
        <button onClick={onEnd} className={styles.endBtn}>End session</button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className={styles.messages}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== 'student' && (
          <div className={styles.typing}>
            <div className={styles.typingBubble}>
              <span className={styles.typingDot} style={{ animationDelay: '0ms'   }} />
              <span className={styles.typingDot} style={{ animationDelay: '150ms' }} />
              <span className={styles.typingDot} style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className={styles.inputArea}>
        {/* Confidence row */}
        <div className={styles.toolbar}>
          <span className={styles.toolbarLabel}>How confident?</span>
          {(['guessing', 'thinking', 'sure'] as const).map(level => (
            <button
              key={level}
              type="button"
              onClick={() => setConfidence(confidence === level ? null : level)}
              disabled={isStreaming}
              className={`${styles.pill} ${confidence === level ? styles.pillConfidenceActive : ''}`}
            >
              {CONFIDENCE_LABELS[level]}
            </button>
          ))}
        </div>

        {/* Move row */}
        <div className={styles.toolbar}>
          <span className={styles.toolbarLabel}>Teaching move?</span>
          {(['ask-why', 'edge-case', 'show-example', 'compare'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMove(move === m ? null : m)}
              disabled={isStreaming}
              title={MOVE_HINTS[m]}
              className={`${styles.pill} ${move === m ? styles.pillMoveActive : ''}`}
            >
              {MOVE_LABELS[m]}
            </button>
          ))}
        </div>

        {move && <p className={styles.moveHint}>{MOVE_HINTS[move]}</p>}

        <div className={styles.inputRow}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              // Auto-grow up to max-height
              const el = e.target;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 130) + 'px';
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message… (Shift+Enter for newline)"
            disabled={isStreaming}
            className={styles.textInput}
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className={styles.sendBtn}
          >
            Send
          </button>
          <div className={styles.hintWrap}>
            <button
              onClick={requestHint}
              disabled={hintLoading || isStreaming || hintOnCooldown}
              className={styles.hintBtn}
            >
              {hintLoading ? '…' : hintOnCooldown ? 'Next turn' : 'Hint'}
            </button>
            <div className={styles.tooltip}>
              {hintOnCooldown
                ? 'Hint available next turn.'
                : 'Get a strategy nudge from the coach. Small scoring penalty applies.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
