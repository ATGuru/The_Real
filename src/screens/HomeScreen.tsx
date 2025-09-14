import React from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import type { StackScreenProps } from '@react-navigation/stack';
import HeaderBar from '../components/HeaderBar';

type RootStackParamList = {
  Home: undefined;
  Chatbot: undefined;
  MatrixRain: undefined;
  Inception: undefined;
  AgentCreator: undefined;
  MemoryViewer: undefined;
  ModelBrowser: undefined;
  MemorySettings: undefined;
  DownloadsManager: undefined;
  ActiveAssistant: undefined;
};

type Props = StackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="Home" />
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>OMNIX</Text>
      <Text style={styles.subtitle}>Your futuristic AI interface</Text>

      <View style={styles.buttons}>
        <NavButton label="Chatbot" onPress={() => navigation.navigate('Chatbot')} />
        <NavButton label="Matrix Rain" onPress={() => navigation.navigate('MatrixRain')} />
        <NavButton label="Inception" onPress={() => navigation.navigate('Inception')} />
        <NavButton label="Agent Creator" onPress={() => navigation.navigate('AgentCreator')} />
      </View>
    </SafeAreaView>
  );
}

function NavButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
    borderRadius: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 2,
  },
  subtitle: {
    marginTop: 6,
    color: Colors.placeholder,
    fontSize: 14,
    marginBottom: 24,
  },
  buttons: {
    width: '100%',
    marginTop: 8,
  },
  button: {
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: Colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
});
