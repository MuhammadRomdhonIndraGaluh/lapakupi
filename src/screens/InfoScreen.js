import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomModal from '../components/CustomModal';
import BrandLogo from '../components/BrandLogo';
import {
  APP_NAME,
  APP_SUBTITLE,
  DEVELOPER_NAME,
  DEVELOPER_MAJOR,
  DEVELOPER_WHATSAPP,
  DEVELOPER_WHATSAPP_DISPLAY,
  DEVELOPER_INSTAGRAM,
  DEVELOPER_INSTAGRAM_URL,
} from '../constants/branding';

const { width } = Dimensions.get('window');

const InfoScreen = ({ navigation }) => {
  // Custom Modal State
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    onConfirm: () => {}
  });

  const showModal = (type, title, message) => {
    setModalConfig({
      visible: true,
      type,
      title,
      message,
      confirmText: 'OK',
      onConfirm: () => setModalConfig(prev => ({ ...prev, visible: false }))
    });
  };

  // Buka link Instagram
  const handleOpenInstagram = () => {
    const url = DEVELOPER_INSTAGRAM_URL;
    Linking.openURL(url).catch(() => {
      showModal('danger', 'Gagal Membuka Link', 'Tidak dapat membuka aplikasi Instagram di perangkat ini.');
    });
  };

  // Buka link WhatsApp Bisnis/Kerjasama
  const handleOpenWhatsApp = () => {
    const phone = DEVELOPER_WHATSAPP;
    const message = 'Halo Indra Galuh! Saya ingin menghubungi terkait kerjasama / masukan untuk aplikasi kampus.';
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback ke browser WA Web
        Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
      }
    }).catch(() => {
      showModal('danger', 'WhatsApp Tidak Ditemukan', 'Aplikasi WhatsApp tidak terdeteksi atau tidak dapat dibuka di perangkat ini.');
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER DENGAN IKON DI ATAS JUDUL - IKUT TER-SCROLL */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderIconCircle}>
            <Ionicons name="information-circle-outline" size={26} color="#D32F2F" />
          </View>
          <Text style={styles.pageHeaderTitle}>Pusat Informasi</Text>
          <Text style={styles.pageHeaderSubtitle}>Panduan penggunaan, keamanan transaksi & kontak pengembang</Text>
        </View>

        {/* HERO APP INFO */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="bag-handle" size={38} color="#D32F2F" />
          </View>
          <BrandLogo size={32} showDot={true} />
          <Text style={styles.heroTagline}>{APP_SUBTITLE}</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Versi 1.1.0 • Edisi Kampus UPI Bandung</Text>
          </View>
          <Text style={styles.heroDescription}>
            Platform direktori jual-beli perlengkapan kuliah dan penyedia jasa antar-mahasiswa 
            Universitas Pendidikan Indonesia. Solusi hemat, ramah kantong, dan bebas ribet 
            untuk kebutuhan perkuliahan maupun perlengkapan kos.
          </Text>
        </View>

        {/* SECTION 1: PANDUAN PENGGUNAAN */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="compass-outline" size={22} color="#D32F2F" />
            <Text style={styles.sectionTitle}>Panduan & Cara Kerja</Text>
          </View>

          <View style={styles.guideCard}>
            <View style={styles.guideStepRow}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>1</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Jelajahi Katalog Barang</Text>
                <Text style={styles.stepDesc}>Gunakan kolom pencarian di beranda untuk menemukan buku kuliah, jas almamater, gadget, atau perabotan kos.</Text>
              </View>
            </View>

            <View style={styles.guideStepRow}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>2</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Chat Penjual via WhatsApp</Text>
                <Text style={styles.stepDesc}>Buka detail produk dan tekan tombol hijau untuk langsung terhubung ke WhatsApp penjual untuk tanya kondisi & negosiasi harga.</Text>
              </View>
            </View>

            <View style={styles.guideStepRow}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>3</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>COD di Area Kampus UPI</Text>
                <Text style={styles.stepDesc}>Sepakati titik temu (COD) di tempat ramai seperti Isola, Gymnasium, Perpus Pusat, atau lobi fakultas.</Text>
              </View>
            </View>

            <View style={styles.guideStepRow}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>4</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Tambah Barang atau Jasamu ke Katalog</Text>
                <Text style={styles.stepDesc}>Tekan tombol merah (+) di menu bawah untuk upload foto asli dari kamera/galeri, isi harga/tarif, dan mulai berjualan!</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 2: TIPS AMAN TRANSAKSI */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#2E7D32" />
            <Text style={styles.sectionTitle}>Tips Aman Bertransaksi</Text>
          </View>
          
          <View style={styles.securityBox}>
            <View style={styles.securityItem}>
              <Ionicons name="checkmark-circle" size={18} color="#2E7D32" style={{ marginRight: 10, marginTop: 2 }} />
              <Text style={styles.securityText}><Text style={{ fontWeight: 'bold' }}>Cek Fisik Barang:</Text> Selalu periksa kelayakan barang sebelum membayar.</Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="checkmark-circle" size={18} color="#2E7D32" style={{ marginRight: 10, marginTop: 2 }} />
              <Text style={styles.securityText}><Text style={{ fontWeight: 'bold' }}>Hindari Transfer DP:</Text> Jangan mengirim uang muka sebelum bertemu tatap muka dengan penjual.</Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="checkmark-circle" size={18} color="#2E7D32" style={{ marginRight: 10, marginTop: 2 }} />
              <Text style={styles.securityText}><Text style={{ fontWeight: 'bold' }}>Pilih Tempat Ramai:</Text> Lakukan transaksi di titik publik kampus UPI demi keamanan bersama.</Text>
            </View>
          </View>
        </View>

        {/* SECTION 3: TENTANG DEVELOPER */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="code-slash-outline" size={22} color="#D32F2F" />
            <Text style={styles.sectionTitle}>Tentang Pengembang</Text>
          </View>

          <View style={styles.developerCard}>
            <View style={styles.devTopRow}>
              <View style={styles.devAvatar}>
                <Ionicons name="person" size={32} color="#D32F2F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.devName}>{DEVELOPER_NAME}</Text>
                <Text style={styles.devMajor}>{DEVELOPER_MAJOR}</Text>
                <Text style={styles.devUniv}>Universitas Pendidikan Indonesia</Text>
              </View>
            </View>

            <Text style={styles.devBio}>
              Aplikasi ini dirancang dan dikembangkan dengan tujuan mempermudah 
              mahasiswa UPI dalam mencari kebutuhan kuliah dengan harga terjangkau, sekaligus 
              membantu mahasiswa menjual barang yang sudah tidak terpakai dan menawarkan keahlian jasanya.
            </Text>
          </View>
        </View>

        {/* SECTION 4: KONTAK BISNIS & KERJASAMA */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="briefcase-outline" size={22} color="#D32F2F" />
            <Text style={styles.sectionTitle}>Hubungi Pengembang / Kerjasama</Text>
          </View>

          <Text style={styles.businessDesc}>
            Punya saran fitur, menemukan kendala, atau tertarik berkolaborasi / kerjasama sponsorship? 
            Silakan hubungi kontak resmi di bawah ini:
          </Text>

          <View style={styles.contactRow}>
            <TouchableOpacity 
              style={[styles.btnContactItem, styles.btnInstagram]} 
              onPress={handleOpenInstagram}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-instagram" size={22} color="#fff" />
              <Text style={styles.btnContactText}>Instagram @{DEVELOPER_INSTAGRAM}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnContactItem, styles.btnWhatsApp]} 
              onPress={handleOpenWhatsApp}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={22} color="#fff" />
              <Text style={styles.btnContactText}>WhatsApp ({DEVELOPER_WHATSAPP_DISPLAY})</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FOOTER COPYRIGHT */}
        <View style={styles.footer}>
          <Text style={styles.footerCopyright}>© 2026 {APP_NAME} • Oleh Galuh (Pilkom 24)</Text>
          <Text style={styles.footerMotto}>Bumi Siliwangi, Bandung • Dibuat untuk mahasiswa UPI</Text>
        </View>

      </ScrollView>

      <CustomModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
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
  scrollContent: { padding: 18, paddingBottom: 40 },

  // Hero Card
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  heroIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  heroTagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
    marginTop: 4,
  },
  versionBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 14,
  },
  versionText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  heroDescription: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // Guide
  guideCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    elevation: 2,
  },
  guideStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },

  // Security
  securityBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#1B5E20',
    lineHeight: 19,
  },

  // Developer Card
  developerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    elevation: 2,
  },
  devTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  devAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  devName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  devMajor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D32F2F',
    marginTop: 2,
  },
  devUniv: {
    fontSize: 12,
    color: '#777',
    marginTop: 1,
  },
  devBio: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    fontStyle: 'italic',
  },

  // Business Contacts
  businessDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    paddingHorizontal: 4,
    lineHeight: 19,
  },
  contactRow: {
    flexDirection: 'column',
    gap: 10,
  },
  btnContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    elevation: 2,
  },
  btnInstagram: {
    backgroundColor: '#E1306C',
  },
  btnWhatsApp: {
    backgroundColor: '#25D366',
  },
  btnContactText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  footerCopyright: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
  },
  footerMotto: {
    fontSize: 11,
    color: '#AAA',
    textAlign: 'center',
  },
});

export default InfoScreen;
