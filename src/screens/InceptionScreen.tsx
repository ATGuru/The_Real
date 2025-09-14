import React, { useEffect, useState } from 'react';
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
import HeaderBar from '../components/HeaderBar';

type Message = { id: string; sender: 'user' | 'inception'; text: string };

export default function InceptionScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [active, setActive] = useState<Assistant | null>(null);

  // Load conversation history for Inception assistant
  useEffect(() => {
    (async () => {
      const hist = await getConversation('Inception');
      setMessages(hist.map(h => ({ id: h.id, sender: (h.sender as 'user' | 'inception'), text: h.text })));
      const a = await getActiveAssistant();
      setActive(a);
    })();
  }, []);

  const send = async () => {
    const t = input.trim();
    if (!t) return;
    const user: Message = { id: uuidv4(), sender: 'user', text: t };
    const personaPrefix = active ? `${active.name} (${active.role})` : 'Inception';
    const style = active?.personality ? ` — ${active.personality}` : '';
    const inception: Message = {
      id: uuidv4(),
      sender: 'inception',
      text: `${personaPrefix}${style}: Let\u2019s expand on your spark: ${t}...`,
    };
    setMessages((prev) => [...prev, user, inception]);
    const now = Date.now();
    await saveConversation('Inception', { id: user.id, sender: 'user', text: user.text, timestamp: now });
    await saveConversation('Inception', { id: inception.id, sender: 'inception', text: inception.text, timestamp: now + 1 });
    setInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="Inception" subtitle={active ? `Active: ${active.name} · ${active.role}` : undefined} />
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.user : styles.inception]}>
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
          placeholder="Enter a raw idea (short spark)..."
          placeholderTextColor={Colors.placeholder}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          returnKeyType="send"
          accessibilityLabel="Idea input"
        />
        <TouchableOpacity
          style={[styles.send, !input.trim() && styles.sendDisabled]}
          onPress={send}
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
  inception: { alignSelf: 'flex-start', backgroundColor: Colors.inceptionAssistant },
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
  sendDisabled: { opacity: 0.5 },
  sendText: { color: Colors.background, fontWeight: '700' },
});
