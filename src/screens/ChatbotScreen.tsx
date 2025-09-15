import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../theme/colors';
import { v4 as uuidv4 } from 'uuid';
import { getConversation, saveConversation, getActiveAssistant, Assistant } from '../memory';
import { generateStream, llmInitIfConfigured, llmState } from '../services/llm';
import HeaderBar from '../components/HeaderBar';

type Message = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [active, setActive] = useState<Assistant | null>(null);
  const [loading, setLoading] = useState(false);
  const readyRef = useRef(false);

  // Load history on mount
  useEffect(() => {
    (async () => {
      const hist = await getConversation('Chatbot');
      // Map to local Message type (id, sender, text)
      setMessages(
        hist.map((h) => ({ id: h.id, sender: h.sender as 'user' | 'assistant', text: h.text })),
      );
      const a = await getActiveAssistant();
      setActive(a);
      // Attempt to init LLM if configured
      try {
        const st = await llmInitIfConfigured();
        readyRef.current = st.ready;
      } catch {}
    })();
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }
    const user: Message = { id: uuidv4(), sender: 'user', text: trimmed };
    setMessages((prev) => [...prev, user]);
    setLoading(true);

    // Persist user message
    const now = Date.now();
    await saveConversation('Chatbot', {
      id: user.id,
      sender: 'user',
      text: user.text,
      timestamp: now,
    });

    // Build a simple system prompt from active assistant persona
    const personaPrefix = active ? `${active.name} (${active.role})` : 'Assistant';
    const style = active?.personality ? ` — ${active.personality}` : '';
    const system = active?.instructions
      ? `You are ${personaPrefix}${style}. Follow these instructions: ${active.instructions}`
      : `You are ${personaPrefix}${style}.`;

    const botId = uuidv4();
    let acc = '';
    try {
      await generateStream(
        trimmed,
        { systemPrompt: system, maxTokens: 256, temperature: 0.7 },
        (delta) => {
          acc = delta; // in this polyfill, we get one chunk
          // replace or append assistant message
          setMessages((prev) => {
            const withoutTemp = prev.filter((m) => m.id !== botId);
            return [...withoutTemp, { id: botId, sender: 'assistant', text: acc }];
          });
        },
      );
      await saveConversation('Chatbot', {
        id: botId,
        sender: 'assistant',
        text: acc,
        timestamp: now + 1,
      });
    } catch (e) {
      const fallback = `${personaPrefix}${style}: ${trimmed}`;
      setMessages((prev) => [...prev, { id: botId, sender: 'assistant', text: fallback }]);
      await saveConversation('Chatbot', {
        id: botId,
        sender: 'assistant',
        text: fallback,
        timestamp: now + 1,
      });
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar
        title="Chatbot"
        subtitle={active ? `Active: ${active.name} · ${active.role}` : undefined}
      />
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={item.sender === 'user' ? styles.userBubble : styles.assistantBubble}>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={Colors.placeholder}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            accessibilityLabel="Message input"
          />
          <TouchableOpacity
            style={[styles.send, (!input.trim() || loading) && styles.sendDisabled]}
            disabled={!input.trim() || loading}
            onPress={sendMessage}
            accessibilityLabel="Send message"
          >
            <Text style={styles.sendText}>{loading ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 12 },
  userBubble: {
    maxWidth: '78%',
    marginVertical: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    maxWidth: '78%',
    marginVertical: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    alignSelf: 'flex-start',
  },
  text: { color: Colors.textPrimary, fontSize: 16 },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerText: { color: Colors.placeholder, fontWeight: '700' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.divider,
    color: Colors.textPrimary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  send: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
    sendDisabled: {
      opacity: 0.5,
    },
  sendText: { color: Colors.background, fontWeight: '700' },
});
