import React, { useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import type { StackScreenProps } from '@react-navigation/stack';
import { DeviceProfile } from '../device';
import HeaderBar from '../components/HeaderBar';

type ModelItem = {
  id: string;
  name: string;
  sizeGB: number;
  supportedAbis: string[];
};

type RootStackParamList = {
  ModelDetail: { model: ModelItem; device: DeviceProfile };
};

type Props = StackScreenProps<RootStackParamList, 'ModelDetail'>;

export default function ModelDetailScreen({ route }: Props) {
  const { model, device } = route.params;

  const status = useMemo(() => assess(model, device), [model, device]);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="Model Detail" />
      <Text style={styles.title}>{model.name}</Text>
      <View style={styles.card}>
        <Text style={styles.row}>Size: {model.sizeGB} GB</Text>
        <Text style={styles.row}>Targets: {model.supportedAbis.join(', ')}</Text>
        <Text style={styles.row}>Device RAM: {device.totalRamGB} GB</Text>
        <Text style={styles.row}>Free Storage: {device.freeStorageGB} GB</Text>
        <Text style={styles.row}>Device ABIs: {device.supportedAbis.join(', ') || 'unknown'}</Text>
        <View style={[styles.badge, { backgroundColor: badgeColor(status) }]}>
          <Text style={styles.badgeText}>{statusLabel(status)}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

type Badge = 'compatible' | 'not-recommended' | 'incompatible' | 'oversize-storage';

function assess(model: ModelItem, device: DeviceProfile): Badge {
  if (model.sizeGB > device.freeStorageGB) {
    return 'oversize-storage';
  }
  const archOk = model.supportedAbis.some((a) => device.supportedAbis.includes(a));
  if (!archOk) {
    return 'incompatible';
  }
  if (device.totalRamGB > 0 && model.sizeGB > device.totalRamGB * 0.7) {
    return 'not-recommended';
  }
  return 'compatible';
}

function statusLabel(s: Badge) {
  switch (s) {
    case 'compatible':
      return 'Compatible';
    case 'not-recommended':
      return 'Not Recommended';
    case 'incompatible':
      return 'Incompatible';
    case 'oversize-storage':
      return 'Too Large for Storage';
  }
}

function badgeColor(s: Badge) {
  switch (s) {
    case 'compatible':
      return '#16A34A';
    case 'not-recommended':
      return '#DC2626';
    case 'incompatible':
      return '#6B7280';
    case 'oversize-storage':
      return '#DC2626';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  title: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 14,
    padding: 16,
  },
  row: { color: Colors.textPrimary, marginBottom: 8 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: { color: Colors.textPrimary, fontWeight: '800' },
});
