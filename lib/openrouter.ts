import { z } from 'zod';

type Message = { role: 'system' | 'user' | 'assistant'; content: string };
type LLMRole = 'student' | 'judge' | 'grader' | 'briefGen';
type ReasoningEffort = 'none' | 'low' | 'medium' | 'high';

export type CallOptions = {
  reasoningEffort?: ReasoningEffort;
};

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Model selection map — verified against openrouter.ai/api/v1/models on 2026-05-15.
// Budget targeting ~$50 over ~4 days, ~30-50 sessions. Per-session totals stay <$0.05
// on the defaults below; see commit message for the cost arithmetic.
//
//   student   — every turn, streamed. Flash-tier mandatory.
//                qwen3.6-flash ($0.19/$1.13 per M) — solid persona-following, fast.
//   grader    — every turn, JSON, conditional logic. Cheap reasoning model.
//                deepseek-v4-flash ($0.13/$0.25 per M) + reasoning:low.
//   judge     — synth/coach/audit/preteach. One-shot, low stakes.
//                gemini-3.1-flash-lite ($0.25/$1.5 per M) — fast + cheap.
//   briefGen  — ONCE per session, kicks off everything. Worth a reasoning model.
//                deepseek-v4-pro ($0.44/$0.87 per M) + reasoning:medium.

const STUDENT_FALLBACKS = [
  'qwen/qwen3.6-flash',
  'deepseek/deepseek-v4-flash-20260423',
  'google/gemini-3.1-flash-lite-20260507',
];

const GRADER_FALLBACKS = [
  'deepseek/deepseek-v4-flash-20260423',
  'qwen/qwen3.6-flash',
];

const JUDGE_FALLBACKS = [
  'google/gemini-3.1-flash-lite-20260507',
  'qwen/qwen3.6-flash',
  'google/gemma-4-26b-a4b-it-20260403',
];

const BRIEF_GEN_FALLBACKS = [
  'deepseek/deepseek-v4-pro-20260423',
  'moonshotai/kimi-k2.6-20260420',
  'qwen/qwen3.6-flash',
];

function getHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
    'X-Title': 'Reverse Tutor',
  };
}

function dedupe(list: string[]): string[] {
  return Array.from(new Set(list.filter(Boolean)));
}

function getModels(role: LLMRole): string[] {
  if (role === 'student') {
    return dedupe([process.env.STUDENT_MODEL || STUDENT_FALLBACKS[0], ...STUDENT_FALLBACKS]);
  }
  if (role === 'grader') {
    return dedupe([process.env.GRADER_MODEL || GRADER_FALLBACKS[0], ...GRADER_FALLBACKS]);
  }
  if (role === 'briefGen') {
    return dedupe([process.env.BRIEF_GEN_MODEL || BRIEF_GEN_FALLBACKS[0], ...BRIEF_GEN_FALLBACKS]);
  }
  return dedupe([process.env.JUDGE_MODEL || JUDGE_FALLBACKS[0], ...JUDGE_FALLBACKS]);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function callLLM(
  messages: Message[],
  role: LLMRole,
  opts?: CallOptions,
): Promise<string> {
  const models = getModels(role);
  const maxRetries = models.length * 2; // Each model gets 2 chances

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Cycle through models on retries
    const model = models[attempt % models.length];

    const body_payload: Record<string, unknown> = {
      model,
      messages,
      temperature: role === 'student' ? 0.8 : role === 'briefGen' ? 0.6 : 0.3,
      // briefGen produces a full JSON brief AND may emit reasoning tokens — need
      // generous headroom or the response truncates mid-thought.
      max_tokens: role === 'student' ? 500 : role === 'briefGen' ? 8000 : 1500,
    };
    // Per-function reasoning effort: caller can override, otherwise use role default
    const effort = opts?.reasoningEffort
      ?? (role === 'grader'
        ? 'low'
        : role === 'judge'
          ? 'none'
          : role === 'briefGen'
            ? 'low'
            : undefined);
    if (effort) {
      body_payload.reasoning = { effort };
    }

    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body_payload),
    });

    if (res.ok) {
      const data = await res.json();
      const msg = data.choices?.[0]?.message;
      // Some models put content in reasoning when thinking is on
      const content = msg?.content || msg?.reasoning || '';
      if (!content) {
        console.warn(`Empty content from ${model}. Message keys:`, msg ? Object.keys(msg) : 'null', 'Full:', JSON.stringify(msg).slice(0, 300));
      }
      return content;
    }

    const body = await res.text();

    // 429 rate limit — wait and retry with next model
    if (res.status === 429) {
      let waitSeconds = 5 * (attempt + 1);
      try {
        const parsed = JSON.parse(body);
        const retryAfter = parsed?.error?.metadata?.retry_after_seconds;
        if (retryAfter && typeof retryAfter === 'number') {
          waitSeconds = Math.min(retryAfter + 1, 30);
        }
      } catch {}
      console.warn(`Rate limited on ${model}, waiting ${waitSeconds}s before retry ${attempt + 1}/${maxRetries}...`);
      await sleep(waitSeconds * 1000);
      continue;
    }

    // 404 model not found — skip to next model immediately
    if (res.status === 404) {
      console.warn(`Model ${model} not found, trying next fallback...`);
      continue;
    }

    throw new Error(`OpenRouter error (${res.status}): ${body}`);
  }

  throw new Error('All retry attempts exhausted due to rate limiting');
}

