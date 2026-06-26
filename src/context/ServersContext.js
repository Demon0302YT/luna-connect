import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ServersContext = createContext();

export function ServersProvider({ children }) {
  const [servers, setServers] = useState([]);
  const [activeConnections, setActiveConnections] = useState({});
  const [javaAccount, setJavaAccount] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedServers = await AsyncStorage.getItem('luna_servers');
      const savedAccount = await AsyncStorage.getItem('luna_java_account');
      if (savedServers) setServers(JSON.parse(savedServers));
      if (savedAccount) setJavaAccount(JSON.parse(savedAccount));
    } catch (e) {
      console.log('Error loading data:', e);
    }
  };

  const saveServers = async (newServers) => {
    try {
      await AsyncStorage.setItem('luna_servers', JSON.stringify(newServers));
    } catch (e) {
      console.log('Error saving servers:', e);
    }
  };

  const addServer = (server) => {
    const newServer = {
      ...server,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastConnected: null,
      ping: null,
    };
    const newServers = [...servers, newServer];
    setServers(newServers);
    saveServers(newServers);
    return newServer;
  };

  const updateServer = (id, updates) => {
    const newServers = servers.map(s => s.id === id ? { ...s, ...updates } : s);
    setServers(newServers);
    saveServers(newServers);
  };

  const removeServer = (id) => {
    const newServers = servers.filter(s => s.id !== id);
    setServers(newServers);
    saveServers(newServers);
  };

  const setConnection = (serverId, status) => {
    setActiveConnections(prev => ({ ...prev, [serverId]: status }));
  };

  const saveJavaAccount = async (account) => {
    try {
      await AsyncStorage.setItem('luna_java_account', JSON.stringify(account));
      setJavaAccount(account);
    } catch (e) {
      console.log('Error saving java account:', e);
    }
  };

  const removeJavaAccount = async () => {
    try {
      await AsyncStorage.removeItem('luna_java_account');
      setJavaAccount(null);
    } catch (e) {
      console.log('Error removing java account:', e);
    }
  };

  return (
    <ServersContext.Provider value={{
      servers,
      activeConnections,
      javaAccount,
      addServer,
      updateServer,
      removeServer,
      setConnection,
      saveJavaAccount,
      removeJavaAccount,
    }}>
      {children}
    </ServersContext.Provider>
  );
}

export function useServers() {
  return useContext(ServersContext);
}
