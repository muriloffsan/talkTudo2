//Murilo Ferreira Faria Santana e Pedro Zocatelli
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Alert 
} from 'react-native';
import { auth, db } from '../../firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState(''); 

  const register = async () => {
    if (!email || !password || !nome) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; 
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        nome,          
        email,
        createdAt: new Date()
      });
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Erro no Cadastro', error.message);
    }
  };

  return (
    <ImageBackground source={require('../assets/fundologin.avif')} style={styles.background}>
      <View style={styles.container}>
        <Image source={require('../assets/WhatsApp Image 2025-04-22 at 13.39.37.jpeg')} style={styles.logo} />

        <TextInput
          placeholder="Nome Completo"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={nome} 
          onChangeText={setNome} 
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={email} 
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#ccc"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={register}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Já tenho uma conta</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: 'center'
  },
  container: {
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    margin: 20,
    borderRadius: 20
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 40,
    resizeMode: 'contain'
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16
  },
  button: {
    backgroundColor: '#6c5ce7',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18
  },
  linkText: {
    color: '#74b9ff',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16
  }
});
