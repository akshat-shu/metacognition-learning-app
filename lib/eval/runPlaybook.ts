import type { Playbook, PlaybookRun, PlaybookTrace, TurnTrace } from './types';

type ChatMetaEvent = {
  scores?: Record<string, number>;
  emoticon?: string;
  tag?: string;
  evidence?: string;
  state_transition?: { misc_id: string; from: string; to: string; reason: string } | null;
  coachNudge?: { nudge: string; type: string } | null;
  miscStates?: Record<string, string>;
  intent?: string;
};

async function startSession(playbook: Playbook): Promise<{ sessionId: string; opener: string }> {
  // Preteach is heavy and not strictly needed for chat; skip if it fails.
  try {
    await fetch('/api/preteach/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briefId: playbook.briefId }),
    });
  } catch {
    // non-fatal — the session can still start without it
  }

  const res = await fetch('/api/session/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ briefId: playbook.briefId, strategyChoices: playbook.strategies }),
  });
  if (!res.ok) {
    throw new Error(`session/start ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return { sessionId: data.sessionId, opener: data.opener };
}

async function sendTurn(
  sessionId: string,
  turnIndex: number,
  userMessage: string,
): Promise<TurnTrace> {
  const start = Date.now();
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, userMessage }),
    });
    if (!res.ok || !res.body) {
      throw new Error(`chat ${res.status}: ${await res.text()}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let studentReply = '';
    let meta: ChatMetaEvent = {};

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nlIdx;
      while ((nlIdx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, nlIdx);
        buffer = buffer.slice(nlIdx + 1);
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const parsed = JSON.parse(payload);
          if (parsed.type === 'content') {
            studentReply += parsed.content || '';
          } else if (parsed.type === 'meta') {
            meta = parsed;
          }
        } catch {
          // ignore malformed payloads
        }
      }
    }

    return {
      turnIndex,
      userMessage,
      studentReply,
      scores: meta.scores,
      emoticon: meta.emoticon,
      tag: meta.tag,
      evidence: meta.evidence,
      stateTransition: meta.state_transition ?? null,
      miscStatesAfter: meta.miscStates,
      intent: meta.intent,
      coachNudge: meta.coachNudge ?? null,
      durationMs: Date.now() - start,
    };
  } catch (error) {
    return {
      turnIndex,
      userMessage,
      studentReply: '',
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'unknown error',
    };
  }
}

export async function runPlaybook(playbook: Playbook): Promise<PlaybookRun> {
  const startedAt = Date.now();

  let sessionId: string | undefined;
  let opener: string | undefined;
  let setupError: string | undefined;

  try {
    const setup = await startSession(playbook);
    sessionId = setup.sessionId;
    opener = setup.opener;
  } catch (error) {
    setupError = error instanceof Error ? error.message : 'setup failed';
  }

  const turns: TurnTrace[] = [];

  if (sessionId) {
    for (let i = 0; i < playbook.turns.length; i++) {
      const t = await sendTurn(sessionId, i, playbook.turns[i]);
      turns.push(t);
      // If a turn errored, don't keep hammering — the session may be wedged
      if (t.error) break;
    }
  }

  const finalMiscStates = turns.length > 0 ? turns[turns.length - 1].miscStatesAfter : undefined;

  const trace: PlaybookTrace = {
    playbookId: playbook.id,
    playbookName: playbook.name,
    sessionId,
    opener,
    turns,
    finalMiscStates,
    totalDurationMs: Date.now() - startedAt,
    setupError,
  };

  const assertions = playbook.assertions.map(a => {
    try {
      const result = a.check(trace);
      return { name: a.name, pass: result.pass, detail: result.detail };
    } catch (error) {
      return {
        name: a.name,
        pass: false,
        detail: `assertion threw: ${error instanceof Error ? error.message : 'unknown'}`,
      };
    }
  });

  const passCount = assertions.filter(a => a.pass).length;
  const failCount = assertions.length - passCount;

  return { trace, assertions, passCount, failCount };
}
