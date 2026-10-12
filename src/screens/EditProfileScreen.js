import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import CustomModal from '../components/CustomModal';

const EditProfileScreen = ({ navigation }) => {
  const user = auth.currentUser;

  const [nama, setNama] = useState(user?.displayName || '');
  const [prodi, setProdi] = useState('');
  const [fakultas, setFakultas] = useState('');
  const [angkatan, setAngkatan] = useState('');
  const [noWa, setNoWa] = useState('');
  const [bio, setBio] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    onConfirm: null,
  });

  // Ambil data profil dari Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.nama) setNama(data.nama);
          if (data.prodi) setProdi(data.prodi);
          if (data.fakultas) setFakultas(data.fakultas);
          if (data.angkatan) setAngkatan(String(data.angkatan));
          if (data.noWa) setNoWa(data.noWa);
          if (data.bio) setBio(data.bio);
        } else {
          // Default nama dari email jika displayName belum ada
          if (!nama && user.email) {
            setNama(user.email.split('@')[0]);
          }
        }
      } catch (error) {
        console.log('Error fetching user profile:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSimpan = async () => {
    if (!nama.trim()) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Nama Wajib Diisi',
        message: 'Mohon cantumkan nama lengkap atau panggilan Anda.',
        confirmText: 'Mengerti',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    if (!noWa.trim()) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Nomor WhatsApp Wajib Diisi',
        message: 'Nomor WhatsApp diperlukan agar calon pembeli dapat menghubungi Anda secara langsung.',
        confirmText: 'Lengkapi Nomor',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Update Firebase Auth displayName
      if (user) {
        await updateProfile(user, {
          displayName: nama.trim(),
        });

        // 2. Simpan detail profil teks ke Cloud Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(
          userDocRef,
          {
            uid: user.uid,
            email: user.email,
            nama: nama.trim(),
            prodi: prodi.trim(),
            fakultas: fakultas.trim(),
            angkatan: angkatan.trim(),
            noWa: noWa.trim(),
            bio: bio.trim(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      setIsLoading(false);
      setModalConfig({
        visible: true,
        type: 'success',
        title: 'Data Berhasil Disimpan',
        message: 'Identitas mahasiswa dan informasi kontak WhatsApp Anda telah diperbarui.',
        confirmText: 'Selesai',
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
        title: 'Gagal Menyimpan Data',
        message: error.message || 'Terjadi kesalahan saat menyimpan perubahan.',
        confirmText: 'Tutup',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    }
  };

  if (isFetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={styles.loadingText}>Memuat data profil...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HEADER IDENTITAS MAHASISWA */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {(nama || 'MU').substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.avatarCardTitle}>Identitas Mahasiswa UPI</Text>
          <Text style={styles.userEmailText}>{user?.email}</Text>
        </View>

        {/* INPUT NAMA (WAJIB) */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Nama Lengkap / Panggilan</Text>
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredBadgeText}>Wajib</Text>
          </View>
        </View>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#777" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Cth: Muhammad Ramdhan"
            value={nama}
            onChangeText={setNama}
          />
        </View>

        {/* INPUT NOMOR WHATSAPP (WAJIB) */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Nomor WhatsApp</Text>
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredBadgeText}>Wajib</Text>
          </View>
        </View>
        <View style={styles.inputWrapper}>
          <Ionicons name="logo-whatsapp" size={20} color="#25D366" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Cth: 08123456789"
            keyboardType="phone-pad"
            value={noWa}
            onChangeText={setNoWa}
          />
        </View>

        {/* INPUT PRODI & JURUSAN (OPSIONAL) */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Program Studi / Jurusan</Text>
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalBadgeText}>Opsional</Text>
          </View>
        </View>
        <View style={styles.inputWrapper}>
          <Ionicons name="school-outline" size={20} color="#777" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Cth: Pendidikan Ilmu Komputer"
            value={prodi}
            onChangeText={setProdi}
          />
        </View>

        {/* INPUT FAKULTAS (OPSIONAL) */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Fakultas</Text>
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalBadgeText}>Opsional</Text>
          </View>
        </View>
        <View style={styles.inputWrapper}>
          <Ionicons name="business-outline" size={20} color="#777" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Cth: FPMIPA / FPEB / FIP"
            value={fakultas}
            onChangeText={setFakultas}
          />
        </View>

        {/* INPUT ANGKATAN (OPSIONAL) */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Angkatan Kuliah</Text>
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalBadgeText}>Opsional</Text>
          </View>
        </View>
        <View style={styles.inputWrapper}>
          <Ionicons name="calendar-outline" size={20} color="#777" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Cth: 2024"
            keyboardType="numeric"
            value={angkatan}
            onChangeText={setAngkatan}
          />
        </View>

        {/* INPUT BIO (OPSIONAL) */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Bio / Catatan Penjual</Text>
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalBadgeText}>Opsional</Text>
          </View>
        </View>
        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Cth: Suka barter buku kuliah, COD bisa sekitar Isola atau Gymnasium..."
            multiline
            numberOfLines={3}
            value={bio}
            onChangeText={setBio}
          />
        </View>

        {/* TOMBOL SIMPAN */}
        <TouchableOpacity
          style={[styles.btnSave, isLoading && styles.btnDisabled]}
          onPress={handleSimpan}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.btnSaveRow}>
              <Ionicons name="checkmark-done" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnSaveText}>Simpan Perubahan</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

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
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },

  avatarCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  avatarCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  userEmailText: {
    fontSize: 13,
    color: '#777',
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  requiredBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredBadgeText: {
    color: '#D32F2F',
    fontSize: 11,
    fontWeight: '700',
  },
  optionalBadge: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  optionalBadgeText: {
    color: '#777',
    fontSize: 11,
    fontWeight: '500',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#222',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
    paddingVertical: 0,
  },

  btnSave: {
    backgroundColor: '#D32F2F',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 20,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnDisabled: {
    backgroundColor: '#EF9A9A',
    shadowOpacity: 0,
  },
  btnSaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal Notifikasi Sukses
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
  },
  btnModalOk: {
    width: '100%',
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  btnModalOkText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default EditProfileScreen;
