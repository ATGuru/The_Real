import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../theme/colors';
import { AppSettings, getAppSettings, saveAppSettings } from '../memory';
import HeaderBar from '../components/HeaderBar';

export default function AppSettingsScreen() {
  const [theme, setTheme] = useState<AppSettings['theme']>('dark');
  const [apiKey, setApiKey] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await getAppSettings();
        setTheme(s.theme || 'dark');
        setApiKey(s.apiFallbackKey || '');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Load app settings error', e);
        Alert.alert('Error', 'Failed to load app settings.');
      }
    })();
  }, []);

  const onSave = async () => {
    if (apiKey && apiKey.trim().length < 10) {
      Alert.alert('Invalid API Key', 'Please enter a valid API key (min 10 characters) or leave blank.');
      return;
    }
    setSaving(true);
    try {
      await saveAppSettings({ theme, apiFallbackKey: apiKey });
      Alert.alert('Saved', 'App settings updated.');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Save app settings error', e);
      Alert.alert('Error', 'Failed to save app settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="App Settings" />
      <Text style={styles.title}>App Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Theme</Text>
        <View style={styles.row}>
          {(['dark', 'light', 'system'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.pill, theme === t ? styles.pillActive : styles.pillIdle]}
              onPress={() => setTheme(t)}
              accessibilityLabel={`Set ${t} theme`}
            >
              <Text style={styles.pillText}>{t.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>API Fallback Key</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter API key (optional)"
          placeholderTextColor={Colors.placeholder}
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry
          accessibilityLabel="API fallback key"
        />
      </View>

      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  title: { color: Colors.primary, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.divider, borderRadius: 14, padding: 16 },
  label: { color: Colors.textPrimary, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row' },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, marginRight: 8 },
  pillIdle: { borderColor: Colors.divider },
  pillActive: { borderColor: Colors.secondary },
  pillText: { color: Colors.textPrimary, fontWeight: '700' },
  input: { backgroundColor: Colors.divider, color: Colors.textPrimary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  saveBtn: { marginTop: 16, backgroundColor: Colors.primary, borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
  saveText: { color: Colors.background, fontWeight: '800' },
});
