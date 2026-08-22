/**
 * =========================================================================
 * LLM — Chatbot (migré depuis le Forge LLM de Manus vers l'API Anthropic Claude)
 * =========================================================================
 * Seule fonctionnalité de ce fichier réellement utilisée par le site :
 * le chatbot d'accueil (server/routers.ts -> ai.chat). Les fonctionnalités
 * avancées du fichier d'origine (tool calling, JSON schema strict, etc.)
 * ont été retirées car non utilisées — ce fichier ne fait plus qu'une
 * chose, simplement.
 *
 * Variable d'environnement nécessaire (Vercel, jamais dans le code) :
 *   ANTHROPIC_API_KEY   (créée sur console.anthropic.com)
 * =========================================================================
 */
import { ENV } from "./env";

export type Role = "system" | "user" | "assistant";

export type Message = {
  role: Role;
  content: string;
};

export type InvokeParams = {
  messages: Message[];
  maxTokens?: number;
  model?: string;
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: "assistant"; content: string };
    finish_reason: string | null;
  }>;
};

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-5";

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const systemMessages = params.messages.filter(m => m.role === "system").map(m => m.content).join("\n\n");
  const conversationMessages = params.messages
    .filter(m => m.role !== "system")
    .map(m => ({ role: m.role, content: m.content }));

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: params.model || DEFAULT_MODEL,
      max_tokens: params.maxTokens || 450,
      system: systemMessages || undefined,
      messages: conversationMessages,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }

  const data = await response.json() as {
    id: string;
    model: string;
    content: Array<{ type: string; text?: string }>;
    stop_reason: string | null;
  };

  const textBlock = data.content.find(block => block.type === "text");

  return {
    id: data.id,
    created: Math.floor(Date.now() / 1000),
    model: data.model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: textBlock?.text ?? "" },
        finish_reason: data.stop_reason,
      },
    ],
  };
}
