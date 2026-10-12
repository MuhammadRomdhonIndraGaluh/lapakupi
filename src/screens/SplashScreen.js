import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Animated } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { APP_SUBTITLE } from '../constants/branding';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // Animasi muncul halus (fade in & scale)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Cek status sesi auth & transisi ke Login / Home
    const timer = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          navigation.replace('Home');
        } else {
          navigation.replace('Login');
        }
      });
      return () => unsubscribe();
    }, 1700);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image
          source={require('../../assets/images/lapakupi-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>{APP_SUBTITLE}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#D32F2F" />
        <Text style={styles.footerText}>Edisi Kampus UPI Bandung</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 270,
    height: 70,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
    gap: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
    letterSpacing: 0.4,
  },
});

export default SplashScreen;
