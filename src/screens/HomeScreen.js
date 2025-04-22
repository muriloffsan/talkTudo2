// Murilo Ferreira Faria Santana e Pedro Zocatelli
import React from 'react';
import { View, Text, Button } from 'react-native';
import { auth } from '../../firebase';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ marginTop: 100, padding: 20 }}>
      <Text>Bem-vindo ao Talk Tudo 👋</Text>
      <Button title="Sair" onPress={() => {
        auth.signOut();
        navigation.replace('Login');
      }} />
    </View>
  );
}
