// Murilo Ferreira Faria Santana e Pedro Zocatelli
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigation.replace('Home'))
      .catch(error => Alert.alert("Erro", error.message));
  };

  return (
    <View style={styles.container}>
      <Text>Email:</Text>
      <TextInput style={styles.input} onChangeText={setEmail} />
      <Text>Senha:</Text>
      <TextInput style={styles.input} secureTextEntry onChangeText={setPassword} />
      <Button title="Entrar" onPress={login} />
      <Text onPress={() => navigation.navigate('Register')}>Criar conta</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 100 },
  input: { borderBottomWidth: 1, marginBottom: 20 }
});
