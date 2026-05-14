import { z } from 'zod';

type Message = { role: 'system' | 'user' | 'assistant'; content: string };
type LLMRole = 'student' | 'judge' | 'grader';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
    'X-Title': 'Reverse Tutor',
  };
}

function getModels(role: LLMRole): string[] {
  if (role === 'student') {
    const primary = process.env.STUDENT_MODEL || 'qwen/qwen3.5-plus-20260420';
    return [primary, 'qwen/qwen3.6-flash', 'qwen/qwen3.5-flash-02-23'];
  }
  // Grader uses the stronger model — needs to understand context well
  if (role === 'grader') {
    return ['qwen/qwen3.5-plus-20260420', 'qwen/qwen3.6-plus', 'qwen/qwen3.6-flash'];
  }
  // Judge (coach, synth, preteach, audit) — cheaper model is fine
  const primary = process.env.JUDGE_MODEL || 'qwen/qwen3.5-flash-02-23';
  return [primary, 'qwen/qwen3.6-flash', 'qwen/qwen3.5-27b'];
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function callLLM(
  messages: Message[],
  role: LLMRole,
): Promise<string> {
  const models = getModels(role);
  const maxRetries = models.length * 2; // Each model gets 2 chances

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Cycle through models on retries
    const model = models[attempt % models.length];

    const body_payload: Record<string, unknown> = {
      model,
      messages,
      temperature: role === 'student' ? 0.8 : 0.3,
      max_tokens: role === 'student' ? 500 : 1500,
    };
    // Grader needs some reasoning to follow conditional transition logic
    // Judge (coach, synth) can work without reasoning
    if (role === 'judge') {
      body_payload.reasoning = { effort: 'none' };
    } else if (role === 'grader') {
      body_payload.reasoning = { effort: 'low' };
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

export async function callJSONValidated<T>(
  messages: Message[],
  role: LLMRole,
  schema: z.ZodSchema<T>,
  maxRetries = 2,
): Promise<T> {
  let lastRaw = '';
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const raw = await callLLM(messages, role);
    lastRaw = raw;
    // Try to extract JSON — find all candidate {} blocks and try each
    const parsed = extractJSON(raw);
    if (parsed !== null) {
      try {
        const result = schema.parse(parsed);
        return result;
      } catch (e) {
        console.warn(`JSON validation failed (attempt ${attempt + 1}). Keys:`, Object.keys(parsed), 'Sample:', JSON.stringify(parsed).slice(0, 300));
        // Log state_transition specifically if present (common failure point)
        if ('state_transition' in parsed) {
          console.warn('  state_transition value:', JSON.stringify(parsed.state_transition));
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

export async function callJudge(messages: Message[]): Promise<string> {
  return callLLM(messages, 'judge');
}
