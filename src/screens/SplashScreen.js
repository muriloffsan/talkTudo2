//Murilo Ferreira Faria Santana e Pedro Zocatelli
import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true
    }).start(() => {
      setTimeout(() => {
        navigation.replace('Login');
      }, 1000); 
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/WhatsApp Image 2025-04-22 at 13.39.37.jpeg')}
        style={[styles.logo, { opacity: fadeAnim }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain'
  }
});
