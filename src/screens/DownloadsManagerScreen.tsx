import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import HeaderBar from '../components/HeaderBar';
import { HFDownloader } from '../native/hfDownloader';
import { CATALOG, modelDownloadUrl } from '../services/hf';
import { getAppSettings, saveAppSettings } from '../memory';

type Task = {
  id: number;
  filename: string;
  status: number; // DownloadManager status code
  downloadedBytes: number;
  totalBytes: number;
  localUri?: string | null;
};

export default function DownloadsManagerScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const pollRef = useRef<NodeJS.Timer | null>(null);

  // Poll native DownloadManager for progress on active tasks
  useEffect(() => {
    if (pollRef.current) {
      // clear any previous
      // @ts-ignore
      clearInterval(pollRef.current as any);
      pollRef.current = null;
    }
    const hasActive = tasks.some((t) => !isComplete(t.status) && !isFailed(t.status));
    if (!hasActive) {
      return;
    }
    pollRef.current = setInterval(async () => {
      setTasks(asyncPrevUpdate);
    }, 1000);
    return () => {
      if (pollRef.current) {
        // @ts-ignore
        clearInterval(pollRef.current as any);
        pollRef.current = null;
      }
    };
  }, [tasks]);

  const ongoing = useMemo(() => tasks.filter((t) => !isComplete(t.status)), [tasks]);
  const completed = useMemo(() => tasks.filter((t) => isComplete(t.status)), [tasks]);

  const enqueue = async (repoId: string, filename: string) => {
    try {
      const url = modelDownloadUrl({ id: '', name: filename, sizeGB: 0, repoId, filename });
      const id = await HFDownloader.enqueue(url, filename);
      if (id < 0) {
        Alert.alert('Error', 'Failed to start download.');
        return;
      }
      setTasks((prev) => [
        ...prev,
        { id, filename, status: 1, downloadedBytes: 0, totalBytes: 0 },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to enqueue download.');
    }
  };

  const cancel = async (id: number) => {
    try {
      await HFDownloader.cancel(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 16 } : t)));
    } catch (e) {
      Alert.alert('Error', 'Failed to cancel download.');
    }
  };

  const asyncPrevUpdate = (prev: Task[]): Task[] => {
    // Schedule async queries; return prev immediately and update via setTasks again when done
    prev.filter((t) => !isComplete(t.status) && !isFailed(t.status)).forEach(async (t) => {
      try {
        const res = await HFDownloader.query(t.id);
        setTasks((inner) =>
          inner.map((x) =>
            x.id === t.id
              ? {
                  ...x,
                  status: res.status ?? x.status,
                  totalBytes: typeof res.totalBytes === 'number' ? res.totalBytes : x.totalBytes,
                  downloadedBytes:
                    typeof res.downloadedBytes === 'number' ? res.downloadedBytes : x.downloadedBytes,
                  localUri: res.localUri ?? x.localUri,
                }
              : x,
          ),
        );
      } catch {}
    });
    return prev;
  };

  const useAsModel = async (localUri?: string | null) => {
    if (!localUri) return;
    try {
      const s = await getAppSettings();
      await saveAppSettings({ ...s, modelPath: localUri });
      Alert.alert('Model Set', 'Local model path updated.');
    } catch (e) {
      Alert.alert('Error', 'Failed to update model path.');
    }
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.card}>
      <View style={styles.cardFlex}>
        <Text style={styles.name}>{item.filename}</Text>
        <Text style={styles.meta}>
          {formatSize(item.totalBytes)} {'\u2022'} {statusText(item.status)}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(progress(item.downloadedBytes, item.totalBytes) * 100)}%` },
            ]}
          />
        </View>
      </View>
      <View style={styles.actions}>
        {!isComplete(item.status) && (
          <TouchableOpacity
            style={[styles.pill, styles.cancel]}
            onPress={() => cancel(item.id)}
            accessibilityLabel={`Cancel ${item.filename}`}
          >
            <Text style={styles.pillText}>Cancel</Text>
          </TouchableOpacity>
        )}
        {isComplete(item.status) && !!item.localUri && (
          <TouchableOpacity
            style={[styles.pill, styles.resume]}
            onPress={() => useAsModel(item.localUri)}
            accessibilityLabel={`Use ${item.filename} as model`}
          >
            <Text style={styles.pillText}>Use as Model</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="Downloads Manager" />
      <Text style={styles.title}>Downloads Manager</Text>
      <View style={{ paddingHorizontal: 12 }}>
        <Text style={styles.section}>Catalog</Text>
        {catalogItems(CATALOG, enqueue)}
      </View>
      <FlatList
        ListHeaderComponent={() => (
          <View>
            <Text style={styles.section}>Ongoing</Text>
          </View>
        )}
        data={ongoing}
        renderItem={renderItem}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12 }}
        ListFooterComponent={() => (
          <View>
            <Text style={styles.section}>Completed</Text>
            {completed.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardFlex}>
                  <Text style={styles.name}>{item.filename}</Text>
                  <Text style={styles.meta}>
                    {formatSize(item.totalBytes)} {'\u2022'} {statusText(item.status)}
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '100%' }]} />
                  </View>
                </View>
                {!!item.localUri && (
                  <TouchableOpacity
                    style={[styles.pill, styles.resume]}
                    onPress={() => useAsModel(item.localUri)}
                    accessibilityLabel={`Use ${item.filename} as model`}
                  >
                    <Text style={styles.pillText}>Use as Model</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );

function catalogItems(catalog, enqueue) {
  return catalog.map((m) => (
    <View key={m.id} style={styles.card}>
      <View style={styles.cardFlex}>
        <Text style={styles.name}>{m.name}</Text>
        <Text style={styles.meta}>
          {m.sizeGB} GB {'\u2022'} {m.repoId.split('/')[1]}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.pill, styles.resume]}
        onPress={() => enqueue(m.repoId, m.filename)}
        accessibilityLabel={`Download ${m.name}`}
      >
        <Text style={styles.pillText}>Download</Text>
      </TouchableOpacity>
    </View>
  ));
}

const styles = StyleSheet.create({
  cardFlex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background },
  title: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 12,
  },
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
  progressBar: {
    height: 8,
    backgroundColor: Colors.divider,
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: { height: 8, backgroundColor: Colors.secondary },
  actions: { flexDirection: 'row', marginLeft: 8 },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    marginLeft: 6,
  },
  pillText: { color: Colors.textPrimary, fontWeight: '700' },
  resume: { borderColor: Colors.secondary },
  cancel: { borderColor: '#DC2626' },
});

// Helpers
function statusText(status: number) {
  switch (status) {
    case 1:
      return 'Pending';
    case 2:
      return 'Running';
    case 4:
      return 'Paused';
    case 8:
      return 'Complete';
    case 16:
      return 'Failed/Canceled';
    default:
      return 'Unknown';
  }
}
function isComplete(status: number) {
  return status === 8;
}
function isFailed(status: number) {
  return status === 16;
}
function progress(done: number, total: number) {
  if (!total || total <= 0) return 0;
  return Math.max(0, Math.min(1, done / total));
}
function formatSize(bytes: number) {
  if (!bytes || bytes <= 0) return '—';
  const gb = bytes / (1024 ** 3);
  if (gb >= 0.1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 ** 2);
  return `${mb.toFixed(0)} MB`;
}
