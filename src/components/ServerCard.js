import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CONNECTION_STATUS, getStatusColor, SERVER_TYPES } from '../utils/connectionManager';

export default function ServerCard({ server, status, onPress, onLongPress }) {
  const isActive = status === CONNECTION_STATUS.BROADCASTING || status === CONNECTION_STATUS.CONNECTED;
  const isConnecting = status === CONNECTION_STATUS.CONNECTING;
  const statusColor = getStatusColor(status);
  const isJava = server.type === SERVER_TYPES.JAVA;

  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.cardActive]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      {/* Left: Icon */}
      <View style={[styles.iconBg, isActive && styles.iconBgActive]}>
        <Text style={styles.icon}>{isJava ? '☕' : '⛏️'}</Text>
      </View>

      {/* Center: Server Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{server.name}</Text>
        <Text style={styles.address} numberOfLines={1}>
          {server.host}:{server.port}
        </Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, isJava ? styles.javaBadge : styles.bedrockBadge]}>
            <Text style={[styles.badgeText, isJava ? styles.javaText : styles.bedrockText]}>
              {isJava ? 'Java' : 'Bedrock'}
            </Text>
          </View>
          {server.lastConnected && (
            <Text style={styles.lastSeen}>
              Last: {new Date(server.lastConnected).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {/* Right: Status */}
      <View style={styles.statusSection}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        {isConnecting && (
          <Text style={styles.connectingText}>...</Text>
        )}
        {isActive && (
          <Text style={styles.liveText}>LIVE</Text>
        )}
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162030',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a4a5e',
    gap: 12,
  },
  cardActive: {
    borderColor: '#22c55e',
    backgroundColor: '#162a1e',
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1a2d3d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBgActive: {
    backgroundColor: '#1a2d1e',
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  address: {
    color: '#4a6a7e',
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  bedrockBadge: { backgroundColor: '#1e3a1e' },
  javaBadge: { backgroundColor: '#2a1e0a' },
  badgeText: { fontSize: 10, fontWeight: '700' },
  bedrockText: { color: '#4ade80' },
  javaText: { color: '#fbbf24' },
  lastSeen: {
    color: '#3d5a6e',
    fontSize: 10,
  },
  statusSection: {
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  connectingText: {
    color: '#fbbf24',
    fontSize: 11,
  },
  liveText: {
    color: '#4ade80',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  arrow: {
    color: '#2a4a5e',
    fontSize: 22,
    fontWeight: '300',
    marginTop: -2,
  },
});
