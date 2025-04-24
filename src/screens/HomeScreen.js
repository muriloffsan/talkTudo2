// Murilo Ferreira Faria Santana e Pedro Zocatelli
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../../firebase';

export default function HomeScreen({ navigation }) {
  const user = auth.currentUser;

  const logout = () => {
    auth.signOut();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Talk Tudo 👋</Text>
      <Text style={styles.subtitle}>Usuário: {user?.email}</Text>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd', // Azul claro elegante
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#1e88e5',
    marginBottom: 30
  },
  button: {
    backgroundColor: '#0d47a1',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});