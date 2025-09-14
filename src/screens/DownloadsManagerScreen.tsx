import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Colors } from '../theme/colors';
import HeaderBar from '../components/HeaderBar';

type Status = 'downloading' | 'paused' | 'complete' | 'canceled';

type DownloadItem = {
  id: string;
  filename: string;
  sizeMB: number;
  progress: number; // 0..1
  status: Status;
};

const initialMock: DownloadItem[] = [
  { id: '1', filename: 'model-lite.gguf', sizeMB: 580, progress: 0.25, status: 'downloading' },
  { id: '2', filename: 'vision-encoder.bin', sizeMB: 1200, progress: 0.9, status: 'downloading' },
  { id: '3', filename: 'asr-compact.tflite', sizeMB: 320, progress: 1, status: 'complete' },
];

export default function DownloadsManagerScreen() {
  const [items, setItems] = useState<DownloadItem[]>(initialMock);
  const tickRef = useRef<NodeJS.Timer | null>(null);

  // Mock progress ticker
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.status !== 'downloading') return it;
          const next = Math.min(1, it.progress + Math.random() * 0.05);
          return { ...it, progress: next, status: next >= 1 ? 'complete' : 'downloading' };
        })
      );
    }, 800);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const ongoing = useMemo(() => items.filter((i) => i.status !== 'complete' && i.status !== 'canceled'), [items]);
  const completed = useMemo(() => items.filter((i) => i.status === 'complete'), [items]);

  const pause = (id: string) => {
    try {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'paused' } : i)));
    } catch (e) {
      Alert.alert('Error', 'Failed to pause download.');
    }
  };
  const resume = (id: string) => {
    try {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'downloading' } : i)));
    } catch (e) {
      Alert.alert('Error', 'Failed to resume download.');
    }
  };
  const cancel = (id: string) => {
    try {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'canceled' } : i)));
    } catch (e) {
      Alert.alert('Error', 'Failed to cancel download.');
    }
  };

  const renderItem = ({ item }: { item: DownloadItem }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.filename}</Text>
        <Text style={styles.meta}>
          {item.sizeMB} MB • {item.status}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.round(item.progress * 100)}%` }]} />
        </View>
      </View>
      <View style={styles.actions}>
        {item.status === 'downloading' && (
          <TouchableOpacity style={[styles.pill, styles.pause]} onPress={() => pause(item.id)} accessibilityLabel={`Pause ${item.filename}`}>
            <Text style={styles.pillText}>Pause</Text>
          </TouchableOpacity>
        )}
        {item.status === 'paused' && (
          <TouchableOpacity style={[styles.pill, styles.resume]} onPress={() => resume(item.id)} accessibilityLabel={`Resume ${item.filename}`}>
            <Text style={styles.pillText}>Resume</Text>
          </TouchableOpacity>
        )}
        {(item.status === 'downloading' || item.status === 'paused') && (
          <TouchableOpacity style={[styles.pill, styles.cancel]} onPress={() => cancel(item.id)} accessibilityLabel={`Cancel ${item.filename}`}>
            <Text style={styles.pillText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="Downloads Manager" />
      <Text style={styles.title}>Downloads Manager</Text>
      <FlatList
        ListHeaderComponent={() => (
          <View>
            <Text style={styles.section}>Ongoing</Text>
          </View>
        )}
        data={ongoing}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12 }}
        ListFooterComponent={() => (
          <View>
            <Text style={styles.section}>Completed</Text>
            {completed.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.filename}</Text>
                  <Text style={styles.meta}>{item.sizeMB} MB • {item.status}</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '100%' }]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { color: Colors.primary, fontSize: 22, fontWeight: '800', textAlign: 'center', marginVertical: 12 },
  section: { color: Colors.textPrimary, fontWeight: '800', marginVertical: 8 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: { color: Colors.textPrimary, fontWeight: '800' },
  meta: { color: Colors.placeholder, marginTop: 4 },
  progressBar: { height: 8, backgroundColor: Colors.divider, borderRadius: 8, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: Colors.secondary },
  actions: { flexDirection: 'row', marginLeft: 8 },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, marginLeft: 6 },
  pillText: { color: Colors.textPrimary, fontWeight: '700' },
  pause: { borderColor: Colors.primary },
  resume: { borderColor: Colors.secondary },
  cancel: { borderColor: '#DC2626' },
});
