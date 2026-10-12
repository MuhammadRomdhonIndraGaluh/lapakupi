import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Image,
  Modal
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CATEGORIES, getCategoriesByType, KONDISI_OPTIONS } from '../constants/categories';
import CustomModal from '../components/CustomModal';

const AddProductScreen = ({ navigation }) => {
  const [tipeIklan, setTipeIklan] = useState('barang');
  const [kondisi, setKondisi] = useState('bekas');
  const [namaBarang, setNamaBarang] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [harga, setHarga] = useState('');
  const [kontak, setKontak] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [kategori, setKategori] = useState('buku');
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    onConfirm: null,
  });

  // Fungsi ambil foto dari Kamera
  const handleTakePhoto = async () => {
    setPhotoPickerVisible(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setModalConfig({
          visible: true,
          type: 'warning',
          title: 'Izin Kamera Diperlukan',
          message: 'Aplikasi memerlukan izin akses kamera untuk mengambil foto barang atau pamflet jasa.',
          confirmText: 'Mengerti',
          onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageBase64(`data:image/jpeg;base64,${asset.base64}`);
      }
    } catch (error) {
      setModalConfig({
        visible: true,
        type: 'danger',
        title: 'Gagal Membuka Kamera',
        message: error.message || 'Terjadi kesalahan saat membuka kamera.',
        confirmText: 'Tutup',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    }
  };

  // Fungsi pilih foto dari Galeri HP
  const handlePickFromGallery = async () => {
    setPhotoPickerVisible(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setModalConfig({
          visible: true,
          type: 'warning',
          title: 'Izin Galeri Diperlukan',
          message: 'Aplikasi memerlukan izin akses galeri foto untuk memilih gambar produk.',
          confirmText: 'Mengerti',
          onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageBase64(`data:image/jpeg;base64,${asset.base64}`);
      }
    } catch (error) {
      setModalConfig({
        visible: true,
        type: 'danger',
        title: 'Gagal Membuka Galeri',
        message: error.message || 'Terjadi kesalahan saat membuka galeri gambar.',
        confirmText: 'Tutup',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    }
  };

  const handleSelectImageOption = () => {
    setPhotoPickerVisible(true);
  };

  const handleRemovePhoto = () => {
    setImageUri(null);
    setImageBase64(null);
  };

  const handleSimpan = async () => {
    if (!namaBarang.trim() || !deskripsi.trim() || !harga.toString().trim() || !kontak.trim()) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Formulir Belum Lengkap',
        message: 'Mohon isi semua kolom: nama/judul, deskripsi, harga/tarif, serta nomor WhatsApp kontak sebelum mempublikasikan.',
        confirmText: 'Lengkapi Data',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    if (!imageBase64 && !imageUri) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Foto Belum Dipilih',
        message: 'Silakan pilih foto produk atau pamflet layanan jasa terlebih dahulu.',
        confirmText: 'Pilih Foto',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        namaBarang: namaBarang.trim(),
        deskripsi: deskripsi.trim(),
        harga: Number(harga),
        kontak: kontak.trim(),
        lokasi: lokasi.trim() || 'Sekitar Kampus UPI',
        tipe: tipeIklan,
        kategori: kategori,
        kondisi: tipeIklan === 'barang' ? kondisi : null,
        imageUrl: imageBase64,
        sellerId: auth.currentUser?.uid || 'anonymous',
        sellerEmail: auth.currentUser?.email || 'anon@gmail.com',
        createdAt: new Date().toISOString()
      });

      setIsLoading(false);
      setModalConfig({
        visible: true,
        type: 'success',
        title: 'Publikasi Berhasil',
        message: tipeIklan === 'jasa' 
          ? 'Layanan jasa berhasil dipublikasikan ke katalog kampus UPI!' 
          : 'Barang berhasil dipublikasikan ke katalog kampus UPI!',
        confirmText: 'Lihat Katalog',
        onConfirm: () => {
          setModalConfig((prev) => ({ ...prev, visible: false }));
          navigation.goBack();
        },
      });
    } catch (error) {
      setIsLoading(false);
      setModalConfig({
        visible: true,
        type: 'danger',
        title: 'Gagal Mempublikasikan',
        message: error.message || 'Terjadi gangguan saat menyimpan ke database.',
        confirmText: 'Tutup',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* PILIH TIPE (BARANG / JASA) */}
        <Text style={styles.label}>Pilihan Tipe</Text>
        <View style={styles.typeSelectorRow}>
          <TouchableOpacity
            style={[styles.typeBtn, tipeIklan === 'barang' && styles.typeBtnActive]}
            onPress={() => {
              setTipeIklan('barang');
              setKategori('buku');
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="cube-outline"
              size={18}
              color={tipeIklan === 'barang' ? '#fff' : '#555'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.typeBtnText, tipeIklan === 'barang' && styles.typeBtnTextActive]}>
              Jual Barang
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeBtn, tipeIklan === 'jasa' && styles.typeBtnActive]}
            onPress={() => {
              setTipeIklan('jasa');
              setKategori('jasa_ketik');
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="construct-outline"
              size={18}
              color={tipeIklan === 'jasa' ? '#fff' : '#555'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.typeBtnText, tipeIklan === 'jasa' && styles.typeBtnTextActive]}>
              Tawarkan Jasa
            </Text>
          </TouchableOpacity>
        </View>

        {/* SECTION UPLOAD FOTO */}
        <Text style={styles.label}>
          {tipeIklan === 'jasa' ? 'Foto Portofolio / Pamflet (Wajib)' : 'Foto Barang (Wajib)'}
        </Text>

        {imageUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <View style={styles.previewBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.previewBadgeText}>Foto Terpilih</Text>
            </View>
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.btnChangePhoto} onPress={handleSelectImageOption}>
                <Ionicons name="camera-reverse-outline" size={18} color="#D32F2F" />
                <Text style={styles.btnChangePhotoText}>Ganti Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDeletePhoto} onPress={handleRemovePhoto}>
                <Ionicons name="trash-outline" size={18} color="#999" />
                <Text style={styles.btnDeletePhotoText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.uploadBox}>
            <View style={styles.uploadIconCircle}>
              <Ionicons name={tipeIklan === 'jasa' ? 'construct-outline' : 'camera-outline'} size={32} color="#D32F2F" />
            </View>
            <Text style={styles.uploadTitle}>
              {tipeIklan === 'jasa' ? 'Unggah Portofolio / Pamflet Jasa' : 'Unggah Foto Barang Asli'}
            </Text>
            <Text style={styles.uploadSubtitle}>
              {tipeIklan === 'jasa' 
                ? 'Unggah contoh hasil kerja atau pamflet layanan Anda.' 
                : 'Unggah foto asli barang yang ingin Anda jual.'}
            </Text>

            <View style={styles.uploadButtonsRow}>
              <TouchableOpacity style={styles.btnUploadOption} onPress={handleTakePhoto} activeOpacity={0.8}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.btnUploadOptionText}>Kamera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnUploadOption, styles.btnUploadOptionGallery]} onPress={handlePickFromGallery} activeOpacity={0.8}>
                <Ionicons name="images" size={20} color="#D32F2F" />
                <Text style={[styles.btnUploadOptionText, { color: '#D32F2F' }]}>Galeri HP</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* PILIHAN KONDISI BARANG JIKA JUAL BARANG */}
        {tipeIklan === 'barang' && (
          <>
            <Text style={styles.label}>Kondisi Barang</Text>
            <View style={styles.kondisiRow}>
              {KONDISI_OPTIONS.map((opt) => {
                const isSelected = kondisi === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.kondisiBtn, isSelected && styles.kondisiBtnActive]}
                    onPress={() => setKondisi(opt.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name={opt.id === 'baru' ? 'sparkles-outline' : 'repeat-outline'} 
                      size={15} 
                      color={isSelected ? '#fff' : '#555'} 
                      style={{ marginRight: 6 }} 
                    />
                    <Text style={[styles.kondisiBtnText, isSelected && styles.kondisiBtnTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* INPUT NAMA BARANG / JASA */}
        <Text style={styles.label}>
          {tipeIklan === 'jasa' ? 'Judul Layanan / Jasa' : 'Nama Barang'}
        </Text>
        <TextInput 
          style={styles.input}
          placeholder={tipeIklan === 'jasa' 
            ? 'Contoh: Jasa Desain Slide Presentasi' 
            : 'Contoh: Meja Belajar Lipat Minimalis'}
          value={namaBarang}
          onChangeText={setNamaBarang}
        />

        {/* PILIH KATEGORI (BERDASARKAN TIPE) */}
        <Text style={styles.label}>
          {tipeIklan === 'jasa' ? 'Kategori Jasa' : 'Kategori Barang'}
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryScroll}
        >
          {getCategoriesByType(tipeIklan).map((cat) => {
            const isSelected = kategori === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                onPress={() => setKategori(cat.id)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={cat.icon} 
                  size={16} 
                  color={isSelected ? '#fff' : '#666'} 
                  style={{ marginRight: 6 }} 
                />
                <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* INPUT HARGA / TARIF */}
        <Text style={styles.label}>
          {tipeIklan === 'jasa' ? 'Tarif Mulai Dari (Rp)' : 'Harga (Rp)'}
        </Text>
        <TextInput 
          style={styles.input}
          placeholder={tipeIklan === 'jasa' ? 'Contoh: 25000' : 'Contoh: 150000'}
          keyboardType="numeric"
          value={harga}
          onChangeText={setHarga}
        />

        {/* INPUT DESKRIPSI */}
        <Text style={styles.label}>
          {tipeIklan === 'jasa' ? 'Deskripsi Jasa & Ketentuan' : 'Deskripsi Barang'}
        </Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder={tipeIklan === 'jasa'
            ? 'Jelaskan rincian layanan, estimasi waktu pengerjaan, dan ketentuan pemesanan.'
            : 'Jelaskan spesifikasi, kelengkapan, dan kondisi fisik barang.'}
          multiline
          numberOfLines={4}
          value={deskripsi}
          onChangeText={setDeskripsi}
        />

        {/* INPUT LOKASI / AREA KAMPUS */}
        <Text style={styles.label}>
          {tipeIklan === 'jasa' ? 'Lokasi / Jangkauan Layanan' : 'Lokasi Barang / Area COD'}
        </Text>
        <TextInput 
          style={styles.input}
          placeholder={tipeIklan === 'jasa'
            ? 'Contoh: Sekitar UPI Bandung / Online / Sekitar Gerlong'
            : 'Contoh: Gerlong Girang / FPMIPA / Asrama UPI'}
          value={lokasi}
          onChangeText={setLokasi}
        />

        {/* INPUT WHATSAPP */}
        <Text style={styles.label}>Nomor WhatsApp</Text>
        <TextInput 
          style={styles.input}
          placeholder="Contoh: 081234567890"
          keyboardType="phone-pad"
          value={kontak}
          onChangeText={setKontak}
        />

        {/* TOMBOL SUBMIT */}
        <TouchableOpacity 
          style={[styles.btnPrimary, isLoading && styles.btnDisabled]} 
          onPress={handleSimpan}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons 
                name={tipeIklan === 'jasa' ? 'construct-outline' : 'bag-check-outline'} 
                size={20} 
                color="#fff" 
                style={{ marginRight: 8 }} 
              />
              <Text style={styles.btnText}>
                {tipeIklan === 'jasa' ? 'Publikasikan Layanan Jasa' : 'Publikasikan Barang'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL PILIH SUMBER FOTO */}
      <Modal
        visible={photoPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoPickerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.pickerModalOverlay} 
          activeOpacity={1} 
          onPress={() => setPhotoPickerVisible(false)}
        >
          <View style={styles.pickerModalCard}>
            <Text style={styles.pickerModalTitle}>Pilih Sumber Foto</Text>
            <Text style={styles.pickerModalSub}>Unggah foto barang atau pamflet layanan jasa</Text>

            <TouchableOpacity style={styles.pickerModalBtn} onPress={handleTakePhoto} activeOpacity={0.75}>
              <Ionicons name="camera-outline" size={22} color="#D32F2F" style={{ marginRight: 12 }} />
              <Text style={styles.pickerModalBtnText}>Ambil Foto dari Kamera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickerModalBtn} onPress={handlePickFromGallery} activeOpacity={0.75}>
              <Ionicons name="images-outline" size={22} color="#D32F2F" style={{ marginRight: 12 }} />
              <Text style={styles.pickerModalBtnText}>Pilih dari Galeri Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickerModalCancelBtn} onPress={() => setPhotoPickerVisible(false)} activeOpacity={0.75}>
              <Text style={styles.pickerModalCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CUSTOM DIALOG MODAL */}
      <CustomModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 10 },
  kondisiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  kondisiBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 10,
    borderRadius: 10,
  },
  kondisiBtnActive: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  kondisiBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  kondisiBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typeBtnActive: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
    shadowColor: '#D32F2F',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  typeBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#eee', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    fontSize: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: { height: 105, textAlignVertical: 'top' },

  // Upload Box
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 4 },
  uploadSubtitle: { fontSize: 12, color: '#777', textAlign: 'center', marginBottom: 15, paddingHorizontal: 10 },
  uploadButtonsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 12 },
  btnUploadOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    elevation: 2,
  },
  btnUploadOptionGallery: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#D32F2F',
    elevation: 0,
  },
  btnUploadOptionText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  uploadNote: { fontSize: 11, color: '#999', marginTop: 12, textAlign: 'center', fontStyle: 'italic' },

  // Preview Image
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  previewBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  previewBadgeText: { fontSize: 12, fontWeight: '600', color: '#333' },
  previewActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  btnChangePhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  btnChangePhotoText: { color: '#D32F2F', fontSize: 13, fontWeight: '600' },
  btnDeletePhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  btnDeletePhotoText: { color: '#666', fontSize: 13, fontWeight: '600' },

  // Primary Button
  btnPrimary: { 
    backgroundColor: '#D32F2F', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 25, 
    marginBottom: 40,
    shadowColor: '#D32F2F', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 4 
  },
  btnDisabled: { backgroundColor: '#EF9A9A', shadowOpacity: 0 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },

  // Category Selector Styles
  categoryScroll: {
    paddingVertical: 6,
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryChipSelected: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
    shadowColor: '#D32F2F',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryChipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },

  // Picker Modal Styles
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  pickerModalSub: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  pickerModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  pickerModalBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  pickerModalCancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  pickerModalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
});

export default AddProductScreen;
