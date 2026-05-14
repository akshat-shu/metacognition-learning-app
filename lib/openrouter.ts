import { z } from 'zod';

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
    'X-Title': 'Reverse Tutor',
  };
}

function getModels(role: 'student' | 'judge'): string[] {
  if (role === 'student') {
    const primary = process.env.STUDENT_MODEL || 'qwen/qwen3-235b-a22b:free';
    return [primary, 'openrouter/free'];
  }
  const primary = process.env.JUDGE_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
  return [primary, 'google/gemma-3-27b-it:free', 'openrouter/free'];
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function callLLM(
  messages: Message[],
  role: 'student' | 'judge',
  maxTokens?: number,
): Promise<string> {
  const models = getModels(role);
  const maxRetries = models.length * 2; // Each model gets 2 chances
  const tokenLimit = maxTokens ?? (role === 'student' ? 500 : 1000);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Cycle through models on retries
    const model = models[attempt % models.length];

    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model,
        messages,
        temperature: role === 'student' ? 0.8 : 0.3,
        max_tokens: tokenLimit,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
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

export async function callJSONValidated<T>(
  messages: Message[],
  role: 'student' | 'judge',
  schema: z.ZodSchema<T>,
  maxRetries = 2,
  maxTokens?: number,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const raw = await callLLM(messages, role, maxTokens);
    // Try to extract JSON from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const result = schema.parse(parsed);
        return result;
      } catch (e) {
        if (attempt === maxRetries) throw e;
      }
    } else if (attempt === maxRetries) {
      throw new Error(`No JSON found in LLM response after ${maxRetries + 1} attempts`);
    }
  }
  throw new Error('Unreachable');
}

export async function streamLLM(
  messages: Message[],
  role: 'student' | 'judge',
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
