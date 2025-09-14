import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { deleteMemory, getAllConversations, getMemoriesByPrefix, saveMemory } from '../memory';
import { TextInput } from 'react-native';
import HeaderBar from '../components/HeaderBar';

type Assistant = {
  id: string;
  name: string;
  role: string;
  personality?: string;
  instructions?: string;
  createdAt?: number;
};

type ConversationPreview = {
  assistantName: string;
  preview: string[]; // last 1-2 lines
};

export default function MemoryViewerScreen() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  const loadAll = async () => {
    try {
      const rawAssistants = await getMemoriesByPrefix('assistant:');
      const asst = rawAssistants
        .map((e) => e.value as Assistant)
        .filter(Boolean)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAssistants(asst);
      const convos = await getAllConversations();
      const previews: ConversationPreview[] = convos.map((c) => {
        const last = c.messages.slice(-2);
        const lines = last.map((m) => `${m.sender}: ${m.text}`);
        return { assistantName: c.assistantName, preview: lines };
      });
      setConversations(previews);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Load memory error', e);
      Alert.alert('Error', 'Failed to load memory.');
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="Memory Viewer" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Memory Viewer</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Assistants</Text>
          {assistants.length === 0 ? (
            <Text style={styles.placeholder}>No assistants saved yet.</Text>
          ) : (
            assistants.map((a) => (
              <View key={a.id} style={styles.row}>
                {editingId === a.id ? (
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={styles.input}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Name"
                      placeholderTextColor={Colors.placeholder}
                    />
                    <TextInput
                      style={[styles.input, { marginTop: 6 }]}
                      value={editRole}
                      onChangeText={setEditRole}
                      placeholder="Role"
                      placeholderTextColor={Colors.placeholder}
                    />
                  </View>
                ) : (
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{a.name || 'Untitled'}</Text>
                    <Text style={styles.meta}>{a.role || 'No role specified'}</Text>
                  </View>
                )}
                <View style={styles.actions}>
                  {editingId === a.id ? (
                    <TouchableOpacity
                      style={[styles.pill, styles.load]}
                      onPress={async () => {
                        const next = { ...a, name: editName.trim(), role: editRole.trim() };
                        await saveMemory(`assistant:${a.id}`, next);
                        setAssistants((prev) => prev.map((x) => (x.id === a.id ? next : x)));
                        setEditingId(null);
                      }}
                    >
                      <Text style={styles.pillText}>Save</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.pill, styles.load]}
                      onPress={() => {
                        setEditingId(a.id);
                        setEditName(a.name || '');
                        setEditRole(a.role || '');
                      }}
                    >
                      <Text style={styles.pillText}>Edit</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.pill, styles.load]}
                    onPress={async () => {
                      await saveMemory('assistant:selected', a.id);
                      Alert.alert('Loaded', `${a.name || 'Assistant'} set active.`);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Load assistant ${a.name}`}
                  >
                    <Text style={styles.pillText}>Load</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.pill, styles.delete]}
                    onPress={async () => {
                      await deleteMemory(`assistant:${a.id}`);
                      setAssistants((prev) => prev.filter((x) => x.id !== a.id));
                      Alert.alert('Deleted', `${a.name || 'Assistant'} removed.`);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete assistant ${a.name}`}
                  >
                    <Text style={styles.pillText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Conversations</Text>
          {conversations.length === 0 ? (
            <Text style={styles.placeholder}>No conversations yet.</Text>
          ) : (
            conversations.map((c) => (
              <View key={c.assistantName} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{c.assistantName}</Text>
                  {c.preview.map((line, idx) => (
                    <Text key={idx} style={styles.meta} numberOfLines={1}>
                      {line}
                    </Text>
                  ))}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.pill, styles.load]}
                    onPress={() => Alert.alert('View', `Open conversation: ${c.assistantName}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`View conversation ${c.assistantName}`}
                  >
                    <Text style={styles.pillText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.pill, styles.delete]}
                    onPress={async () => {
                      await deleteMemory(`conversation:${c.assistantName}`);
                      setConversations((prev) => prev.filter((x) => x.assistantName !== c.assistantName));
                      Alert.alert('Deleted', `Conversation for ${c.assistantName} removed.`);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete conversation ${c.assistantName}`}
                  >
                    <Text style={styles.pillText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 24 },
  title: { color: Colors.primary, fontSize: 24, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  section: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.divider, padding: 12, marginBottom: 16 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  placeholder: { color: Colors.placeholder },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  name: { color: Colors.textPrimary, fontWeight: '700' },
  meta: { color: Colors.placeholder, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginLeft: 8, borderWidth: 1 },
  load: { borderColor: Colors.secondary },
  delete: { borderColor: Colors.primary },
  pillText: { color: Colors.textPrimary, fontWeight: '700' },
});
