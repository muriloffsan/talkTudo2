// Murilo Ferreira Faria Santana e Pedro Zocatelli
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navigation/StackNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <StackNavigator />
    </NavigationContainer>
  );
}

