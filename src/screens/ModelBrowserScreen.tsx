import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Switch, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Colors } from '../theme/colors';
import { DeviceProfile, getDeviceProfile } from '../device';
import type { StackScreenProps } from '@react-navigation/stack';
import HeaderBar from '../components/HeaderBar';

type RootStackParamList = {
  ModelBrowser: undefined;
  ModelDetail: { model: ModelItem; device: DeviceProfile };
};

type Props = StackScreenProps<RootStackParamList, 'ModelBrowser'>;

type ModelItem = {
  id: string;
  name: string;
  sizeGB: number;
  supportedAbis: string[]; // model compiled targets
};

const SAMPLE_MODELS: ModelItem[] = [
  { id: 'm1', name: 'Lite Transformer (int8)', sizeGB: 0.6, supportedAbis: ['arm64-v8a', 'arm64'] },
  { id: 'm2', name: 'Large LLM (fp16)', sizeGB: 6.5, supportedAbis: ['arm64-v8a'] },
  { id: 'm3', name: 'Vision Encoder', sizeGB: 1.2, supportedAbis: ['arm64', 'x86_64'] },
  { id: 'm4', name: 'ASR Compact', sizeGB: 0.3, supportedAbis: ['armeabi-v7a', 'arm64-v8a'] },
];

export default function ModelBrowserScreen({ navigation }: Props) {
  const [device, setDevice] = useState<DeviceProfile | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getDeviceProfile();
        setDevice(p);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Device profile error', e);
      }
    })();
  }, []);

  const data = useMemo(() => {
    if (!device) return [] as (ModelItem & { status: Badge })[];
    const assessed = SAMPLE_MODELS.map((m) => ({ ...m, status: assessCompatibility(m, device) }));
    if (showAll) return assessed;
    // Default: only show strictly compatible models
    return assessed.filter((m) => m.status === 'compatible');
  }, [device, showAll]);

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderBar title="Model Browser" />
        <Text style={styles.title}>Model Browser</Text>
        <Text style={styles.meta}>Detecting device capabilities…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="Model Browser" />
      <View style={styles.header}>
        <Text style={styles.title}>Model Browser</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.meta}>Only compatible</Text>
          <Switch value={showAll} onValueChange={setShowAll} thumbColor={showAll ? Colors.primary : Colors.divider} />
          <Text style={styles.meta}>Show all</Text>
        </View>
        <Text style={styles.meta}>
          RAM: {device.totalRamGB} GB • Free Storage: {device.freeStorageGB} GB • ABIs: {device.supportedAbis.join(', ') || 'unknown'}
        </Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>Size: {item.sizeGB} GB • Targets: {item.supportedAbis.join(', ')}</Text>
              <BadgeView status={item.status} />
            </View>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => navigation.navigate('ModelDetail', { model: item, device })}
              accessibilityLabel={`View ${item.name}`}
            >
              <Text style={styles.viewText}>View</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

type Badge = 'compatible' | 'not-recommended' | 'incompatible' | 'oversize-storage';

function assessCompatibility(model: ModelItem, device: DeviceProfile): Badge {
  // Storage check
  if (model.sizeGB > device.freeStorageGB) return 'oversize-storage';
  // Arch check
  const matchesArch = model.supportedAbis.some((a) => device.supportedAbis.includes(a));
  if (!matchesArch) return 'incompatible';
  // RAM heuristic
  if (device.totalRamGB > 0 && model.sizeGB > device.totalRamGB * 0.7) return 'not-recommended';
  return 'compatible';
}

function BadgeView({ status }: { status: Badge }) {
  let text = '';
  let bg = Colors.divider;
  if (status === 'compatible') {
    text = 'Compatible';
    bg = '#16A34A'; // green
  } else if (status === 'not-recommended') {
    text = 'Not Recommended';
    bg = '#DC2626'; // red
  } else if (status === 'incompatible') {
    text = 'Incompatible';
    bg = '#6B7280'; // gray
  } else if (status === 'oversize-storage') {
    text = 'Too Large for Storage';
    bg = '#DC2626';
  }
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 12 },
  title: { color: Colors.primary, fontSize: 22, fontWeight: '800', textAlign: 'center', marginVertical: 8 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  meta: { color: Colors.placeholder, textAlign: 'center', marginTop: 4 },
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
  name: { color: Colors.textPrimary, fontWeight: '800', marginBottom: 4 },
  viewBtn: { borderWidth: 1, borderColor: Colors.secondary, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  viewText: { color: Colors.textPrimary, fontWeight: '700' },
  badge: { alignSelf: 'flex-start', marginTop: 6, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: Colors.textPrimary, fontWeight: '800' },
});
