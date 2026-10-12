import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFavorites, toggleFavoriteProduct } from '../utils/favorites';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width / 2) - 24;

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    const list = await getFavorites();
    setFavorites(list);
    setRefreshing(false);
  };

  useEffect(() => {
    loadFavorites();
    const unsubscribe = navigation.addListener('focus', () => {
      loadFavorites();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleRemoveFavorite = async (item) => {
    await toggleFavoriteProduct(item);
    setFavorites((prev) => prev.filter((p) => p.id !== item.id));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, item.isSold && { opacity: 0.75 }]}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/200' }}
          style={styles.cardImage}
        />
        {item.isSold ? (
          <View style={[styles.badge, { backgroundColor: '#424242' }]}>
            <Text style={styles.badgeText}>Terjual</Text>
          </View>
        ) : (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Preloved</Text>
          </View>
        )}

        {/* Tombol Hapus dari Simpanan */}
        <TouchableOpacity
          style={styles.btnHeartActive}
          activeOpacity={0.7}
          onPress={() => handleRemoveFavorite(item)}
        >
          <Ionicons name="bookmark" size={18} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.namaBarang}
        </Text>
        <Text style={[styles.cardPrice, item.isSold && { color: '#888' }]}>
          Rp {Number(item.harga).toLocaleString('id-ID')}
        </Text>
        <View style={styles.sellerRow}>
          <Ionicons name="location-outline" size={12} color="#888" />
          <Text style={styles.sellerText} numberOfLines={1}> Kampus UPI</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bookmark-outline" size={54} color="#D32F2F" />
          </View>
          <Text style={styles.emptyTitle}>Belum Ada Item Tersimpan</Text>
          <Text style={styles.emptySubtitle}>
            Tekan ikon bookmark pada barang atau jasa untuk menyimpannya agar bisa ditinjau nanti.
          </Text>
          <TouchableOpacity
            style={styles.btnExplore}
            onPress={() => navigation.navigate('HomeTab')}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.btnExploreText}>Jelajahi Katalog</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#D32F2F']}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerInfo}>
              <Text style={styles.headerCount}>
                Tersimpan <Text style={{ color: '#D32F2F', fontWeight: 'bold' }}>{favorites.length}</Text> item untuk ditinjau nanti
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  listContainer: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  headerInfo: { marginBottom: 12, paddingHorizontal: 4 },
  headerCount: { fontSize: 13, color: '#666' },

  card: {
    backgroundColor: '#fff',
    width: CARD_WIDTH,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: { position: 'relative' },
  cardImage: { width: '100%', height: CARD_WIDTH, backgroundColor: '#F5F5F5' },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#D32F2F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  btnHeartActive: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  cardContent: { padding: 12 },
  cardTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 6,
    lineHeight: 20,
    height: 40,
  },
  cardPrice: { fontSize: 15, color: '#D32F2F', fontWeight: '800', marginBottom: 8 },
  sellerRow: { flexDirection: 'row', alignItems: 'center' },
  sellerText: { fontSize: 11, color: '#888' },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btnExplore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  btnExploreText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;
