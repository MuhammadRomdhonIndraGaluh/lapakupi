import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Linking, 
  Dimensions,
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isProductFavorite, toggleFavoriteProduct } from '../utils/favorites';
import { getCategoryMeta } from '../constants/categories';
import CustomModal from '../components/CustomModal';

const { width, height } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [isFav, setIsFav] = useState(false);
  const [sellerData, setSellerData] = useState(null);
  const [sellerModalVisible, setSellerModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const categoryMeta = getCategoryMeta(product.kategori);

  useEffect(() => {
    isProductFavorite(product.id).then(setIsFav);

    // Ambil data profil penjual dari Firestore
    if (product.sellerId) {
      const fetchSeller = async () => {
        try {
          const sellerRef = doc(db, 'users', product.sellerId);
          const snap = await getDoc(sellerRef);
          if (snap.exists()) {
            setSellerData(snap.data());
          }
        } catch (err) {
          console.log('Error fetch seller:', err);
        }
      };
      fetchSeller();
    }
  }, [product.id, product.sellerId]);

  const handleToggleFav = async () => {
    const updated = await toggleFavoriteProduct(product);
    setIsFav(updated);
  };

  const isJasa = product.tipe === 'jasa' || product.kategori?.startsWith('jasa_');

  const handleContact = () => {
    // Prioritaskan nomor kontak spesifik dari barang/jasa yang diunggah
    const contactNumber = product.kontak || sellerData?.noWa;
    if (!contactNumber) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Kontak Tidak Tersedia',
        message: 'Penjual belum mencantumkan nomor kontak WhatsApp untuk barang/jasa ini.',
      });
      return;
    }
    
    let phone = String(contactNumber).replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    } else if (phone.startsWith('8')) {
      phone = '62' + phone;
    }

    const hargaFormatted = Number(product.harga || 0).toLocaleString('id-ID');
    const message = isJasa
      ? `Halo, saya tertarik dengan jasa "${product.namaBarang}" (Mulai Rp ${hargaFormatted}) yang Anda cantumkan di katalog kampus UPI. Apakah layanan ini masih tersedia?`
      : `Halo, saya tertarik ingin membeli barang "${product.namaBarang}" (Rp ${hargaFormatted}) yang Anda cantumkan di katalog kampus UPI. Apakah barangnya masih ada?`;
    
    const appUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    const webUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(appUrl).then((supported) => {
      if (supported) {
        Linking.openURL(appUrl);
      } else {
        Linking.openURL(webUrl).catch(() => {
          setModalConfig({
            visible: true,
            type: 'warning',
            title: 'WhatsApp Tidak Ditemukan',
            message: 'Aplikasi WhatsApp tidak dapat dibuka di perangkat ini.',
          });
        });
      }
    });
  };

  const isOwner = auth.currentUser?.uid === product.sellerId;
  const sellerDisplayName = sellerData?.nama || 'Mahasiswa UPI';

  return (
    <View style={styles.container}>
      {/* FLOATING BACK BUTTON */}
      <TouchableOpacity 
        style={styles.backBtn} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* FLOATING BOOKMARK BUTTON (SIMPAN NANTI) */}
      <TouchableOpacity 
        style={styles.favBtn} 
        onPress={handleToggleFav}
        activeOpacity={0.8}
      >
        <Ionicons name={isFav ? "bookmark" : "bookmark-outline"} size={22} color={isFav ? "#D32F2F" : "#333"} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* HERO IMAGE */}
        <Image source={{ uri: product.imageUrl || 'https://via.placeholder.com/400' }} style={styles.image} />
        
        {/* CONTENT CARD */}
        <View style={styles.contentCard}>
          {/* BADGE TIPE, KATEGORI & KONDISI */}
          <View style={styles.categoryBadgeRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <View style={[styles.typeBadge, isJasa && styles.typeBadgeJasa]}>
                <Ionicons 
                  name={isJasa ? 'construct-outline' : 'cube-outline'} 
                  size={12} 
                  color={isJasa ? '#1565C0' : '#D32F2F'} 
                  style={{ marginRight: 4 }} 
                />
                <Text style={[styles.typeBadgeText, isJasa && styles.typeBadgeTextJasa]}>
                  {isJasa ? 'Jasa & Layanan' : 'Barang'}
                </Text>
              </View>

              <View style={styles.categoryBadge}>
                <Ionicons name={categoryMeta.icon} size={13} color="#D32F2F" style={{ marginRight: 4 }} />
                <Text style={styles.categoryBadgeText}>{categoryMeta.name}</Text>
              </View>

              {!isJasa && product.kondisi && (
                <View style={styles.kondisiBadge}>
                  <Text style={styles.kondisiBadgeText}>
                    {product.kondisi === 'baru' ? 'Baru' : 'Bekas'}
                  </Text>
                </View>
              )}
            </View>

            {product.isSold && (
              <View style={[styles.tagBtn, { backgroundColor: '#E0E0E0' }]}>
                <Text style={[styles.tagText, { color: '#555' }]}>
                  {isJasa ? 'Selesai' : 'Terjual'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, product.isSold && { color: '#777' }]}>
              {isJasa ? 'Mulai Rp ' : 'Rp '}
              {Number(product.harga).toLocaleString('id-ID')}
            </Text>
            {isJasa && <Text style={styles.priceSubtitle}>/ sesi / paket</Text>}
          </View>
          
          <Text style={styles.title}>{product.namaBarang}</Text>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={14} color="#D32F2F" style={{ marginRight: 5 }} />
            <Text style={styles.locationText}>{product.lokasi || 'Sekitar Kampus UPI Bandung'}</Text>
          </View>

          <Text style={styles.dateText}>Diunggah pada {new Date(product.createdAt).toLocaleDateString('id-ID')}</Text>
          
          <View style={styles.divider} />

          {/* SELLER PROFILE */}
          <TouchableOpacity 
            style={styles.sellerCard}
            onPress={() => setSellerModalVisible(true)}
            activeOpacity={0.75}
          >
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarInitials}>
                {(sellerDisplayName || 'P').substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName} numberOfLines={1}>{sellerDisplayName}</Text>
              <View style={styles.verifiedRow}>
                <Ionicons name="school-outline" size={13} color="#D32F2F" />
                <Text style={styles.sellerStatus} numberOfLines={1}>
                  {sellerData?.prodi ? ` ${sellerData.prodi}` : isJasa ? ' Penyedia Jasa' : ' Penjual'}
                </Text>
              </View>
            </View>
            <View style={styles.btnViewBio}>
              <Text style={styles.btnViewBioText}>Lihat Bio</Text>
              <Ionicons name="chevron-forward" size={16} color="#D32F2F" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>{isJasa ? 'Deskripsi Jasa & Ketentuan' : 'Deskripsi Barang'}</Text>
          <Text style={styles.description}>{product.deskripsi}</Text>
        </View>
      </ScrollView>

      {/* STICKY FOOTER */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {isOwner ? (
          <TouchableOpacity 
            style={[styles.btnContact, { backgroundColor: '#D32F2F' }]} 
            onPress={() => navigation.navigate('MyProducts')}
            activeOpacity={0.8}
          >
            <Ionicons name="albums-outline" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.btnText}>Kelola di Katalog Saya</Text>
          </TouchableOpacity>
        ) : product.isSold ? (
          <TouchableOpacity style={[styles.btnContact, { backgroundColor: '#9E9E9E' }]} disabled>
            <Ionicons name="checkmark-done" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.btnText}>{isJasa ? 'Layanan Sedang Penuh' : 'Barang Ini Sudah Terjual'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.btnContact} 
            onPress={handleContact} 
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={22} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.btnText}>
              {isJasa ? 'Hubungi Penyedia Jasa via WhatsApp' : 'Hubungi Penjual via WhatsApp'}
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* MODAL SHOWCASE / BIO PENJUAL */}
      <Modal
        visible={sellerModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSellerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sellerModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Informasi Penjual</Text>
              <TouchableOpacity onPress={() => setSellerModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingBottom: 10 }}>
              <View style={styles.modalAvatarBox}>
                <Text style={styles.modalAvatarInitials}>
                  {(sellerDisplayName || 'P').substring(0, 2).toUpperCase()}
                </Text>
              </View>

              <Text style={styles.modalSellerName}>{sellerDisplayName}</Text>
              <Text style={styles.modalSellerBadge}>Mahasiswa Kampus UPI</Text>

              {/* CHIP PRODI & FAKULTAS */}
              <View style={styles.modalChipsContainer}>
                {sellerData?.prodi ? (
                  <View style={styles.modalChip}>
                    <Ionicons name="school" size={13} color="#D32F2F" style={{ marginRight: 5 }} />
                    <Text style={styles.modalChipText}>{sellerData.prodi}</Text>
                  </View>
                ) : null}

                {sellerData?.fakultas ? (
                  <View style={styles.modalChip}>
                    <Ionicons name="business" size={13} color="#D32F2F" style={{ marginRight: 5 }} />
                    <Text style={styles.modalChipText}>{sellerData.fakultas}</Text>
                  </View>
                ) : null}

                {sellerData?.angkatan ? (
                  <View style={styles.modalChip}>
                    <Ionicons name="calendar" size={13} color="#D32F2F" style={{ marginRight: 5 }} />
                    <Text style={styles.modalChipText}>Angkatan {sellerData.angkatan}</Text>
                  </View>
                ) : null}
              </View>

              {/* BIO BOX */}
              <View style={styles.modalBioContainer}>
                <Text style={styles.modalBioHeader}>Bio / Catatan Penjual:</Text>
                <Text style={styles.modalBioText}>
                  {sellerData?.bio ? `"${sellerData.bio}"` : 'Penjual belum menambahkan bio profil.'}
                </Text>
              </View>

              {/* TOMBOL CHAT DI DALAM MODAL */}
              {!product.isSold && !isOwner && (
                <TouchableOpacity 
                  style={styles.modalBtnChat}
                  onPress={() => {
                    setSellerModalVisible(false);
                    handleContact();
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="logo-whatsapp" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.modalBtnChatText}>Hubungi via WhatsApp</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CUSTOM DIALOG MODAL */}
      <CustomModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={() => setModalConfig({ ...modalConfig, visible: false })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.92)', padding: 10, borderRadius: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  favBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.92)', padding: 10, borderRadius: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  image: { width: width, height: height * 0.45, backgroundColor: '#eee', resizeMode: 'cover' },
  contentCard: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, padding: 25, minHeight: height * 0.6, shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  categoryBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  typeBadgeJasa: {
    backgroundColor: '#E3F2FD',
    borderColor: '#BBDEFB',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D32F2F',
  },
  typeBadgeTextJasa: {
    color: '#1565C0',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  categoryBadgeText: { fontSize: 12, fontWeight: '700', color: '#D32F2F' },
  kondisiBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  kondisiBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
  price: { fontSize: 26, fontWeight: '900', color: '#D32F2F', letterSpacing: -0.5 },
  priceSubtitle: { fontSize: 13, color: '#777', fontWeight: '500', marginLeft: 6 },
  tagBtn: { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
  title: { fontSize: 22, color: '#1A1A1A', fontWeight: '700', lineHeight: 30 },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  locationText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#D32F2F',
  },
  dateText: { fontSize: 12, color: '#888', marginTop: 8 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 18 },

  // Seller Card (Clickable)
  sellerCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FAFAFA', 
    padding: 14, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#ECEFF1' 
  },
  sellerAvatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#D32F2F', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12,
  },
  sellerAvatarInitials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 3 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center' },
  sellerStatus: { fontSize: 12, color: '#666' },
  btnViewBio: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 2,
  },
  btnViewBioText: {
    fontSize: 11,
    color: '#D32F2F',
    fontWeight: '700',
  },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  description: { fontSize: 15, color: '#555', lineHeight: 24, letterSpacing: 0.2 },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0', shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  btnContact: { flexDirection: 'row', backgroundColor: '#25D366', padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Modal Showcase Penjual
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sellerModalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalAvatarBox: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  modalAvatarInitials: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  modalSellerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modalSellerBadge: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: '600',
    marginBottom: 14,
  },
  modalChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  modalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  modalChipText: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: '600',
  },
  modalBioContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 20,
  },
  modalBioHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    marginBottom: 6,
  },
  modalBioText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  modalBtnChat: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  modalBtnChatText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;
