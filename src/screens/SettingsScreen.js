import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, TextInput, Linking, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useServers } from '../context/ServersContext';
import { MS_OAUTH_URL, isValidJavaAccount, isTokenExpired } from '../utils/javaAuth';

export default function SettingsScreen({ navigation }) {
  const { javaAccount, saveJavaAccount, removeJavaAccount, servers } = useServers();

  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualUsername, setManualUsername] = useState('');
  const [manualUUID, setManualUUID] = useState('');

  const handleMicrosoftLogin = async () => {
    Alert.alert(
      'Microsoft Login',
      'This will open the Microsoft login page. After logging in, you\'ll be redirected back to Luna Connect.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Browser',
          onPress: () => {
            Linking.openURL(MS_OAUTH_URL).catch(() => {
              Alert.alert('Error', 'Could not open browser. Try manual entry instead.');
            });
          },
        },
      ]
    );
  };

  const handleManualSave = () => {
    const username = manualUsername.trim();
    const uuid = manualUUID.trim();

    if (!username || username.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters.');
      return;
    }

    const account = {
      username,
      uuid: uuid || '00000000-0000-0000-0000-000000000000',
      accessToken: 'manual_entry',
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      isManual: true,
    };

    saveJavaAccount(account);
    setShowManualEntry(false);
    setManualUsername('');
    setManualUUID('');
    Alert.alert('Account Saved', `Java account "${username}" has been saved.`);
  };

  const handleRemoveAccount = () => {
    Alert.alert(
      'Remove Java Account',
      `Remove "${javaAccount?.username}" from Luna Connect?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: removeJavaAccount },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Java Account Section */}
      <Text style={styles.sectionHeader}>JAVA EDITION ACCOUNT</Text>
      <View style={styles.card}>
        {javaAccount ? (
          <>
            <View style={styles.accountRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{javaAccount.username[0].toUpperCase()}</Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{javaAccount.username}</Text>
                <Text style={styles.accountUUID}>{javaAccount.uuid?.slice(0, 18)}...</Text>
                <View style={styles.statusPill}>
                  <View style={[styles.dot, { backgroundColor: isTokenExpired(javaAccount) ? '#f87171' : '#4ade80' }]} />
                  <Text style={styles.statusPillText}>
                    {javaAccount.isManual ? 'Manual Entry' : isTokenExpired(javaAccount) ? 'Token Expired' : 'Active'}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveAccount}>
              <Text style={styles.removeBtnText}>Remove Account</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.noAccountText}>
              No Java account linked. Add one to connect to Java Edition servers.
            </Text>
            <TouchableOpacity style={styles.msBtn} onPress={handleMicrosoftLogin} activeOpacity={0.85}>
              <LinearGradient colors={['#0078d4', '#005fa3']} style={styles.msBtnInner}>
                <Text style={styles.msBtnIcon}>🔑</Text>
                <Text style={styles.msBtnText}>Sign in with Microsoft</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.manualBtn}
              onPress={() => setShowManualEntry(true)}
            >
              <Text style={styles.manualBtnText}>Enter Username Manually</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* App Info */}
      <Text style={styles.sectionHeader}>ABOUT</Text>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App</Text>
          <Text style={styles.infoValue}>Luna Connect</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Servers Saved</Text>
          <Text style={styles.infoValue}>{servers.length}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Protocol Support</Text>
          <Text style={styles.infoValue}>Bedrock + Java</Text>
        </View>
      </View>

      {/* How It Works */}
      <Text style={styles.sectionHeader}>HOW IT WORKS</Text>
      <View style={styles.card}>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>⛏️</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Bedrock Servers</Text>
            <Text style={styles.featureDesc}>
              Luna Connect tunnels to the remote Bedrock server and re-broadcasts it as a local LAN game via UDP on port 19132. Minecraft sees it in the Friends tab.
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>☕</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Java Servers</Text>
            <Text style={styles.featureDesc}>
              Luna Connect bridges the Java edition protocol to Bedrock using a local proxy. Your Java account authenticates with Mojang servers so you appear as a legitimate Java player.
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>🔒</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Privacy & Security</Text>
            <Text style={styles.featureDesc}>
              Your credentials are stored locally on your device only. Luna Connect never sends your data to any external servers.
            </Text>
          </View>
        </View>
      </View>

      {/* Manual Entry Modal */}
      <Modal visible={showManualEntry} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Java Username</Text>
            <Text style={styles.modalDesc}>
              Enter your Minecraft Java Edition username. For full authentication, use the Microsoft login option.
            </Text>

            <Text style={styles.inputLabel}>USERNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="YourMinecraftName"
              placeholderTextColor="#3d5a6e"
              value={manualUsername}
              onChangeText={setManualUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>UUID (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="00000000-0000-0000-0000-000000000000"
              placeholderTextColor="#3d5a6e"
              value={manualUUID}
              onChangeText={setManualUUID}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity onPress={handleManualSave} activeOpacity={0.85} style={styles.saveWrapper}>
              <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowManualEntry(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1923' },
  content: { padding: 16, paddingBottom: 50 },
  sectionHeader: {
    color: '#7ecfff', fontSize: 11, fontWeight: '700',
    letterSpacing: 1.2, marginTop: 24, marginBottom: 10,
  },
  card: {
    backgroundColor: '#162030', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#2a4a5e',
  },
  noAccountText: {
    color: '#6b8ea0', fontSize: 14, lineHeight: 20, marginBottom: 16,
  },
  accountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatarCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#3b82f6', justifyContent: 'center',
    alignItems: 'center', marginRight: 14,
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  accountInfo: { flex: 1 },
  accountName: { color: '#fff', fontSize: 17, fontWeight: '700' },
  accountUUID: { color: '#4a6a7e', fontSize: 11, marginTop: 2, fontFamily: 'monospace' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 6, alignSelf: 'flex-start',
    backgroundColor: '#1a2d3d', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusPillText: { color: '#94a3b8', fontSize: 11 },
  removeBtn: {
    borderWidth: 1, borderColor: '#f87171', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  removeBtnText: { color: '#f87171', fontSize: 14, fontWeight: '600' },
  msBtn: { borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  msBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 10 },
  msBtnIcon: { fontSize: 18 },
  msBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  manualBtn: { alignItems: 'center', padding: 12 },
  manualBtnText: { color: '#4a6a7e', fontSize: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { color: '#6b8ea0', fontSize: 14 },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#1e3a4a' },
  featureRow: { flexDirection: 'row', paddingVertical: 12, gap: 12 },
  featureIcon: { fontSize: 24, marginTop: 2 },
  featureText: { flex: 1 },
  featureTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  featureDesc: { color: '#6b8ea0', fontSize: 13, lineHeight: 19 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#0f1923', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 1, borderColor: '#2a4a5e',
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  modalDesc: { color: '#6b8ea0', fontSize: 14, lineHeight: 20, marginBottom: 20 },
  inputLabel: { color: '#7ecfff', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#1a2d3d', borderRadius: 12, borderWidth: 1,
    borderColor: '#2a4a5e', color: '#ffffff', fontSize: 15,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  saveWrapper: { marginTop: 24, borderRadius: 14, overflow: 'hidden' },
  saveBtn: { paddingVertical: 15, alignItems: 'center', borderRadius: 14 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalCancel: { alignItems: 'center', padding: 14 },
  modalCancelText: { color: '#4a6a7e', fontSize: 14 },
});
