//Murilo Ferreira Faria Santana e Pedro Zocatelli
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ProfileScreen({ navigation }) {
  const user = auth.currentUser;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setEmail(data.email);
        setName(data.name);
        setCreatedAt(data.createdAt.toDate().toLocaleDateString());
      }
    };
    fetchUser();
  }, []);

  const updateProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), { name });
      Alert.alert("Perfil atualizado!");
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  const logout = () => {
    auth.signOut().then(() => navigation.replace('Login'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.text}>{email}</Text>

      <Text style={styles.label}>Nome:</Text>
      <TextInput
        style={styles.input}
        value={name}
        placeholder="Digite seu nome"
        onChangeText={setName}
      />

      <Text style={styles.label}>Membro desde:</Text>
      <Text style={styles.text}>{createdAt}</Text>

      <TouchableOpacity style={styles.button} onPress={updateProfile}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginTop: 80
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginBottom: 20
  },
  label: {
    color: '#555',
    fontSize: 16,
    marginTop: 15
  },
  text: {
    fontSize: 16,
    color: '#000'
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#0d47a1',
    fontSize: 16,
    paddingVertical: 5,
    marginTop: 5
  },
  button: {
    marginTop: 30,
    backgroundColor: '#0d47a1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  logout: {
    marginTop: 20,
    alignItems: 'center'
  },
  logoutText: {
    color: '#b71c1c',
    fontSize: 16
  }
});
