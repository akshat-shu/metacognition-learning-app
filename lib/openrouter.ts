import type { ZodType } from "zod";

import type { ChatMessage } from "@/lib/types";

type OpenRouterChoice = {
  message?: { content?: string };
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
};

export type OpenRouterArgs = {
  model: string;
  messages: ChatMessage[];
  jsonMode?: boolean;
  temperature?: number;
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function getOpenRouterHeaders(): Record<string, string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set.");
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
    "X-Title": "Reverse Tutor",
  };
}

function cleanupJSON(raw: string): string {
  return raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

export async function callOpenRouter({
  model,
  messages,
  jsonMode = false,
  temperature = 0.7,
}: OpenRouterArgs): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: getOpenRouterHeaders(),
    body: JSON.stringify({
      model,
      messages,
      temperature,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("OpenRouter response missing message content.");
  }
  return content;
}

export async function callJSONValidated<T>(
  args: OpenRouterArgs,
  schema: ZodType<T>,
  retries = 1,
): Promise<T> {
  let currentArgs = args;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const raw = await callOpenRouter({ ...currentArgs, jsonMode: true });
      const parsed = JSON.parse(cleanupJSON(raw));
      return schema.parse(parsed);
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      currentArgs = {
        ...currentArgs,
        messages: [
          ...currentArgs.messages,
          {
            role: "system",
            content:
              "Your previous response was not valid JSON matching the required schema. Respond with ONLY valid JSON. No markdown, no prose, no comments.",
          },
        ],
      };
    }
  }
  throw new Error("JSON validation retries exhausted.");
}

export async function streamOpenRouter(
  args: OpenRouterArgs,
  onToken: (token: string) => void,
): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: getOpenRouterHeaders(),
    body: JSON.stringify({
      model: args.model,
      messages: args.messages,
      temperature: args.temperature ?? 0.7,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`OpenRouter stream ${res.status}: ${await res.text()}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";
  let lastMessageContent = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    while (true) {
      const delimiterIndex = buffer.indexOf("\n\n");
      if (delimiterIndex === -1) {
        break;
      }

      const eventBlock = buffer.slice(0, delimiterIndex);
      buffer = buffer.slice(delimiterIndex + 2);

      const lines = eventBlock
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice("data:".length).trim());

      for (const line of lines) {
        if (line === "[DONE]") {
          return full;
        }
        let parsed:
          | {
              choices?: Array<{
                delta?: { content?: string };
                message?: { content?: string };
                text?: string;
              }>;
            }
          | undefined;
        try {
          parsed = JSON.parse(line) as {
            choices?: Array<{
              delta?: { content?: string };
              message?: { content?: string };
              text?: string;
            }>;
          };
        } catch {
          continue;
        }

        const choice = parsed.choices?.[0];
        let token = choice?.delta?.content;
        if (typeof token !== "string" || token.length === 0) {
          token = choice?.text;
        }
        if ((typeof token !== "string" || token.length === 0) && choice?.message?.content) {
          const messageContent = choice.message.content;
          if (messageContent.startsWith(lastMessageContent)) {
            token = messageContent.slice(lastMessageContent.length);
          } else {
            token = messageContent;
          }
          lastMessageContent = messageContent;
        }

        if (typeof token === "string" && token.length > 0) {
          full += token;
          onToken(token);
        }
      }
    }
  }

  return full;
}

export function isNoEndpointError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return (
    error.message.includes(" 404:") &&
    error.message.toLowerCase().includes("no endpoints found")
  );
}
