// Murilo Ferreira Faria Santana e Pedro Zocatelli
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated
} from 'react-native';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 👇 Animação fade-in
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
  }, []);

  const login = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigation.replace('Home'))
      .catch(error => alert(error.message));
  };

  return (
    <ImageBackground source={require('../assets/fundologin.avif')} style={styles.background}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Image source={require('../assets/baixado.png')} style={styles.logo} />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#ccc"
          style={styles.input}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#ccc"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Criar conta</Text>
        </TouchableOpacity>
      </Animated.View>
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
    width: 250,
    height: 250,
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
    backgroundColor: '#00b894',
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
    color: '#81ecec',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16
  }
});
