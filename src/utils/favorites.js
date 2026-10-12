import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';

const getStorageKey = () => {
  const uid = auth.currentUser?.uid || 'guest';
  return `@upi_preloved_favorites_${uid}`;
};

// Ambil seluruh daftar barang favorit
export const getFavorites = async () => {
  try {
    const json = await AsyncStorage.getItem(getStorageKey());
    return json != null ? JSON.parse(json) : [];
  } catch (e) {
    console.log('Error getting favorites:', e);
    return [];
  }
};

// Cek apakah produk tertentu ada di favorit
export const isProductFavorite = async (productId) => {
  try {
    const list = await getFavorites();
    return list.some((item) => item.id === productId);
  } catch (e) {
    return false;
  }
};

// Toggle favorit (tambah jika belum ada, hapus jika sudah ada)
export const toggleFavoriteProduct = async (product) => {
  try {
    const list = await getFavorites();
    const exists = list.some((item) => item.id === product.id);

    let updatedList;
    if (exists) {
      updatedList = list.filter((item) => item.id !== product.id);
    } else {
      updatedList = [product, ...list];
    }

    await AsyncStorage.setItem(getStorageKey(), JSON.stringify(updatedList));
    return !exists; // true jika baru ditambahkan, false jika dihapus
  } catch (e) {
    console.log('Error toggling favorite:', e);
    return false;
  }
};
