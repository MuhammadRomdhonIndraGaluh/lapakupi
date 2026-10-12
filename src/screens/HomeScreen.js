import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Dimensions, TextInput, Linking, ScrollView } from 'react-native';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFavorites, toggleFavoriteProduct } from '../utils/favorites';
import { CATEGORIES, SORT_OPTIONS, LISTING_TYPES, getCategoryMeta, getCategoriesByType } from '../constants/categories';
import BrandLogo from '../components/BrandLogo';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width / 2) - 24;

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('terbaru');

  const loadFavoriteIds = async () => {
    const list = await getFavorites();
    setFavoriteIds(list.map((item) => item.id));
  };

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setProducts(data);
    } catch (error) {
      console.log('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    loadFavoriteIds();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProducts();
      loadFavoriteIds();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
    loadFavoriteIds();
  };

  const handleToggleFav = async (item) => {
    const isNowFav = await toggleFavoriteProduct(item);
    setFavoriteIds((prev) => 
      isNowFav ? [...prev, item.id] : prev.filter((id) => id !== item.id)
    );
  };

  // Filter & Sortir produk berdasarkan search, tipe listing (barang/jasa), kategori, dan sort pilihan
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = (p.namaBarang || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Filter berdasarkan Tipe Iklan (Semua | Barang Preloved | Jasa Mahasiswa)
      const itemType = p.tipe || (p.kategori?.startsWith('jasa_') ? 'jasa' : 'barang');
      if (selectedType !== 'all' && itemType !== selectedType) {
        return false;
      }

      if (selectedCategory === 'all') return true;

      if (p.kategori) {
        return p.kategori === selectedCategory;
      }

      // Fallback deteksi cerdas untuk data awal
      const lowerName = (p.namaBarang || '').toLowerCase();
      if (selectedCategory === 'buku') {
        return lowerName.includes('buku') || lowerName.includes('modul') || lowerName.includes('diktat') || lowerName.includes('novel');
      }
      if (selectedCategory === 'fashion') {
        return lowerName.includes('almet') || lowerName.includes('baju') || lowerName.includes('jaket') || lowerName.includes('kaos') || lowerName.includes('sepatu') || lowerName.includes('tas');
      }
      if (selectedCategory === 'gadget') {
        return lowerName.includes('laptop') || lowerName.includes('hp') || lowerName.includes('mouse') || lowerName.includes('keyboard') || lowerName.includes('charger') || lowerName.includes('elektronik');
      }
      if (selectedCategory === 'kos') {
        return lowerName.includes('kipas') || lowerName.includes('kasur') || lowerName.includes('meja') || lowerName.includes('dispenser') || lowerName.includes('rice cooker') || lowerName.includes('kos');
      }
      if (selectedCategory === 'makanan') {
        return lowerName.includes('makan') || lowerName.includes('danus') || lowerName.includes('snack') || lowerName.includes('minum') || lowerName.includes('kue') || lowerName.includes('roti') || lowerName.includes('kuliner');
      }
      if (selectedCategory.startsWith('jasa_')) {
        return lowerName.includes('jasa') || lowerName.includes('ketik') || lowerName.includes('skripsi') || lowerName.includes('desain') || lowerName.includes('tutor') || lowerName.includes('servis');
      }
      if (selectedCategory === 'lainnya') {
        return true;
      }
      return false;
    })
    .sort((a, b) => {
      if (selectedSort === 'termurah') {
        return (Number(a.harga) || 0) - (Number(b.harga) || 0);
      }
      if (selectedSort === 'termahal') {
        return (Number(b.harga) || 0) - (Number(a.harga) || 0);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const renderProduct = ({ item }) => {
    const catMeta = getCategoryMeta(item.kategori);
    const isJasa = item.tipe === 'jasa' || item.kategori?.startsWith('jasa_');

    return (
      <TouchableOpacity 
        style={[styles.card, item.isSold && { opacity: 0.75 }]} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/200' }} style={styles.cardImage} />
          {item.isSold ? (
            <View style={[styles.badge, { backgroundColor: '#424242' }]}>
              <Text style={styles.badgeText}>{isJasa ? 'Selesai' : 'Terjual'}</Text>
            </View>
          ) : isJasa ? (
            <View style={[styles.badge, { backgroundColor: '#1565C0' }]}>
              <Text style={styles.badgeText}>Jasa</Text>
            </View>
          ) : (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.kondisi === 'baru' ? 'Baru' : 'Bekas'}</Text>
            </View>
          )}

          {/* Tombol Simpan Nanti / Bookmark */}
          <TouchableOpacity 
            style={styles.cardHeartBtn}
            activeOpacity={0.7}
            onPress={() => handleToggleFav(item)}
          >
            <Ionicons 
              name={favoriteIds.includes(item.id) ? 'bookmark' : 'bookmark-outline'} 
              size={18} 
              color={favoriteIds.includes(item.id) ? '#D32F2F' : '#444'} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cardContent}>
          <View style={[styles.cardCatBadge, isJasa && { backgroundColor: '#E3F2FD' }]}>
            <Ionicons 
              name={catMeta.icon} 
              size={10} 
              color={isJasa ? '#1565C0' : '#D32F2F'} 
              style={{ marginRight: 3 }} 
            />
            <Text 
              style={[styles.cardCatBadgeText, isJasa && { color: '#1565C0' }]} 
              numberOfLines={1}
            >
              {catMeta.name}
            </Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.namaBarang}</Text>
          <Text style={[styles.cardPrice, item.isSold && { color: '#888' }]}>
            {isJasa ? 'Mulai ' : ''}Rp {Number(item.harga).toLocaleString('id-ID')}
          </Text>
          <View style={styles.sellerRow}>
            <Ionicons name="location-outline" size={12} color="#888" />
            <Text style={styles.sellerText} numberOfLines={1}>
              {item.lokasi ? ` ${item.lokasi}` : ' Sekitaran UPI'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const visibleCategories = selectedType === 'all' 
    ? CATEGORIES 
    : [{ id: 'all', name: 'Semua', icon: 'apps-outline', type: 'all' }, ...getCategoriesByType(selectedType)];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList 
        data={loading ? [] : filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={(!loading && filteredProducts.length > 0) ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D32F2F" />}
        ListHeaderComponent={
          <>
            {/* 1. HEADER (BRAND LOGO, GREETING & ACTION ICONS) */}
            <View style={styles.header}>
              <View>
                <BrandLogo size={24} showDot={true} />
                <Text style={styles.headerGreeting}>
                  Halo, {auth.currentUser?.displayName || 'Teman Kampus'}
                </Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => navigation.navigate('InfoTab')} style={styles.headerBtn} activeOpacity={0.7}>
                  <Ionicons name="information-circle-outline" size={22} color="#D32F2F" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')} style={styles.headerBtn} activeOpacity={0.7}>
                  <Ionicons name="person" size={19} color="#D32F2F" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. BANNER INFORMATIF KAMPUS */}
            <View style={styles.welcomeBanner}>
              <View style={styles.welcomeBannerContent}>
                <View style={styles.welcomePill}>
                  <Ionicons name="school" size={11} color="#D32F2F" style={{ marginRight: 4 }} />
                  <Text style={styles.welcomePillText}>Kampus UPI Bandung</Text>
                </View>
                <Text style={styles.welcomeBannerTitle}>Jual Beli & Jasa Sekitar UPI</Text>
                <Text style={styles.welcomeBannerSub}>
                  Temukan perlengkapan kuliah, kebutuhan kos, dan berbagai jasa di lingkungan kampus.
                </Text>
              </View>
            </View>

            {/* 3. SEARCH BAR */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Cari barang, buku, elektronik, makanan, jasa..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* 4. SEGMENTED LISTING TYPE SELECTOR (SEMUA / BARANG / JASA & LAYANAN) */}
            <View style={styles.typeSegmentContainer}>
              {LISTING_TYPES.map((type) => {
                const isActive = selectedType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.typeSegmentBtn, isActive && styles.typeSegmentBtnActive]}
                    onPress={() => {
                      setSelectedType(type.id);
                      setSelectedCategory('all');
                    }}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={type.icon}
                      size={13}
                      color={isActive ? '#D32F2F' : '#666'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.typeSegmentText, isActive && styles.typeSegmentTextActive]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 5. HORIZONTAL CATEGORY FILTER CHIPS */}
            <View style={styles.categoryBarContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryBarScroll}
              >
                {visibleCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catChip, isSelected && styles.catChipSelected]}
                      onPress={() => setSelectedCategory(cat.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={15}
                        color={isSelected ? '#fff' : '#666'}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.catChipText, isSelected && styles.catChipTextSelected]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 6. SORT & SECTION TITLE ROW (JIKA ADA HASIL PRODUK) */}
            {!loading && filteredProducts.length > 0 && (
              <View style={styles.listHeaderWrapper}>
                <View style={styles.sortRow}>
                  <Text style={styles.resultCountText}>
                    {filteredProducts.length} {selectedType === 'jasa' ? 'layanan' : selectedType === 'barang' ? 'barang' : 'item'} tersedia
                  </Text>
                  <View style={styles.sortButtonGroup}>
                    {SORT_OPTIONS.map((sortOpt) => {
                      const isSortActive = selectedSort === sortOpt.id;
                      return (
                        <TouchableOpacity
                          key={sortOpt.id}
                          style={[styles.sortBtn, isSortActive && styles.sortBtnActive]}
                          onPress={() => setSelectedSort(sortOpt.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={sortOpt.icon}
                            size={12}
                            color={isSortActive ? '#fff' : '#666'}
                            style={{ marginRight: 3 }}
                          />
                          <Text style={[styles.sortBtnText, isSortActive && styles.sortBtnTextActive]}>
                            {sortOpt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <Text style={styles.sectionTitle}>
                  {selectedType === 'jasa'
                    ? 'Layanan & Jasa'
                    : selectedType === 'barang'
                    ? 'Daftar Barang'
                    : selectedCategory === 'all'
                    ? 'Rekomendasi Terkini'
                    : getCategoryMeta(selectedCategory).name}
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <View style={{ marginBottom: 16 }}>
                <BrandLogo size={26} showDot={true} />
              </View>
              <ActivityIndicator size="large" color="#D32F2F" />
              <Text style={styles.loadingText}>Memuat katalog barang & jasa...</Text>
            </View>
          ) : (
            <View style={styles.center}>
              <Ionicons name="search-outline" size={56} color="#bbb" />
              <Text style={styles.emptyText}>Tidak ditemukan</Text>
              <Text style={styles.emptySubtext}>
                {selectedCategory !== 'all' || searchQuery || selectedType !== 'all'
                  ? 'Coba ganti kata kunci pencarian atau reset filter tipe & kategori.'
                  : 'Belum ada barang atau jasa terdaftar di katalog.'}
              </Text>
              {(selectedCategory !== 'all' || searchQuery.length > 0 || selectedType !== 'all') && (
                <TouchableOpacity 
                  style={styles.btnResetFilter} 
                  onPress={() => {
                    setSelectedType('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh-outline" size={16} color="#D32F2F" style={{ marginRight: 6 }} />
                  <Text style={styles.btnResetFilterText}>Reset Filter & Tampilkan Semua</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 15, backgroundColor: '#fff' },
  headerGreeting: { fontSize: 13, color: '#888', marginBottom: 2 },
  headerName: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#F5F5F5', 
    borderWidth: 1,
    borderColor: '#EFEFEF',
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  welcomeBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  welcomeBannerContent: {
    gap: 4,
  },
  welcomePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 2,
  },
  welcomePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D32F2F',
  },
  welcomeBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  welcomeBannerSub: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    marginHorizontal: 16, 
    marginTop: 10,
    marginBottom: 8, 
    paddingHorizontal: 14, 
    height: 46, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#ECEFF1', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 3, 
    elevation: 1 
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },

  // Type Segment Bar
  typeSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  typeSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  typeSegmentBtnActive: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  typeSegmentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  typeSegmentTextActive: {
    color: '#D32F2F',
    fontWeight: '700',
  },

  // Category Bar
  categoryBarContainer: {
    backgroundColor: '#fff',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryBarScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  catChipSelected: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  catChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  catChipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },

  // List Header & Sort Row
  listHeaderWrapper: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultCountText: {
    fontSize: 12,
    color: '#777',
    fontWeight: '500',
  },
  sortButtonGroup: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#EEEEEE',
    padding: 3,
    borderRadius: 10,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },
  sortBtnActive: {
    backgroundColor: '#D32F2F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  sortBtnText: {
    fontSize: 11,
    color: '#555',
    fontWeight: '500',
  },
  sortBtnTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginTop: 4 },

  listContainer: { paddingBottom: 100 },
  row: { justifyContent: 'space-between', paddingHorizontal: 16 },
  card: { backgroundColor: '#fff', width: CARD_WIDTH, borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  imageContainer: { position: 'relative' },
  cardImage: { width: '100%', height: CARD_WIDTH, backgroundColor: '#F5F5F5' },
  badge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#D32F2F', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardHeartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContent: { padding: 12 },
  cardCatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 5,
  },
  cardCatBadgeText: {
    fontSize: 10,
    color: '#D32F2F',
    fontWeight: '600',
  },
  cardTitle: { fontSize: 14, color: '#333', fontWeight: '500', marginBottom: 6, lineHeight: 20, height: 40 },
  cardPrice: { fontSize: 15, color: '#D32F2F', fontWeight: '800', marginBottom: 8 },
  sellerRow: { flexDirection: 'row', alignItems: 'center' },
  sellerText: { fontSize: 11, color: '#888' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, marginTop: 40 },
  loadingText: { marginTop: 15, color: '#888', fontSize: 14 },
  emptyText: { color: '#333', marginTop: 15, fontSize: 16, fontWeight: 'bold' },
  emptySubtext: { color: '#888', marginTop: 6, fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },
  btnResetFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 18,
  },
  btnResetFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D32F2F',
  },
});
export default HomeScreen;
