import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { v4 as uuidv4 } from 'uuid';
import { getAllMemories, saveMemory, deleteMemory } from '../memory';
import HeaderBar from '../components/HeaderBar';

type Assistant = {
  id: string;
  name: string;
  role: string;
  personality: string;
  instructions: string;
  createdAt: number;
};

export default function AgentCreatorScreen() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [personality, setPersonality] = useState('');
  const [instructions, setInstructions] = useState('');

  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [saving, setSaving] = useState(false);

  // Load all memories and filter assistant entries
  useEffect(() => {
    const load = async () => {
      try {
        const all = await getAllMemories();
        const items: Assistant[] = all
          .filter((m) => m.key.startsWith('assistant:'))
          .map((m) => m.value as Assistant)
          .filter(Boolean)
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAssistants(items);
      } catch (e) {
        console.log('Failed to load assistants', e);
      }
    };
    load();
  }, []);

  const onSave = async () => {
    const trimmedName = name.trim();
    const trimmedRole = role.trim();
    const trimmedPersonality = personality.trim();
    const trimmedInstructions = instructions.trim();

    // Basic validation: required and unique name
    if (!trimmedName || !trimmedRole) {
      Alert.alert('Missing info', 'Please provide both Name and Role.');
      return;
    }
    const nameExists = assistants.some(
      (a) => (a.name || '').trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    if (nameExists) {
      Alert.alert('Duplicate name', 'An assistant with this name already exists.');
      return;
    }

    const assistant: Assistant = {
      id: uuidv4(),
      name: trimmedName,
      role: trimmedRole,
      personality: trimmedPersonality,
      instructions: trimmedInstructions,
      createdAt: Date.now(),
    };
    setSaving(true);
    try {
      await saveMemory(`assistant:${assistant.id}`, assistant);
      setAssistants((prev) => [assistant, ...prev]);
      setName('');
      setRole('');
      setPersonality('');
      setInstructions('');
      Alert.alert('Saved', 'Assistant saved successfully.');
    } catch (e) {
      console.log('Save error', e);
      Alert.alert('Error', 'Failed to save assistant.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="Agent Creator" />
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.flex1}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Create Your Agent</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor={Colors.placeholder}
                value={name}
                onChangeText={setName}
                accessibilityLabel="Assistant name"
              />

              <Text style={styles.label}>Role / Purpose</Text>
              <TextInput
                style={styles.input}
                placeholder="Role or purpose"
                placeholderTextColor={Colors.placeholder}
                value={role}
                onChangeText={setRole}
                accessibilityLabel="Assistant role or purpose"
              />

              <Text style={styles.label}>Personality / Style</Text>
              <TextInput
                style={styles.input}
                placeholder="Tone, style, traits"
                placeholderTextColor={Colors.placeholder}
                value={personality}
                onChangeText={setPersonality}
                accessibilityLabel="Assistant personality or style"
              />

              <Text style={styles.label}>Special Instructions</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Any specific guidance or constraints"
                placeholderTextColor={Colors.placeholder}
                value={instructions}
                onChangeText={setInstructions}
                multiline
                accessibilityLabel="Special instructions"
              />
            </View>

            <View style={styles.placeholderList}>
              {assistants.length === 0 ? (
                <Text style={styles.placeholderText}>Saved assistants will appear here</Text>
              ) : (
                assistants.map((a) => (
                  <View key={a.id} style={styles.assistantRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.assistantName}>{a.name || 'Untitled'}</Text>
                      <Text style={styles.assistantMeta}>{a.role || 'No role specified'}</Text>
                    </View>
                    <View style={styles.rowActions}>
                      <TouchableOpacity
                        style={[styles.pillButton, styles.loadButton]}
                        onPress={async () => {
                          try {
                            await saveMemory('assistant:selected', a.id);
                            Alert.alert('Loaded', `${a.name || 'Assistant'} is now active.`);
                          } catch (e) {
                            console.log('Load error', e);
                            Alert.alert('Error', 'Failed to load assistant.');
                          }
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Load assistant ${a.name}`}
                        accessibilityHint="Sets this assistant as the active profile"
                      >
                        <Text style={styles.pillText}>Load</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.pillButton, styles.deleteButton]}
                        onPress={async () => {
                          try {
                            await deleteMemory(`assistant:${a.id}`);
                            setAssistants((prev) => prev.filter((x) => x.id !== a.id));
                            Alert.alert('Deleted', `${a.name || 'Assistant'} removed.`);
                          } catch (e) {
                            console.log('Delete error', e);
                            Alert.alert('Error', 'Failed to delete assistant.');
                          }
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete assistant ${a.name}`}
                        accessibilityHint="Removes this assistant profile"
                      >
                        <Text style={styles.pillText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          <View style={styles.footer} accessible accessibilityLabel="Save assistant footer">
            <TouchableOpacity
              style={[styles.cta, saving && { opacity: 0.6 }]}
              onPress={onSave}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Save assistant profile"
              accessibilityHint="Validates and saves the assistant"
            >
              <Text style={styles.ctaText}>Save Assistant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 32 },
  title: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: { color: Colors.textPrimary, marginBottom: 6, marginTop: 6, fontWeight: '600' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  input: {
    backgroundColor: Colors.divider,
    color: Colors.textPrimary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  placeholderList: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  placeholderText: { color: Colors.placeholder },
  assistantRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  assistantName: { color: Colors.textPrimary, fontWeight: '700' },
  assistantMeta: { color: Colors.placeholder, marginTop: 2 },
  rowActions: { flexDirection: 'row', alignItems: 'center' },
  pillButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    borderWidth: 1,
  },
  loadButton: { borderColor: Colors.secondary },
  deleteButton: { borderColor: Colors.primary },
  pillText: { color: Colors.textPrimary, fontWeight: '700' },
  footer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  cta: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: { color: Colors.background, fontWeight: '800' },
});
