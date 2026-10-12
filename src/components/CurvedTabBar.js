import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  useWindowDimensions 
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CurvedTabBar({ state, descriptors, navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const barHeight = 64;
  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 20 : 10);
  const totalHeight = barHeight + bottomInset;

  const topRadius = 24;
  const notchWidth = 84;
  const notchDepth = 30;
  const cx = width / 2;
  const x0 = cx - notchWidth / 2;
  const xM = cx;
  const x1 = cx + notchWidth / 2;

  // 1. Path terbuka KHUSUS kontur / pola atas (dari sudut kiri, lekukan notch, hingga sudut kanan)
  const topPath = [
    `M 0 ${topRadius}`,
    `Q 0 0 ${topRadius} 0`,
    `L ${x0} 0`,
    `C ${x0 + (notchWidth / 2) * 0.45} 0, ${xM - (notchWidth / 2) * 0.35} ${notchDepth}, ${xM} ${notchDepth}`,
    `C ${xM + (notchWidth / 2) * 0.35} ${notchDepth}, ${x1 - (notchWidth / 2) * 0.45} 0, ${x1} 0`,
    `L ${width - topRadius} 0`,
    `Q ${width} 0 ${width} ${topRadius}`,
  ].join(' ');

  // 2. Path tertutup untuk body putih navbar
  const closedPath = [
    topPath,
    `L ${width} ${totalHeight}`,
    `L 0 ${totalHeight}`,
    'Z'
  ].join(' ');

  // Konfigurasi fungsi asli aplikasi LapakUPI:
  // Kiri: Beranda, Katalog | Tengah: Tambah (Floating Button) | Kanan: Informasi, Profil
  const tabConfig = {
    HomeTab: {
      label: 'Beranda',
      iconFocused: 'home',
      iconUnfocused: 'home-outline',
    },
    MyProductsTab: {
      label: 'Katalog',
      iconFocused: 'albums',
      iconUnfocused: 'albums-outline',
    },
    InfoTab: {
      label: 'Informasi',
      iconFocused: 'information-circle',
      iconUnfocused: 'information-circle-outline',
    },
    ProfileTab: {
      label: 'Profil',
      iconFocused: 'person',
      iconUnfocused: 'person-outline',
    },
  };

  const leftRoutes = state.routes.filter(r => r.name === 'HomeTab' || r.name === 'MyProductsTab');
  const rightRoutes = state.routes.filter(r => r.name === 'InfoTab' || r.name === 'ProfileTab');

  const renderTabItem = (route) => {
    const isFocused = state.routes[state.index]?.name === route.name;
    const config = tabConfig[route.name] || {
      label: route.name,
      iconFocused: 'square',
      iconUnfocused: 'square-outline'
    };

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const activeColor = '#D32F2F'; // Warna merah khas LapakUPI
    const inactiveColor = '#8E8E93'; // Warna abu-abu solid saat tidak aktif

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        onPress={onPress}
        style={styles.tabButton}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={isFocused ? config.iconFocused : config.iconUnfocused} 
          size={23} 
          color={isFocused ? activeColor : inactiveColor} 
        />
        <Text style={[
          styles.tabLabel, 
          { color: isFocused ? activeColor : inactiveColor },
          isFocused && styles.tabLabelFocused
        ]}>
          {config.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { height: totalHeight }]} pointerEvents="box-none">
      {/* Background SVG melengkung bersih dan rapi */}
      <View style={styles.svgWrapper} pointerEvents="none">
        <Svg width={width} height={totalHeight} style={styles.svg}>
          {/* Body putih navbar yang menutup bagian bawah secara presisi */}
          <Path d={closedPath} fill="#FFFFFF" />

          {/* Garis batas tipis mengikuti pola lekukan atas */}
          <Path d={topPath} fill="none" stroke="#E5E7EB" strokeWidth={1} />
        </Svg>
      </View>

      {/* Baris Menu Tab */}
      <View style={[styles.tabBarRow, { height: barHeight }]}>
        {/* Kiri: Beranda & Katalog */}
        <View style={styles.sideContainer}>
          {leftRoutes.map(renderTabItem)}
        </View>

        {/* Celah di tengah untuk lekukan floating button */}
        <View style={{ width: notchWidth }} pointerEvents="none" />

        {/* Kanan: Informasi & Profil */}
        <View style={styles.sideContainer}>
          {rightRoutes.map(renderTabItem)}
        </View>
      </View>

      {/* Tombol Tengah Bulat Melayang: Tambah Barang / Jasa */}
      <View style={[styles.centerButtonContainer, { left: cx - 29 }]}>
        <TouchableOpacity
          style={styles.centerButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Ionicons name="add" size={34} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  svgWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'visible',
  },
  svg: {
    overflow: 'visible',
  },
  tabBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  sideContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: -0.2,
  },
  tabLabelFocused: {
    fontWeight: '700',
  },
  centerButtonContainer: {
    position: 'absolute',
    top: -22,
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#D32F2F', // Merah khas LapakUPI
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: '#FFFFFF', // Border putih pemisah lekukan notch
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 8,
  },
});
