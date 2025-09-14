import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { v4 as uuidv4 } from 'uuid';
import { getConversation, saveConversation, getActiveAssistant, Assistant } from '../memory';
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

  // Load history on mount
  useEffect(() => {
    (async () => {
      const hist = await getConversation('Chatbot');
      // Map to local Message type (id, sender, text)
      setMessages(hist.map(h => ({ id: h.id, sender: (h.sender as 'user' | 'assistant'), text: h.text })));
      const a = await getActiveAssistant();
      setActive(a);
    })();
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const user: Message = { id: uuidv4(), sender: 'user', text: trimmed };
    const personaPrefix = active ? `${active.name} (${active.role})` : 'Assistant';
    const style = active?.personality ? ` — ${active.personality}` : '';
    const bot: Message = { id: uuidv4(), sender: 'assistant', text: `${personaPrefix}${style}: ${trimmed}` };
    setMessages((prev) => [...prev, user, bot]);
    // Persist both messages
    const now = Date.now();
    await saveConversation('Chatbot', { id: user.id, sender: 'user', text: user.text, timestamp: now });
    await saveConversation('Chatbot', { id: bot.id, sender: 'assistant', text: bot.text, timestamp: now + 1 });
    setInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="Chatbot" subtitle={active ? `Active: ${active.name} · ${active.role}` : undefined} />
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.user : styles.assistant]}>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
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
            style={[styles.send, !input.trim() && { opacity: 0.5 }]}
            onPress={sendMessage}
            disabled={!input.trim()}
            accessibilityLabel="Send message"
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 12 },
  bubble: {
    maxWidth: '78%',
    marginVertical: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  user: { alignSelf: 'flex-end', backgroundColor: Colors.secondary },
  assistant: { alignSelf: 'flex-start', backgroundColor: Colors.assistant },
  text: { color: Colors.textPrimary, fontSize: 16 },
  header: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.divider },
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
  send: { backgroundColor: Colors.primary, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16 },
  sendText: { color: Colors.background, fontWeight: '700' },
});
