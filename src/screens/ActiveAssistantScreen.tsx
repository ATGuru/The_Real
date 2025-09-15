import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { Colors } from '../theme/colors';
import { getAllMemories, getMemory, saveMemory } from '../memory';
import HeaderBar from '../components/HeaderBar';

type Assistant = {
  id: string;
  name: string;
  role: string;
  personality?: string;
  instructions?: string;
};

export default function ActiveAssistantScreen() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllMemories();
        const list = all
          .filter((m) => m.key.startsWith('assistant:'))
          .map((m) => m.value as Assistant)
          .filter(Boolean);
        setAssistants(list);
        const selected = await getMemory<string>('assistant:selected');
        setActiveId(selected);
      } catch (e) {
        console.log('Load assistants error', e);
        Alert.alert('Error', 'Failed to load assistants.');
      }
    })();
  }, []);

  const active = useMemo(
    () => assistants.find((a) => a.id === activeId) || null,
    [assistants, activeId],
  );

  const setActive = async (id: string) => {
    try {
      await saveMemory('assistant:selected', id);
      setActiveId(id);
      const chosen = assistants.find((a) => a.id === id);
      Alert.alert('Active Assistant', `${chosen?.name || 'Assistant'} is now active.`);
    } catch (e) {
      console.log('Set active error', e);
      Alert.alert('Error', 'Failed to set active assistant.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="Active Assistant" />
      <Text style={styles.title}>Active Assistant</Text>

      {active ? (
        <View style={styles.card}>
          <Text style={styles.name}>{active.name}</Text>
          <Text style={styles.meta}>{active.role}</Text>
          {!!active.personality && (
            <Text style={styles.body}>Personality: {active.personality}</Text>
          )}
          {!!active.instructions && (
            <Text style={styles.body}>Instructions: {active.instructions}</Text>
          )}
          <TouchableOpacity
            style={styles.setBtn}
            onPress={() => setActive(active.id)}
            accessibilityLabel="Set as Active Assistant"
          >
            <Text style={styles.setText}>Set as Active</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.meta}>No active assistant selected.</Text>
        </View>
      )}

      <Text style={[styles.section, styles.marginTop16]}>All Assistants</Text>
      {assistants.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.meta}>No assistants yet. Create one in Agent Creator.</Text>
        </View>
      )}
      <FlatList
        data={assistants}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.paddingHorizontal12}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.name}>{item.name || 'Untitled'}</Text>
              <Text style={styles.meta}>{item.role || 'No role specified'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.pill, item.id === activeId ? styles.pillActive : styles.pillSet]}
              onPress={() => setActive(item.id)}
              accessibilityLabel={`Set ${item.name} as active assistant`}
            >
              <Text style={styles.pillText}>{item.id === activeId ? 'Active' : 'Set Active'}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 12,
  },
  section: { color: Colors.textPrimary, fontWeight: '800', marginHorizontal: 12 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 12,
  },
  name: { color: Colors.textPrimary, fontWeight: '800' },
  meta: { color: Colors.placeholder, marginTop: 4 },
  body: { color: Colors.textPrimary, marginTop: 8 },
  setBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  setText: { color: Colors.background, fontWeight: '800' },
  row: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    marginHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  pillSet: { borderColor: Colors.secondary },
  pillActive: { borderColor: Colors.primary },
  pillText: { color: Colors.textPrimary, fontWeight: '700' },
  marginTop16: { marginTop: 16 },
  paddingHorizontal12: { paddingHorizontal: 12 },
  flex1: { flex: 1 },
});
