import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, SafeAreaView, Alert, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useServers } from '../context/ServersContext';
import ServerCard from '../components/ServerCard';
import EmptyState from '../components/EmptyState';
import { CONNECTION_STATUS } from '../utils/connectionManager';

export default function HomeScreen({ navigation }) {
  const { servers, activeConnections, removeServer } = useServers();

  const handleLongPress = (server) => {
    Alert.alert(
      server.name,
      'What would you like to do?',
      [
        { text: 'Edit', onPress: () => navigation.navigate('AddServer', { server }) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Delete Server', `Remove "${server.name}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => removeServer(server.id) },
            ]);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0f1923', '#162030']}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appName}>🌙 Luna Connect</Text>
            <Text style={styles.appSubtitle}>Minecraft Server Tunnel</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Status bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {Object.values(activeConnections).filter(s => s === CONNECTION_STATUS.BROADCASTING).length > 0
              ? `${Object.values(activeConnections).filter(s => s === CONNECTION_STATUS.BROADCASTING).length} server broadcasting`
              : 'No active tunnels'}
          </Text>
        </View>
      </LinearGradient>

      {/* Server List */}
      <FlatList
        data={servers}
        keyExtractor={item => item.id}
        contentContainerStyle={servers.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={<EmptyState onAdd={() => navigation.navigate('AddServer')} />}
        renderItem={({ item }) => (
          <ServerCard
            server={item}
            status={activeConnections[item.id] || CONNECTION_STATUS.IDLE}
            onPress={() => navigation.navigate('ServerDetail', { server: item })}
            onLongPress={() => handleLongPress(item)}
          />
        )}
      />

      {/* Add Server FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddServer')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1923',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a4a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#7ecfff',
    marginTop: 2,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a2d3d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a4a5e',
  },
  settingsIcon: {
    fontSize: 20,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#1a2d3d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a4a5e',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    marginRight: 8,
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});
