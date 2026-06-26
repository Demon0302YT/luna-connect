import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function EmptyState({ onAdd }) {
  return (
    <View style={styles.container}>
      <Text style={styles.moon}>🌙</Text>
      <Text style={styles.title}>No Servers Yet</Text>
      <Text style={styles.subtitle}>
        Add a Minecraft Bedrock or Java server to get started. Luna Connect will broadcast it as a LAN game on your device.
      </Text>

      <TouchableOpacity onPress={onAdd} activeOpacity={0.85} style={styles.btnWrapper}>
        <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.btn}>
          <Text style={styles.btnText}>+ Add Your First Server</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Quick Tips</Text>
        <Text style={styles.tipItem}>• Bedrock servers use UDP port 19132</Text>
        <Text style={styles.tipItem}>• Java servers use TCP port 25565</Text>
        <Text style={styles.tipItem}>• Java Edition requires a valid account in Settings</Text>
        <Text style={styles.tipItem}>• Long-press a server to edit or delete it</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b8ea0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    maxWidth: 280,
  },
  btnWrapper: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 28,
  },
  btn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  tipCard: {
    backgroundColor: '#162030',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#2a4a5e',
    gap: 6,
  },
  tipTitle: {
    color: '#7ecfff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipItem: {
    color: '#6b8ea0',
    fontSize: 13,
    lineHeight: 20,
  },
});
