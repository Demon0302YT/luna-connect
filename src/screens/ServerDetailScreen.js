import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useServers } from '../context/ServersContext';
import {
  CONNECTION_STATUS, connectToServer, disconnectFromServer,
  getConnectionDescription, getConnectionInstructions, getStatusColor,
  SERVER_TYPES,
} from '../utils/connectionManager';

export default function ServerDetailScreen({ route, navigation }) {
  const { server: initialServer } = route.params;
  const { servers, activeConnections, setConnection, javaAccount, updateServer } = useServers();

  // Get live server data
  const server = servers.find(s => s.id === initialServer.id) || initialServer;
  const status = activeConnections[server.id] || CONNECTION_STATUS.IDLE;

  const [log, setLog] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef(null);

  const isJava = server.type === SERVER_TYPES.JAVA;
  const isActive = status === CONNECTION_STATUS.BROADCASTING || status === CONNECTION_STATUS.CONNECTED;
  const isConnecting = status === CONNECTION_STATUS.CONNECTING;

  // Pulse animation when broadcasting
  useEffect(() => {
    if (isActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isActive]);

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLog(prev => [...prev.slice(-49), { msg, type, time, id: Date.now() }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleConnect = async () => {
    if (isJava && !javaAccount) {
      Alert.alert(
        'Java Account Required',
        'You need to add a Java Edition account in Settings before connecting to Java servers.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => navigation.navigate('Settings') },
        ]
      );
      return;
    }

    setConnecting(true);
    setLog([]);
    addLog(`Initiating ${isJava ? 'Java Edition' : 'Bedrock'} tunnel...`, 'info');
    if (isJava) addLog(`Using account: ${javaAccount.username}`, 'info');

    setConnection(server.id, CONNECTION_STATUS.CONNECTING);

    try {
      await connectToServer(server, javaAccount, (newStatus, message) => {
        setConnection(server.id, newStatus);
        addLog(message, newStatus === CONNECTION_STATUS.BROADCASTING ? 'success' : 'info');
      });

      updateServer(server.id, { lastConnected: new Date().toISOString() });
      addLog('✓ Open Minecraft and check the Friends tab!', 'success');
    } catch (err) {
      setConnection(server.id, CONNECTION_STATUS.ERROR);
      addLog(`Error: ${err.message}`, 'error');
    }

    setConnecting(false);
  };

  const handleDisconnect = async () => {
    addLog('Closing tunnel...', 'warn');
    await disconnectFromServer(server.id);
    setConnection(server.id, CONNECTION_STATUS.IDLE);
    addLog('Disconnected.', 'info');
  };

  const statusColor = getStatusColor(status);
  const instructions = getConnectionInstructions(server);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Server Identity Card */}
      <LinearGradient colors={['#162030', '#1a2d3d']} style={styles.serverCard}>
        <View style={styles.serverCardHeader}>
          <Text style={styles.serverIcon}>{isJava ? '☕' : '⛏️'}</Text>
          <View style={styles.serverInfo}>
            <Text style={styles.serverName}>{server.name}</Text>
            <Text style={styles.serverAddress}>{server.host}:{server.port}</Text>
            <Text style={styles.serverTypeBadge}>
              {isJava ? 'Java Edition' : 'Bedrock Edition'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('AddServer', { server })}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {server.notes ? (
          <Text style={styles.serverNotes}>{server.notes}</Text>
        ) : null}

        {/* Java Account */}
        {isJava && (
          <View style={styles.accountRow}>
            <Text style={styles.accountIcon}>👤</Text>
            <Text style={styles.accountText}>
              {javaAccount ? `${javaAccount.username} (Java)` : 'No Java account — add in Settings'}
            </Text>
            {!javaAccount && (
              <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <Text style={styles.accountLink}>Set up →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </LinearGradient>

      {/* Status Orb */}
      <View style={styles.statusSection}>
        <Animated.View style={[styles.orb, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.orbInner, { backgroundColor: statusColor }]} />
          <View style={[styles.orbOuter, { borderColor: statusColor + '44' }]} />
        </Animated.View>
        <Text style={[styles.statusLabel, { color: statusColor }]}>
          {status.toUpperCase().replace('_', ' ')}
        </Text>
        <Text style={styles.statusDesc}>
          {getConnectionDescription(status, server.type)}
        </Text>
      </View>

      {/* Connect / Disconnect Button */}
      <View style={styles.actionSection}>
        {!isActive && !isConnecting ? (
          <TouchableOpacity onPress={handleConnect} activeOpacity={0.85} style={styles.btnWrapper}>
            <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.connectBtn}>
              <Text style={styles.connectBtnText}>⚡  Connect & Broadcast LAN</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : isConnecting ? (
          <View style={[styles.connectBtn, styles.connectingBtn]}>
            <Text style={styles.connectBtnText}>Connecting...</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={handleDisconnect} activeOpacity={0.85} style={styles.btnWrapper}>
            <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.connectBtn}>
              <Text style={styles.connectBtnText}>■  Stop Tunnel</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Instructions */}
      {isActive && (
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📖 How to Join</Text>
          {instructions.map((step, i) => (
            <View key={i} style={styles.instructionRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Connection Log */}
      {log.length > 0 && (
        <View style={styles.logCard}>
          <Text style={styles.logTitle}>Connection Log</Text>
          <ScrollView ref={scrollRef} style={styles.logScroll} nestedScrollEnabled>
            {log.map(entry => (
              <Text
                key={entry.id}
                style={[
                  styles.logLine,
                  entry.type === 'success' && styles.logSuccess,
                  entry.type === 'error' && styles.logError,
                  entry.type === 'warn' && styles.logWarn,
                ]}
              >
                <Text style={styles.logTime}>[{entry.time}] </Text>
                {entry.msg}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}

      {/* How Luna Connect Works */}
      <View style={styles.howItWorksCard}>
        <Text style={styles.howItWorksTitle}>How Luna Connect Works</Text>
        <Text style={styles.howItWorksText}>
          {isJava
            ? 'Luna Connect creates a local proxy that translates between Bedrock and Java Edition protocols. Your Java account authenticates with Mojang, then the tunnel bridges packets — just like Geyser, but client-side.'
            : 'Luna Connect creates a UDP tunnel to the remote Bedrock server and broadcasts it on your local network as a LAN game. Minecraft Bedrock detects it in the Friends tab just like BedrockTogether.'}
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1923' },
  content: { padding: 16, paddingBottom: 50 },

  serverCard: {
    borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#2a4a5e',
  },
  serverCardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  serverIcon: { fontSize: 32, marginRight: 12, marginTop: 2 },
  serverInfo: { flex: 1 },
  serverName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  serverAddress: { color: '#7ecfff', fontSize: 13, marginTop: 2, fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace' },
  serverTypeBadge: {
    marginTop: 6, alignSelf: 'flex-start',
    backgroundColor: '#1e3a4a', color: '#7ecfff',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, fontSize: 11, fontWeight: '600',
    overflow: 'hidden',
  },
  editBtn: { padding: 8 },
  editIcon: { fontSize: 18 },
  serverNotes: { color: '#6b8ea0', fontSize: 13, marginTop: 10, fontStyle: 'italic' },
  accountRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 12, backgroundColor: '#1a3040',
    borderRadius: 8, padding: 10, gap: 8,
  },
  accountIcon: { fontSize: 16 },
  accountText: { color: '#94a3b8', fontSize: 13, flex: 1 },
  accountLink: { color: '#3b82f6', fontSize: 13, fontWeight: '600' },

  statusSection: { alignItems: 'center', marginVertical: 24 },
  orb: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  orbInner: { width: 32, height: 32, borderRadius: 16, position: 'absolute' },
  orbOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, position: 'absolute' },
  statusLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  statusDesc: { color: '#6b8ea0', fontSize: 14, textAlign: 'center' },

  actionSection: { marginBottom: 20 },
  btnWrapper: { borderRadius: 14, overflow: 'hidden' },
  connectBtn: { paddingVertical: 18, alignItems: 'center', borderRadius: 14 },
  connectingBtn: { backgroundColor: '#334155' },
  connectBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },

  instructionsCard: {
    backgroundColor: '#162030', borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#2a4a5e',
  },
  instructionsTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 14 },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  stepNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#3b82f6', justifyContent: 'center',
    alignItems: 'center', marginRight: 10, marginTop: 1,
  },
  stepNumText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  instructionText: { color: '#94a3b8', fontSize: 14, flex: 1, lineHeight: 20 },

  logCard: {
    backgroundColor: '#0a1520', borderRadius: 14, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: '#1e3a4a',
  },
  logTitle: { color: '#4a6a7e', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  logScroll: { maxHeight: 160 },
  logLine: { color: '#94a3b8', fontSize: 12, lineHeight: 18, fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace' },
  logTime: { color: '#3d5a6e' },
  logSuccess: { color: '#4ade80' },
  logError: { color: '#f87171' },
  logWarn: { color: '#fbbf24' },

  howItWorksCard: {
    backgroundColor: '#162030', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#2a4a5e',
  },
  howItWorksTitle: { color: '#7ecfff', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  howItWorksText: { color: '#6b8ea0', fontSize: 13, lineHeight: 20 },
});
