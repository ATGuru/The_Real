import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { AppSettings, getAppSettings, saveAppSettings } from '../memory';
import HeaderBar from '../components/HeaderBar';



const styles = StyleSheet.create({
  labelMargin: { color: Colors.primary, fontWeight: '700', marginTop: 16 },
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
  label: { color: Colors.textPrimary, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row' },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  pillIdle: { borderColor: Colors.divider },
  pillActive: { borderColor: Colors.secondary },
  pillText: { color: Colors.textPrimary, fontWeight: '700' },
  input: {
    backgroundColor: Colors.divider,
    color: Colors.textPrimary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: { color: Colors.background, fontWeight: '800' },
});

export default function AppSettingsScreen() {
  const [theme, setTheme] = useState<AppSettings['theme']>('dark');
  const [apiKey, setApiKey] = useState<string>('');
  const [modelPath, setModelPath] = useState<string>('');
  const [miniDexBaseUrl, setMiniDexBaseUrl] = useState<string>('');
  const [miniDexToken, setMiniDexToken] = useState<string>('');
  const [preferMiniDex, setPreferMiniDex] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await getAppSettings();
        setTheme(s.theme || 'dark');
        setApiKey(s.apiFallbackKey || '');
        setModelPath(s.modelPath || '');
        setMiniDexBaseUrl((s as any).miniDexBaseUrl || '');
        setMiniDexToken((s as any).miniDexToken || '');
        setPreferMiniDex(!!(s as any).preferMiniDex);
      } catch (e) {
        console.log('Load app settings error', e);
        Alert.alert('Error', 'Failed to load app settings.');
      }
    })();
  }, []);

  const onSave = async () => {
    if (apiKey && apiKey.trim().length < 10) {
      Alert.alert(
        'Invalid API Key',
        'Please enter a valid API key (min 10 characters) or leave blank.',
      );
      return;
    }
    setSaving(true);
    try {
      const settings: AppSettings = {
        theme,
        apiFallbackKey: apiKey,
        modelPath: modelPath.trim() || undefined,
        miniDexBaseUrl: miniDexBaseUrl.trim() || undefined,
        miniDexToken: miniDexToken.trim() || undefined,
        preferMiniDex,
      };
      await saveAppSettings(settings);
      Alert.alert('Saved', 'App settings updated.');
    } catch (e) {
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
          {themePills(['dark', 'light', 'system'], theme, setTheme)}
        </View>

        <Text style={styles.labelMargin}>Hugging Face Token (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter API key (optional)"
          placeholderTextColor={Colors.placeholder}
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry
          accessibilityLabel="API fallback key"
        />

        <Text style={styles.labelMargin}>Local Model Path (GGUF)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., file:///storage/emulated/0/Download/model.gguf"
          placeholderTextColor={Colors.placeholder}
          value={modelPath}
          onChangeText={setModelPath}
          accessibilityLabel="Local model path"
        />

        <Text style={styles.labelMargin}>MiniDex Base URL</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., http://10.0.2.2:3000 (Android emulator)"
          placeholderTextColor={Colors.placeholder}
          value={miniDexBaseUrl}
          onChangeText={setMiniDexBaseUrl}
          accessibilityLabel="MiniDex base URL"
          autoCapitalize="none"
        />

        <Text style={styles.labelMargin}>MiniDex API Token (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Paste ADMIN_TOKEN if enabled"
          placeholderTextColor={Colors.placeholder}
          value={miniDexToken}
          onChangeText={setMiniDexToken}
          accessibilityLabel="MiniDex API token"
          secureTextEntry
        />

        <Text style={styles.labelMargin}>Prefer MiniDex Backend</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.pill, preferMiniDex ? styles.pillActive : styles.pillIdle]}
            onPress={() => setPreferMiniDex(true)}
            accessibilityLabel="Prefer MiniDex ON"
          >
            <Text style={styles.pillText}>ON</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, !preferMiniDex ? styles.pillActive : styles.pillIdle]}
            onPress={() => setPreferMiniDex(false)}
            accessibilityLabel="Prefer MiniDex OFF"
          >
            <Text style={styles.pillText}>OFF</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={onSave}
        disabled={saving}
      >
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // Move themePills here so styles is available
  function themePills(
    themes: readonly ('dark' | 'light' | 'system')[],
    theme: 'dark' | 'light' | 'system',
    setTheme: React.Dispatch<React.SetStateAction<'dark' | 'light' | 'system'>>
  ) {
    return themes.map((t) => (
      <TouchableOpacity
        key={t}
        style={[styles.pill, theme === t ? styles.pillActive : styles.pillIdle]}
        onPress={() => setTheme(t)}
        accessibilityLabel={`Set ${t} theme`}
      >
        <Text style={styles.pillText}>{t.toUpperCase()}</Text>
      </TouchableOpacity>
    ));
  }

function themePills(themes: readonly string[], theme: string, setTheme: (t: string) => void) {
  return themes.map((t) => (
    <TouchableOpacity
      key={t}
      style={[styles.pill, theme === t ? styles.pillActive : styles.pillIdle]}
      onPress={() => setTheme(t)}
      accessibilityLabel={`Set ${t} theme`}
    >
      <Text style={styles.pillText}>{t.toUpperCase()}</Text>
    </TouchableOpacity>
  ));
}

const styles = StyleSheet.create({
  labelMargin: { color: Colors.primary, fontWeight: '700', marginTop: 16 },
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
  label: { color: Colors.textPrimary, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row' },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  pillIdle: { borderColor: Colors.divider },
  pillActive: { borderColor: Colors.secondary },
  pillText: { color: Colors.textPrimary, fontWeight: '700' },
  input: {
    backgroundColor: Colors.divider,
    color: Colors.textPrimary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: { color: Colors.background, fontWeight: '800' },
});
