import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useServers } from '../context/ServersContext';
import { parseServerAddress, isValidPort } from '../utils/lanBroadcast';
import { SERVER_TYPES } from '../utils/connectionManager';

export default function AddServerScreen({ navigation, route }) {
  const { addServer, updateServer } = useServers();
  const editingServer = route.params?.server;

  const [name, setName] = useState(editingServer?.name || '');
  const [address, setAddress] = useState(editingServer?.host || '');
  const [port, setPort] = useState(editingServer?.port?.toString() || '');
  const [serverType, setServerType] = useState(editingServer?.type || SERVER_TYPES.BEDROCK);
  const [notes, setNotes] = useState(editingServer?.notes || '');

  const defaultPort = serverType === SERVER_TYPES.JAVA ? '25565' : '19132';

  useEffect(() => {
    if (!editingServer) {
      setPort(serverType === SERVER_TYPES.JAVA ? '25565' : '19132');
    }
  }, [serverType]);

  const handleAddressChange = (text) => {
    setAddress(text);
    // Auto-parse port from address if included
    const parsed = parseServerAddress(text);
    if (parsed.port && !port) {
      setPort(parsed.port.toString());
    }
  };

  const handleSave = () => {
    const trimName = name.trim();
    const trimAddress = address.trim();

    if (!trimName) {
      Alert.alert('Missing Name', 'Please enter a server name.');
      return;
    }
    if (!trimAddress) {
      Alert.alert('Missing Address', 'Please enter a server address.');
      return;
    }

    const parsedAddr = parseServerAddress(trimAddress);
    const finalPort = port || defaultPort;

    if (port && !isValidPort(port)) {
      Alert.alert('Invalid Port', 'Port must be between 1 and 65535.');
      return;
    }

    const serverData = {
      name: trimName,
      host: parsedAddr.host || trimAddress,
      port: parseInt(finalPort),
      type: serverType,
      notes: notes.trim(),
    };

    if (editingServer) {
      updateServer(editingServer.id, serverData);
    } else {
      addServer(serverData);
    }

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Server Type Selector */}
        <Text style={styles.sectionLabel}>SERVER TYPE</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeBtn, serverType === SERVER_TYPES.BEDROCK && styles.typeBtnActive]}
            onPress={() => setServerType(SERVER_TYPES.BEDROCK)}
          >
            <Text style={styles.typeIcon}>⛏️</Text>
            <Text style={[styles.typeLabel, serverType === SERVER_TYPES.BEDROCK && styles.typeLabelActive]}>
              Bedrock
            </Text>
            <Text style={styles.typeDesc}>UDP · Port 19132</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeBtn, serverType === SERVER_TYPES.JAVA && styles.typeBtnActive]}
            onPress={() => setServerType(SERVER_TYPES.JAVA)}
          >
            <Text style={styles.typeIcon}>☕</Text>
            <Text style={[styles.typeLabel, serverType === SERVER_TYPES.JAVA && styles.typeLabelActive]}>
              Java
            </Text>
            <Text style={styles.typeDesc}>TCP · Port 25565</Text>
          </TouchableOpacity>
        </View>

        {serverType === SERVER_TYPES.JAVA && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Java Edition requires a valid Java account. Set it up in Settings before connecting.
            </Text>
          </View>
        )}

        {/* Server Name */}
        <Text style={styles.sectionLabel}>SERVER NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="My Awesome Server"
          placeholderTextColor="#3d5a6e"
          value={name}
          onChangeText={setName}
          maxLength={48}
        />

        {/* Server Address */}
        <Text style={styles.sectionLabel}>SERVER ADDRESS</Text>
        <TextInput
          style={styles.input}
          placeholder={serverType === SERVER_TYPES.JAVA ? 'play.example.com' : 'play.example.com'}
          placeholderTextColor="#3d5a6e"
          value={address}
          onChangeText={handleAddressChange}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
        />

        {/* Port */}
        <Text style={styles.sectionLabel}>PORT (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder={defaultPort}
          placeholderTextColor="#3d5a6e"
          value={port}
          onChangeText={setPort}
          keyboardType="number-pad"
          maxLength={5}
        />

        {/* Notes */}
        <Text style={styles.sectionLabel}>NOTES (optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="e.g. Friends server, password: abc123"
          placeholderTextColor="#3d5a6e"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          maxLength={200}
        />

        {/* Save Button */}
        <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={styles.saveWrapper}>
          <LinearGradient
            colors={['#3b82f6', '#2563eb']}
            style={styles.saveBtn}
          >
            <Text style={styles.saveBtnText}>
              {editingServer ? '✓  Save Changes' : '+ Add Server'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1923',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    color: '#7ecfff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 20,
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: '#1a2d3d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a4a5e',
  },
  typeBtnActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#1a2d4a',
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  typeLabel: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 15,
  },
  typeLabelActive: {
    color: '#7ecfff',
  },
  typeDesc: {
    color: '#4a6a7e',
    fontSize: 11,
    marginTop: 2,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#1a2d3d',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2a4a5e',
    gap: 8,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#1a2d3d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a4a5e',
    color: '#ffffff',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  saveWrapper: {
    marginTop: 32,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
  },
  cancelText: {
    color: '#4a6a7e',
    fontSize: 15,
  },
});
