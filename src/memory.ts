import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveMemory(key: string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value);
  await AsyncStorage.setItem(key, serialized);
}

export async function getMemory<T = unknown>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // If it's not JSON, return the raw string as any
    return raw as unknown as T;
  }
}

export async function getAllMemories(): Promise<Array<{ key: string; value: unknown }>> {
  const keys = await AsyncStorage.getAllKeys();
  if (!keys || keys.length === 0) return [];
  const entries = await AsyncStorage.multiGet(keys);
  return entries.map(([key, raw]) => {
    if (raw == null) return { key, value: null };
    try {
      return { key, value: JSON.parse(raw) };
    } catch {
      return { key, value: raw };
    }
  });
}

export async function deleteMemory(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function getMemoriesByPrefix(prefix: string): Promise<Array<{ key: string; value: unknown }>> {
  const keys = await AsyncStorage.getAllKeys();
  const filtered = keys.filter((k) => k.startsWith(prefix));
  if (filtered.length === 0) return [];
  const entries = await AsyncStorage.multiGet(filtered);
  return entries.map(([key, raw]) => {
    if (raw == null) return { key, value: null };
    try {
      return { key, value: JSON.parse(raw) };
    } catch {
      return { key, value: raw };
    }
  });
}

// Conversation helpers
export type ConversationMessage = {
  id: string;
  sender: string;
  text: string;
  timestamp?: number;
};

function convoKey(name: string) {
  return `conversation:${name}`;
}

export async function getConversation(assistantName: string): Promise<ConversationMessage[]> {
  const raw = await AsyncStorage.getItem(convoKey(assistantName));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ConversationMessage[]) : [];
  } catch {
    return [];
  }
}

// Settings
export type MemorySettings = {
  clearOnExit: boolean;
  keepLastConversations: number; // interpreted as number of messages to keep per assistant
};

const SETTINGS_KEY = 'memory:settings';

export async function getMemorySettings(): Promise<MemorySettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return { clearOnExit: false, keepLastConversations: 0 };
  try {
    const parsed = JSON.parse(raw) as Partial<MemorySettings>;
    return {
      clearOnExit: !!parsed.clearOnExit,
      keepLastConversations: Math.max(0, Number(parsed.keepLastConversations || 0)),
    };
  } catch {
    return { clearOnExit: false, keepLastConversations: 0 };
  }
}

export async function saveMemorySettings(settings: MemorySettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function saveConversation(assistantName: string, message: ConversationMessage): Promise<void> {
  const history = await getConversation(assistantName);
  history.push(message);
  const settings = await getMemorySettings();
  let next = history;
  if (settings.keepLastConversations && settings.keepLastConversations > 0) {
    const n = settings.keepLastConversations;
    next = history.slice(-n);
  }
  await AsyncStorage.setItem(convoKey(assistantName), JSON.stringify(next));
}

export async function getAllConversations(): Promise<Array<{ assistantName: string; messages: ConversationMessage[] }>> {
  const entries = await getMemoriesByPrefix('conversation:');
  return entries.map(({ key, value }) => ({
    assistantName: key.replace(/^conversation:/, ''),
    messages: (Array.isArray(value) ? value : []) as ConversationMessage[],
  }));
}

export async function clearAllConversations(): Promise<void> {
  const convos = await getMemoriesByPrefix('conversation:');
  if (convos.length === 0) return;
  await AsyncStorage.multiRemove(convos.map((c) => c.key));
}

export async function clearAllMemory(): Promise<void> {
  const assistants = await getMemoriesByPrefix('assistant:');
  const conversations = await getMemoriesByPrefix('conversation:');
  const extras = ['assistant:selected'];
  const keys = [...assistants.map((a) => a.key), ...conversations.map((c) => c.key), ...extras];
  if (keys.length > 0) {
    await AsyncStorage.multiRemove(keys);
  }
}

// Call on app exit/start to apply settings
export async function applyExitSettings(): Promise<void> {
  const settings = await getMemorySettings();
  if (settings.clearOnExit) {
    await clearAllConversations();
  }
}

// App-wide settings and helpers
export type AppSettings = {
  theme: 'dark' | 'light' | 'system';
  apiFallbackKey?: string;
};

const APP_SETTINGS_KEY = 'app:settings';

export async function getAppSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(APP_SETTINGS_KEY);
  if (!raw) return { theme: 'dark' };
  try {
    const s = JSON.parse(raw) as Partial<AppSettings>;
    return { theme: (s.theme as any) || 'dark', apiFallbackKey: s.apiFallbackKey };
  } catch {
    return { theme: 'dark' };
  }
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
}

export type Assistant = {
  id: string;
  name: string;
  role: string;
  personality?: string;
  instructions?: string;
  createdAt?: number;
};

export async function getActiveAssistant(): Promise<Assistant | null> {
  const id = await getMemory<string>('assistant:selected');
  if (!id) return null;
  const all = await getMemoriesByPrefix('assistant:');
  const found = all.map((e) => e.value as Assistant).find((a) => a && a.id === id) || null;
  return found;
}
