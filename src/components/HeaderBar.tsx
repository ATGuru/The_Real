import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';

export default function HeaderBar({ title, subtitle }: { title?: string; subtitle?: string }) {
  const navigation = useNavigation<any>();
  const openMenu = () => {
    try {
      navigation.getParent()?.openDrawer?.();
    } catch {}
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity accessibilityLabel="Open menu" onPress={openMenu} style={styles.menuBtn}>
        <View style={styles.bar} />
        <View style={[styles.bar, { width: 18 }]} />
        <View style={[styles.bar, { width: 22 }]} />
      </TouchableOpacity>
      <View style={styles.center}>
        {!!title && <Text style={styles.title}>{title}</Text>}
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.rightSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBtn: { padding: 6, justifyContent: 'center', alignItems: 'flex-start' },
  bar: { height: 2, width: 24, backgroundColor: Colors.textPrimary, marginVertical: 2 },
  center: { flex: 1, alignItems: 'center' },
  title: { color: Colors.primary, fontWeight: '800' },
  subtitle: { color: Colors.placeholder, marginTop: 2 },
  rightSpacer: { width: 24 },
});

