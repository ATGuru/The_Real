import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../theme/colors';
import HeaderBar from '../components/HeaderBar';

export default function MatrixRainScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="Matrix Rain" />
      <View style={styles.center}>
        <Text style={styles.text}>Matrix Rain Effect will go here</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: Colors.primary, fontSize: 20, fontWeight: '700' },
});
