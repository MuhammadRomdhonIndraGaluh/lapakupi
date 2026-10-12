import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainTabNavigator from './MainTabNavigator';
import AddProductScreen from '../screens/AddProductScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyProductsScreen from '../screens/MyProductsScreen';
import InfoScreen from '../screens/InfoScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Home" 
        component={MainTabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AddProduct" 
        component={AddProductScreen} 
        options={{ 
          title: 'Tambah Barang / Jasa', 
          headerBackTitle: 'Kembali',
          headerTintColor: '#D32F2F',
        }} 
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Profil Saya',
          headerTintColor: '#D32F2F',
        }} 
      />
      <Stack.Screen 
        name="MyProducts" 
        component={MyProductsScreen} 
        options={{ 
          title: 'Katalog Saya',
          headerTintColor: '#D32F2F',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      <Stack.Screen 
        name="Info" 
        component={InfoScreen} 
        options={{ 
          title: 'Pusat Informasi & Panduan',
          headerTintColor: '#D32F2F',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      <Stack.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ 
          title: 'Item Tersimpan',
          headerTintColor: '#D32F2F',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ 
          title: 'Edit Profil Saya',
          headerTintColor: '#D32F2F',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
