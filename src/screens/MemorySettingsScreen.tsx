import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../theme/colors';
import { MemorySettings, getMemorySettings, saveMemorySettings, clearAllMemory } from '../memory';
import HeaderBar from '../components/HeaderBar';

export default function MemorySettingsScreen() {
  const [clearOnExit, setClearOnExit] = useState(false);
  const [keepCount, setKeepCount] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await getMemorySettings();
        setClearOnExit(!!s.clearOnExit);
        setKeepCount(String(s.keepLastConversations || 0));
      } catch (e) {
        console.log('Load memory settings error', e);
        Alert.alert('Error', 'Failed to load memory settings.');
      }
    })();
  }, []);

  const onSave = async () => {
    const n = Math.max(0, Number(keepCount) || 0);
    const settings: MemorySettings = { clearOnExit, keepLastConversations: n };
    setSaving(true);
    try {
      await saveMemorySettings(settings);
      Alert.alert('Saved', 'Memory settings updated.');
    } catch (e) {
      console.log('Save settings error', e);
      Alert.alert('Error', 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const onClearAll = async () => {
    Alert.alert('Confirm', 'Clear all assistants and conversations? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearAllMemory();
            Alert.alert('Cleared', 'All assistants and conversations have been removed.');
          } catch (e) {
            console.log('Clear all error', e);
            Alert.alert('Error', 'Failed to clear memory.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="Memory Settings" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.flex1}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Memory Settings</Text>

          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Clear memory on exit</Text>
                <Text style={styles.hint}>Removes conversations when the app exits.</Text>
              </View>
              <Switch
                value={clearOnExit}
                onValueChange={setClearOnExit}
                thumbColor={clearOnExit ? Colors.primary : Colors.divider}
              />
            </View>

            <View style={styles.rowBetweenMargin}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Keep last X conversations</Text>
                <Text style={styles.hint}>
                  Limits history length per assistant (0 = unlimited).
                </Text>
              </View>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={keepCount}
                onChangeText={setKeepCount}
                placeholder="0"
                placeholderTextColor={Colors.placeholder}
                accessibilityLabel="Keep last X conversations"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={onSave}
            disabled={saving}
            accessibilityLabel="Save memory settings"
          >
            <Text style={styles.saveText}>Save Settings</Text>
          </TouchableOpacity>

          <View style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={onClearAll}
              accessibilityLabel="Clear all memory"
            >
              <Text style={styles.clearText}>Clear All Memory</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rowBetweenMargin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  flex1: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
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
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: Colors.textPrimary, fontWeight: '700' },
  hint: { color: Colors.placeholder, marginTop: 4 },
  input: {
    width: 80,
    backgroundColor: Colors.divider,
    color: Colors.textPrimary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: 'center',
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: { color: Colors.background, fontWeight: '800' },
  dangerCard: {
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  dangerTitle: { color: Colors.textPrimary, fontWeight: '800', marginBottom: 8 },
  clearBtn: {
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  clearText: { color: Colors.textPrimary, fontWeight: '800' },
});
