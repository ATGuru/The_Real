import { LlamaBridge } from '../native/llamaBridge';
import { getAppSettings } from '../memory';
import { mdChat } from './minidex';

export type GenerateOptions = {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
};

export type LLMState = {
  ready: boolean;
  modelPath?: string;
};

let current: LLMState = { ready: false };

export async function llmInitIfConfigured(): Promise<LLMState> {
  const s = await getAppSettings();
  const path = (s as any).modelPath as string | undefined;
  if (!path) {
    current = { ready: false };
    return current;
  }
  try {
    const ok = await LlamaBridge.loadModel(path);
    current = { ready: !!ok, modelPath: path };
  } catch {
    current = { ready: false };
  }
  return current;
}

export function llmState(): LLMState {
  return current;
}

export async function llmUnload(): Promise<void> {
  try {
    await LlamaBridge.unloadModel();
  } catch {}
  current = { ready: false };
}

export async function generateOnce(prompt: string, opts: GenerateOptions = {}): Promise<string> {
  const s = await getAppSettings();
  const { miniDexBaseUrl, miniDexToken, preferMiniDex } = (s as any) || {};
  // Prepend system prompt if provided
  const full = opts.systemPrompt ? `${opts.systemPrompt}\n\n${prompt}` : prompt;

  if (preferMiniDex && miniDexBaseUrl) {
    return mdChat(miniDexBaseUrl, miniDexToken, full, {
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
    });
  }
  if (!current.ready) {
    // Fallback echo behavior
    return `Assistant: ${prompt}`;
  }
  // Native bridge generate
  return LlamaBridge.generate(full, { maxTokens: opts.maxTokens, temperature: opts.temperature });
}

export async function generateStream(
  prompt: string,
  opts: GenerateOptions,
  onDelta: (chunk: string) => void,
): Promise<void> {
  const s = await getAppSettings();
  const { miniDexBaseUrl, miniDexToken, preferMiniDex } = (s as any) || {};
  const full = opts.systemPrompt ? `${opts.systemPrompt}\n\n${prompt}` : prompt;

  if (preferMiniDex && miniDexBaseUrl) {
    // Non-stream fallback for now. Could add SSE with a polyfill later.
    const text = await mdChat(miniDexBaseUrl, miniDexToken, full, {
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
    });
    onDelta(text);
    return;
  }
  const text = await generateOnce(prompt, opts);
  onDelta(text);
}
