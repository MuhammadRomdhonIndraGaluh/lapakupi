import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StatusBar
} from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES, getCategoryMeta, getCategoriesByType, KONDISI_OPTIONS } from '../constants/categories';
import CustomModal from '../components/CustomModal';
import BrandLogo from '../components/BrandLogo';

const MyProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State untuk Modal Edit
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editTipe, setEditTipe] = useState('barang');
  const [editKondisi, setEditKondisi] = useState('bekas');
  const [editNama, setEditNama] = useState('');
  const [editHarga, setEditHarga] = useState('');
  const [editDeskripsi, setEditDeskripsi] = useState('');
  const [editLokasi, setEditLokasi] = useState('');
  const [editKontak, setEditKontak] = useState('');
  const [editKategori, setEditKategori] = useState('buku');
  const [isUpdating, setIsUpdating] = useState(false);

  // State untuk Custom Dialog Modal
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Batal',
    showCancel: false,
    onConfirm: null,
    onCancel: null,
  });

  const fetchMyProducts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Query berdasarkan sellerId milik user saat ini
      const q = query(
        collection(db, 'products'),
        where('sellerId', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      const items = [];
      snapshot.forEach((docItem) => {
        items.push({ id: docItem.id, ...docItem.data() });
      });

      // Urutkan barang terbaru di atas
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setProducts(items);
    } catch (error) {
      console.log('Error fetch my products:', error);
      setModalConfig({
        visible: true,
        type: 'danger',
        title: 'Gagal Memuat Data',
        message: error.message,
        confirmText: 'Tutup',
        showCancel: false,
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMyProducts();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyProducts();
  };

  // Toggle status Terjual / Tersedia
  const handleToggleSold = (product) => {
    const newStatus = !product.isSold;
    const actionText = newStatus ? 'menandai sebagai Terjual / Selesai' : 'mengaktifkan kembali ke katalog';

    setModalConfig({
      visible: true,
      type: 'info',
      title: 'Ubah Status Item',
      message: `Apakah Anda yakin ingin ${actionText} untuk "${product.namaBarang}"?`,
      confirmText: 'Ya, Ubah',
      cancelText: 'Batal',
      showCancel: true,
      onConfirm: async () => {
        try {
          const productRef = doc(db, 'products', product.id);
          await updateDoc(productRef, {
            isSold: newStatus,
            updatedAt: new Date().toISOString()
          });

          // Update local state
          setProducts((prev) =>
            prev.map((item) =>
              item.id === product.id ? { ...item, isSold: newStatus } : item
            )
          );

          setModalConfig({
            visible: true,
            type: 'success',
            title: 'Status Diperbarui',
            message: `Status "${product.namaBarang}" berhasil diperbarui.`,
            confirmText: 'Selesai',
            showCancel: false,
            onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
          });
        } catch (error) {
          setModalConfig({
            visible: true,
            type: 'danger',
            title: 'Gagal Mengubah Status',
            message: error.message,
            confirmText: 'Tutup',
            showCancel: false,
            onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
          });
        }
      },
      onCancel: () => setModalConfig((prev) => ({ ...prev, visible: false })),
    });
  };

  // Hapus barang
  const handleDelete = (product) => {
    setModalConfig({
      visible: true,
      type: 'danger',
      title: 'Hapus dari Katalog',
      message: `Apakah kamu yakin ingin menghapus "${product.namaBarang}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Sekarang',
      cancelText: 'Batal',
      showCancel: true,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'products', product.id));
          setProducts((prev) => prev.filter((item) => item.id !== product.id));
          setModalConfig({
            visible: true,
            type: 'success',
            title: 'Berhasil Dihapus',
            message: `"${product.namaBarang}" telah berhasil dihapus dari katalog jualanmu.`,
            confirmText: 'Mengerti',
            showCancel: false,
            onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
          });
        } catch (error) {
          setModalConfig({
            visible: true,
            type: 'danger',
            title: 'Gagal Menghapus',
            message: error.message,
            confirmText: 'Tutup',
            showCancel: false,
            onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
          });
        }
      },
      onCancel: () => setModalConfig((prev) => ({ ...prev, visible: false })),
    });
  };

  // Buka Modal Edit
  const openEditModal = (product) => {
    setSelectedProduct(product);
    const itemTipe = product.tipe || (product.kategori?.startsWith('jasa_') ? 'jasa' : 'barang');
    setEditTipe(itemTipe);
    setEditKondisi(product.kondisi || 'bekas');
    setEditNama(product.namaBarang || '');
    setEditHarga(String(product.harga || ''));
    setEditDeskripsi(product.deskripsi || '');
    setEditLokasi(product.lokasi || '');
    setEditKontak(product.kontak || '');
    setEditKategori(product.kategori || (itemTipe === 'jasa' ? 'jasa_ketik' : 'buku'));
    setEditModalVisible(true);
  };

  // Simpan hasil Edit
  const handleSaveEdit = async () => {
    if (!editNama.trim() || !editHarga.toString().trim() || !editDeskripsi.trim() || !editKontak.trim()) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Formulir Belum Lengkap',
        message: 'Mohon lengkapi semua kolom: nama, harga/tarif, deskripsi, dan nomor WhatsApp.',
        confirmText: 'Periksa Formulir',
        showCancel: false,
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    setIsUpdating(true);
    try {
      const productRef = doc(db, 'products', selectedProduct.id);
      const updatedData = {
        tipe: editTipe,
        kondisi: editTipe === 'barang' ? editKondisi : null,
        namaBarang: editNama.trim(),
        harga: Number(editHarga),
        deskripsi: editDeskripsi.trim(),
        lokasi: editLokasi.trim() || 'Sekitar Kampus UPI',
        kontak: editKontak.trim(),
        kategori: editKategori,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(productRef, updatedData);

      setProducts((prev) =>
        prev.map((item) =>
          item.id === selectedProduct.id ? { ...item, ...updatedData } : item
        )
      );

      setIsUpdating(false);
      setEditModalVisible(false);

      setModalConfig({
        visible: true,
        type: 'success',
        title: 'Perubahan Disimpan',
        message: `Informasi "${editNama}" berhasil diperbarui di katalog!`,
        confirmText: 'Selesai',
        showCancel: false,
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    } catch (error) {
      setIsUpdating(false);
      setModalConfig({
        visible: true,
        type: 'danger',
        title: 'Gagal Memperbarui',
        message: error.message,
        confirmText: 'Tutup',
        showCancel: false,
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    }
  };

  const renderProductItem = ({ item }) => {
    const catMeta = getCategoryMeta(item.kategori);
    const isJasa = item.tipe === 'jasa' || item.kategori?.startsWith('jasa_');

    return (
      <View style={[styles.productCard, item.isSold && styles.cardSold]}>
        {/* Gambar Barang / Jasa */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
            style={styles.productImage}
          />
          {item.isSold && (
            <View style={styles.soldOverlay}>
              <Text style={styles.soldOverlayText}>{isJasa ? 'PENUH' : 'TERJUAL'}</Text>
            </View>
          )}
        </View>

        {/* Info Barang */}
        <View style={styles.infoWrapper}>
          <View style={styles.statusRow}>
            {/* Type Badge */}
            <View style={[styles.myProductTypeBadge, isJasa && styles.myProductTypeBadgeJasa]}>
              <Ionicons 
                name={isJasa ? 'construct-outline' : 'cube-outline'} 
                size={11} 
                color={isJasa ? '#1565C0' : '#D32F2F'} 
                style={{ marginRight: 3 }} 
              />
              <Text style={[styles.myProductTypeBadgeText, isJasa && styles.myProductTypeBadgeTextJasa]}>
                {isJasa ? 'Jasa' : 'Barang'}
              </Text>
            </View>

            {/* Condition Badge (Khusus Barang) */}
            {!isJasa && (
              <View style={[styles.badgeKondisi, item.kondisi === 'baru' ? styles.badgeKondisiBaru : styles.badgeKondisiBekas]}>
                <Text style={[styles.badgeKondisiText, item.kondisi === 'baru' ? styles.badgeKondisiBaruText : styles.badgeKondisiBekasText]}>
                  {item.kondisi === 'baru' ? 'Baru' : 'Bekas'}
                </Text>
              </View>
            )}

            {item.isSold ? (
              <View style={[styles.badge, styles.badgeSold]}>
                <Ionicons name="checkmark-done" size={11} color="#757575" />
                <Text style={styles.badgeSoldText}>{isJasa ? 'Penuh' : 'Terjual'}</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgeActive]}>
                <Ionicons name="radio-button-on" size={11} color="#2E7D32" />
                <Text style={styles.badgeActiveText}>Aktif</Text>
              </View>
            )}

            <View style={[styles.myProductCatBadge, isJasa && { backgroundColor: '#E3F2FD' }]}>
              <Ionicons 
                name={catMeta.icon} 
                size={11} 
                color={isJasa ? '#1565C0' : '#D32F2F'} 
                style={{ marginRight: 3 }} 
              />
              <Text style={[styles.myProductCatBadgeText, isJasa && { color: '#1565C0' }]}>{catMeta.name}</Text>
            </View>
          </View>

          <Text style={styles.productTitle} numberOfLines={2}>
            {item.namaBarang}
          </Text>

          <Text style={styles.productPrice}>
            {isJasa ? 'Mulai ' : ''}Rp {Number(item.harga).toLocaleString('id-ID')}
          </Text>

          {item.lokasi ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, marginBottom: 4 }}>
              <Ionicons name="location-outline" size={11} color="#888" style={{ marginRight: 3 }} />
              <Text style={{ fontSize: 11, color: '#777', fontWeight: '500' }} numberOfLines={1}>{item.lokasi}</Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {/* Toggle Terjual */}
            <TouchableOpacity
              style={[styles.btnAction, item.isSold ? styles.btnSoldOff : styles.btnSoldOn]}
              onPress={() => handleToggleSold(item)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.isSold ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
                size={14}
                color={item.isSold ? '#D32F2F' : '#2E7D32'}
              />
              <Text
                style={[
                  styles.btnActionText,
                  { color: item.isSold ? '#D32F2F' : '#2E7D32' }
                ]}
              >
                {item.isSold ? 'Aktifkan' : isJasa ? 'Tandai Penuh' : 'Terjual'}
              </Text>
            </TouchableOpacity>

            {/* Edit */}
            <TouchableOpacity
              style={[styles.btnAction, styles.btnEdit]}
              onPress={() => openEditModal(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={14} color="#1976D2" />
              <Text style={[styles.btnActionText, { color: '#1976D2' }]}>Edit</Text>
            </TouchableOpacity>

            {/* Hapus */}
            <TouchableOpacity
              style={[styles.btnAction, styles.btnDelete]}
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color="#D32F2F" />
              <Text style={[styles.btnActionText, { color: '#D32F2F' }]}>Hapus</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.centerContainer}>
          <View style={{ marginBottom: 16 }}>
            <BrandLogo size={28} showDot={true} />
          </View>
          <ActivityIndicator size="large" color="#D32F2F" />
          <Text style={styles.loadingText}>Memuat katalog kamu...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#D32F2F']}
            />
          }
          ListHeaderComponent={
            <>
              {/* HEADER DENGAN IKON DI ATAS JUDUL - IKUT TER-SCROLL */}
              <View style={styles.pageHeader}>
                <View style={styles.pageHeaderIconCircle}>
                  <Ionicons name="albums-outline" size={26} color="#D32F2F" />
                </View>
                <Text style={styles.pageHeaderTitle}>Katalog Saya</Text>
                <Text style={styles.pageHeaderSubtitle}>Kelola semua barang dan jasa jualan kamu</Text>
              </View>

              {products.length > 0 && (
                <View style={styles.headerInfo}>
                  <Text style={styles.headerCount}>
                    Total <Text style={{ color: '#D32F2F', fontWeight: 'bold' }}>{products.length}</Text> item terdaftar
                  </Text>
                  <TouchableOpacity
                    style={styles.btnHeaderAdd}
                    onPress={() => navigation.navigate('AddProduct')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text style={styles.btnHeaderAddText}>Tambah</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="cube-outline" size={60} color="#D32F2F" />
              </View>
              <Text style={styles.emptyTitle}>Belum Ada Produk atau Jasa</Text>
              <Text style={styles.emptySubtitle}>
                Punya buku, pakaian, makanan/danus, perlengkapan, atau menawarkan keahlian jasa di sekitar UPI?
                Tambahkan sekarang dan mulai bertransaksi!
              </Text>
              <TouchableOpacity
                style={styles.btnAddFirst}
                onPress={() => navigation.navigate('AddProduct')}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.btnAddFirstText}>Tambah Produk / Jasa</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* MODAL EDIT PRODUK */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editTipe === 'jasa' ? 'Edit Layanan Jasa' : 'Edit Data Barang'}
              </Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Pilih Tipe</Text>
              <View style={styles.editTypeRow}>
                <TouchableOpacity
                  style={[styles.editTypeBtn, editTipe === 'barang' && styles.editTypeBtnActive]}
                  onPress={() => {
                    setEditTipe('barang');
                    setEditKategori('buku');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="cube-outline"
                    size={16}
                    color={editTipe === 'barang' ? '#fff' : '#666'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.editTypeText, editTipe === 'barang' && styles.editTypeTextActive]}>
                    Barang
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.editTypeBtn, editTipe === 'jasa' && styles.editTypeBtnActive]}
                  onPress={() => {
                    setEditTipe('jasa');
                    setEditKategori('jasa_ketik');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="construct-outline"
                    size={16}
                    color={editTipe === 'jasa' ? '#fff' : '#666'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.editTypeText, editTipe === 'jasa' && styles.editTypeTextActive]}>
                    Tawarkan Jasa
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Kondisi Barang (Hanya jika Barang) */}
              {editTipe === 'barang' && (
                <>
                  <Text style={styles.label}>Kondisi Barang</Text>
                  <View style={styles.editKondisiRow}>
                    {KONDISI_OPTIONS.map((opt) => {
                      const isSel = editKondisi === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[styles.editKondisiBtn, isSel && styles.editKondisiBtnActive]}
                          onPress={() => setEditKondisi(opt.id)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={opt.id === 'baru' ? 'sparkles-outline' : 'refresh-outline'}
                            size={14}
                            color={isSel ? '#fff' : '#555'}
                            style={{ marginRight: 6 }}
                          />
                          <Text style={[styles.editKondisiText, isSel && styles.editKondisiTextActive]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              <Text style={styles.label}>
                {editTipe === 'jasa' ? 'Judul Layanan / Jasa' : 'Nama Barang'}
              </Text>
              <TextInput
                style={styles.input}
                value={editNama}
                onChangeText={setEditNama}
                placeholder={editTipe === 'jasa' ? 'Contoh: Jasa Pembuatan Website & Aplikasi' : 'Contoh: Jas Almamater UPI Ukuran L'}
              />

              <Text style={styles.label}>
                Kategori {editTipe === 'jasa' ? 'Jasa' : 'Barang'}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {getCategoriesByType(editTipe).map((cat) => {
                  const isSelected = editKategori === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                      onPress={() => setEditKategori(cat.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={15}
                        color={isSelected ? '#fff' : '#666'}
                        style={{ marginRight: 5 }}
                      />
                      <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.label}>
                {editTipe === 'jasa' ? 'Tarif Mulai Dari (Rp)' : 'Harga (Rp)'}
              </Text>
              <TextInput
                style={styles.input}
                value={editHarga}
                onChangeText={setEditHarga}
                keyboardType="numeric"
                placeholder={editTipe === 'jasa' ? 'Tarif jasa (contoh: 25000)' : 'Harga barang (contoh: 50000)'}
              />

              <Text style={styles.label}>
                {editTipe === 'jasa' ? 'Deskripsi Jasa & Ketentuan' : 'Deskripsi Barang'}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editDeskripsi}
                onChangeText={setEditDeskripsi}
                multiline
                numberOfLines={3}
                placeholder={editTipe === 'jasa' ? 'Jelaskan layanan yang ditawarkan, cakupan pengerjaan, dan estimasi waktu...' : 'Jelaskan detail spesifikasi dan kondisi fisik barang...'}
              />

              <Text style={styles.label}>
                {editTipe === 'jasa' ? 'Lokasi / Jangkauan Layanan' : 'Lokasi Barang / Area COD'}
              </Text>
              <TextInput
                style={styles.input}
                value={editLokasi}
                onChangeText={setEditLokasi}
                placeholder={editTipe === 'jasa' ? 'Contoh: Sekitar UPI / Online / Gerlong' : 'Contoh: Gerlong Girang / FPMIPA / Asrama'}
              />

              <Text style={styles.label}>Nomor WhatsApp</Text>
              <TextInput
                style={styles.input}
                value={editKontak}
                onChangeText={setEditKontak}
                keyboardType="phone-pad"
                placeholder="08xxxxxxxxxx"
              />

              <TouchableOpacity
                style={[styles.btnSaveEdit, isUpdating && { opacity: 0.6 }]}
                onPress={handleSaveEdit}
                disabled={isUpdating}
                activeOpacity={0.85}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnSaveEditText}>Simpan Perubahan</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* CUSTOM DIALOG MODAL */}
      <CustomModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        showCancel={modalConfig.showCancel}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  pageHeader: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pageHeaderIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pageHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  pageHeaderSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
    textAlign: 'center',
  },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  listContent: { padding: 16, paddingBottom: 40 },

  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerCount: { fontSize: 14, color: '#555' },
  btnHeaderAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  btnHeaderAddText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Card Barang
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  cardSold: {
    backgroundColor: '#FAFAFA',
    opacity: 0.85,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#eee',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  soldOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOverlayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },

  infoWrapper: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  myProductTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
  },
  myProductTypeBadgeJasa: {
    backgroundColor: '#E3F2FD',
  },
  myProductTypeBadgeText: {
    color: '#D32F2F',
    fontSize: 10,
    fontWeight: 'bold',
  },
  myProductTypeBadgeTextJasa: {
    color: '#1565C0',
  },
  badgeKondisi: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeKondisiBaru: {
    backgroundColor: '#E8F5E9',
  },
  badgeKondisiBekas: {
    backgroundColor: '#FFF8E1',
  },
  badgeKondisiText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeKondisiBaruText: {
    color: '#2E7D32',
  },
  badgeKondisiBekasText: {
    color: '#F57F17',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  badgeActive: {
    backgroundColor: '#E8F5E9',
  },
  badgeActiveText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeSold: {
    backgroundColor: '#EEEEEE',
  },
  badgeSoldText: {
    color: '#757575',
    fontSize: 11,
    fontWeight: 'bold',
  },
  myProductCatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  myProductCatBadgeText: {
    color: '#D32F2F',
    fontSize: 11,
    fontWeight: '600',
  },

  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginTop: 4,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginTop: 2,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  btnSoldOn: {
    backgroundColor: '#E8F5E9',
  },
  btnSoldOff: {
    backgroundColor: '#FFEBEE',
  },
  btnEdit: {
    backgroundColor: '#E3F2FD',
  },
  btnDelete: {
    backgroundColor: '#FFEBEE',
  },
  btnActionText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFEBEE',
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
  btnAddFirst: {
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
  btnAddFirstText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Modal Edit
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  modalCloseBtn: {
    padding: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 6,
    marginTop: 10,
  },
  editTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  editTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingVertical: 10,
    borderRadius: 10,
  },
  editTypeBtnActive: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  editTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  editTypeTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editKondisiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  editKondisiBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingVertical: 9,
    borderRadius: 10,
  },
  editKondisiBtnActive: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  editKondisiText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  editKondisiTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  btnSaveEdit: {
    backgroundColor: '#D32F2F',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  btnSaveEditText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryScroll: {
    paddingVertical: 6,
    gap: 8,
    marginBottom: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  categoryChipSelected: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default MyProductsScreen;
