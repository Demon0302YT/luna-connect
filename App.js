import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import AddServerScreen from './src/screens/AddServerScreen';
import ServerDetailScreen from './src/screens/ServerDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ServersProvider } from './src/context/ServersContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ServersProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#0f1923' },
            headerTintColor: '#7ecfff',
            headerTitleStyle: { fontWeight: 'bold', color: '#ffffff' },
            contentStyle: { backgroundColor: '#0f1923' },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddServer"
            component={AddServerScreen}
            options={{ title: 'Add Server' }}
          />
          <Stack.Screen
            name="ServerDetail"
            component={ServerDetailScreen}
            options={{ title: 'Server' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ServersProvider>
  );
}