function extractJSON(raw: string): Record<string, unknown> | null {
  // Try parsing the whole response first (model returned pure JSON)
  try {
    const parsed = JSON.parse(raw.trim());
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch {}

  // Find JSON blocks by matching balanced braces
  const candidates: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '{') {
      let depth = 0;
      for (let j = i; j < raw.length; j++) {
        if (raw[j] === '{') depth++;
        else if (raw[j] === '}') depth--;
        if (depth === 0) {
          candidates.push(raw.slice(i, j + 1));
          break;
        }
      }
    }
  }

  // Try candidates from largest to smallest (response JSON is usually the biggest)
  candidates.sort((a, b) => b.length - a.length);
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    } catch {}
  }

  return null;
}

// --- Levenshtein key normalization (Fix 1) ---
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    [i, ...Array(n).fill(0)]
  );
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function normalizeKeys(obj: unknown, expectedKeys: string[]): unknown {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return obj;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (expectedKeys.includes(key)) {
      result[key] = value;
      continue;
    }
    const match = expectedKeys
      .map(e => ({ key: e, dist: levenshtein(key, e) }))
      .filter(x => x.dist > 0 && x.dist <= 2)
      .sort((a, b) => a.dist - b.dist)[0];
    if (match && !(match.key in result)) {
      console.warn(`[KeyNorm] Corrected "${key}" → "${match.key}" (dist ${match.dist})`);
      result[match.key] = value;
    } else {
      result[key] = value;
    }
  }
  return result;
}

function getExpectedKeys(schema: z.ZodSchema): string[] {
  try {
    const shape = (schema as any)?._def?.shape?.() || (schema as any)?._def?.shape || {};
    return Object.keys(shape);
  } catch {
    return [];
  }
}

export async function callJSONValidated<T>(
  messages: Message[],
  role: LLMRole,
  schema: z.ZodSchema<T>,
  maxRetries = 2,
  opts?: CallOptions,
): Promise<T> {
  const expectedKeys = getExpectedKeys(schema);
  let lastRaw = '';
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const raw = await callLLM(messages, role, opts);
    lastRaw = raw;
    const parsed = extractJSON(raw);
    if (parsed !== null) {
      // Normalize keys before validation (catches concept_prider → concept_primer etc.)
      const normalized = expectedKeys.length > 0
        ? normalizeKeys(parsed, expectedKeys) as Record<string, unknown>
        : parsed;
      try {
        const result = schema.parse(normalized);
        return result;
      } catch (e) {
        console.warn(`JSON validation failed (attempt ${attempt + 1}). Keys:`, Object.keys(normalized), 'Sample:', JSON.stringify(normalized).slice(0, 300));
        if ('state_transitions' in normalized) {
          console.warn('  state_transitions value:', JSON.stringify(normalized.state_transitions));
        } else if ('state_transition' in normalized) {
          console.warn('  state_transition value:', JSON.stringify(normalized.state_transition));
        }
        if (attempt === maxRetries) throw e;
      }
    } else {
      console.warn(`No JSON found (attempt ${attempt + 1}), raw:`, raw.slice(0, 300));
      if (attempt === maxRetries) {
        throw new Error(`No JSON found in LLM response after ${maxRetries + 1} attempts. Last raw: ${lastRaw.slice(0, 200)}`);
      }
    }
  }
  throw new Error('Unreachable');
}

export async function streamLLM(
  messages: Message[],
  role: LLMRole,
): Promise<ReadableStream<Uint8Array>> {
  const models = getModels(role);
  let res: Response | null = null;

  for (let attempt = 0; attempt < models.length * 2; attempt++) {
    const model = models[attempt % models.length];
    const r = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model,
        messages,
        temperature: role === 'student' ? 0.8 : 0.3,
        max_tokens: 500,
        stream: true,
      }),
    });

    if (r.ok) { res = r; break; }

    if (r.status === 429) {
      const waitSeconds = 5 * (attempt + 1);
      console.warn(`Stream rate limited on ${model}, waiting ${waitSeconds}s...`);
      await sleep(waitSeconds * 1000);
      continue;
    }

    if (r.status === 404) {
      console.warn(`Stream model ${model} not found, trying next fallback...`);
      continue;
    }

    const err = await r.text();
    throw new Error(`OpenRouter stream error (${r.status}): ${err}`);
  }

  if (!res) throw new Error('All stream retry attempts exhausted');

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch {
              // Skip unparseable chunks
            }
          }
        }
      }
    },
  });
}

// Convenience: call student and collect full response (for opener, etc.)
export async function callStudent(messages: Message[]): Promise<string> {
  return callLLM(messages, 'student');
}

// Stream student response — yields chunks as they arrive, returns full content via callback
export async function* streamStudentTokens(messages: Message[]): AsyncGenerator<string, string> {
  const models = getModels('student');
  let res: Response | null = null;

  for (let attempt = 0; attempt < models.length * 2; attempt++) {
    const model = models[attempt % models.length];
    const r = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.8,
        max_tokens: 500,
        stream: true,
      }),
    });

    if (r.ok) { res = r; break; }

    if (r.status === 429) {
      const waitSeconds = 5 * (attempt + 1);
      console.warn(`Stream rate limited on ${model}, waiting ${waitSeconds}s...`);
      await sleep(waitSeconds * 1000);
      continue;
    }
    if (r.status === 404) {
      console.warn(`Stream model ${model} not found, trying next...`);
      continue;
    }
    const err = await r.text();
    throw new Error(`OpenRouter stream error (${r.status}): ${err}`);
  }

  if (!res) throw new Error('All stream retry attempts exhausted');

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return fullContent;
      try {
        const delta = JSON.parse(data).choices?.[0]?.delta?.content;
        if (delta) {
          fullContent += delta;
          yield delta;
        }
      } catch {}
    }
  }

  return fullContent;
}

export async function callJudge(messages: Message[]): Promise<string> {
  return callLLM(messages, 'judge');
}
