//Murilo Ferreira Faria Santana e Pedro Zocatelli
import React, { useEffect, useRef } from 'react';
import { View, Animated, Image, StyleSheet, StatusBar } from 'react-native';

export default function SplashScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Espera + navegação
      setTimeout(() => {
        navigation.replace('Login');
      }, 1000);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0d47a1" barStyle="light-content" />
      <Animated.Image
        source={require('../assets/baixado.png')}
        style={[
          styles.logo,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d47a1', // azul escuro lindo
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
});
