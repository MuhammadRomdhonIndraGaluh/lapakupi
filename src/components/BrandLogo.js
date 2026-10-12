import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const LOGO_RATIO = 806 / 203; // ~3.97

/**
 * Reusable Brand Logo Component for lapakupi
 * Menampilkan logo resmi 'lapakupi' (lapak hitam, upi merah) dengan rasio presisi.
 */
const BrandLogo = ({ size = 32, centered = true, style }) => {
  const height = size;
  const width = Math.round(size * LOGO_RATIO);

  return (
    <View style={[styles.container, centered && styles.centered, style]}>
      <Image
        source={require('../../assets/images/lapakupi-logo.png')}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    alignSelf: 'center',
  },
});

export default BrandLogo;
