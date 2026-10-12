import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import CustomModal from '../components/CustomModal';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const user = auth.currentUser;
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const fetchProfile = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setProfileData(snap.data());
      }
    } catch (err) {
      console.log('Error fetch profile:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    auth.signOut().then(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    });
  };

  const displayName = profileData?.nama || user?.displayName || user?.email?.split('@')[0] || 'Mahasiswa UPI';
  const isDataIncomplete = !profileData?.prodi || !profileData?.fakultas || !profileData?.angkatan;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D32F2F" />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER DENGAN IKON DI ATAS JUDUL - IKUT TER-SCROLL */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderIconCircle}>
            <Ionicons name="person-circle-outline" size={28} color="#D32F2F" />
          </View>
          <Text style={styles.pageHeaderTitle}>Akun Saya</Text>
          <Text style={styles.pageHeaderSubtitle}>Profil mahasiswa & pengaturan akun</Text>
        </View>

        {/* 1. HERO PROFILE CARD */}
        <View style={styles.heroCard}>
          {/* Avatar Inisial Mahasiswa */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarInitials}>
                {(displayName || 'MU').substring(0, 2).toUpperCase()}
              </Text>
            </View>
          </View>

          {/* User Basic Info */}
          <Text style={styles.name}>{displayName}</Text>
          <View style={styles.emailRow}>
            <Ionicons name="mail-outline" size={14} color="#666" style={{ marginRight: 5 }} />
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          {/* Status Badge */}
          <View style={styles.campusBadge}>
            <Ionicons name="school" size={13} color="#D32F2F" style={{ marginRight: 5 }} />
            <Text style={styles.campusBadgeText}>Mahasiswa UPI</Text>
          </View>

          {/* Bio Box */}
          <View style={styles.bioContainer}>
            {profileData?.bio ? (
              <Text style={styles.bioText}>"{profileData.bio}"</Text>
            ) : (
              <Text style={styles.bioPlaceholder}>
                Belum ada bio singkat. Kenalkan dirimu dan keahlianmu kepada pembeli!
              </Text>
            )}
          </View>

          {/* Edit Profile Action Button */}
          <TouchableOpacity
            style={styles.btnEditProfile}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={17} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.btnEditProfileText}>Ubah Data Profil</Text>
          </TouchableOpacity>
        </View>

        {/* 2. KARTU IDENTITAS AKADEMIK MAHASISWA UPI (KTM DIGITAL) */}
        <View style={styles.cardSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleIconBox}>
              <Ionicons name="id-card-outline" size={18} color="#D32F2F" />
            </View>
            <Text style={styles.sectionTitle}>Identitas Akademik Kampus</Text>
          </View>

          <View style={styles.academicCard}>
            {/* Row Fakultas */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="business-outline" size={18} color="#555" />
              </View>
              <View style={styles.infoTextBox}>
                <Text style={styles.infoLabel}>Fakultas</Text>
                <Text style={[styles.infoValue, !profileData?.fakultas && styles.infoValueEmpty]}>
                  {profileData?.fakultas || 'Belum diatur'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Row Program Studi */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="school-outline" size={18} color="#555" />
              </View>
              <View style={styles.infoTextBox}>
                <Text style={styles.infoLabel}>Program Studi / Jurusan</Text>
                <Text style={[styles.infoValue, !profileData?.prodi && styles.infoValueEmpty]}>
                  {profileData?.prodi || 'Belum diatur'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Row Angkatan */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="calendar-outline" size={18} color="#555" />
              </View>
              <View style={styles.infoTextBox}>
                <Text style={styles.infoLabel}>Angkatan Kuliah</Text>
                <Text style={[styles.infoValue, !profileData?.angkatan && styles.infoValueEmpty]}>
                  {profileData?.angkatan ? `Angkatan ${profileData.angkatan}` : 'Belum diatur'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Row WhatsApp */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="logo-whatsapp" size={18} color="#2E7D32" />
              </View>
              <View style={styles.infoTextBox}>
                <Text style={styles.infoLabel}>Nomor WhatsApp Transaksi</Text>
                <Text style={[styles.infoValue, !profileData?.noWa && styles.infoValueEmpty]}>
                  {profileData?.noWa || 'Belum diatur'}
                </Text>
              </View>
            </View>
          </View>

          {/* Prompt jika data belum lengkap */}
          {isDataIncomplete && (
            <TouchableOpacity 
              style={styles.incompleteBanner}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="alert-circle-outline" size={18} color="#D32F2F" style={{ marginRight: 8 }} />
              <Text style={styles.incompleteBannerText}>
                Lengkapi identitas kampusmu agar transaksi semakin terpercaya. <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}>Lengkapi sekarang</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 3. MENU AKTIVITAS & PENGATURAN */}
        <View style={styles.cardSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleIconBox}>
              <Ionicons name="grid-outline" size={18} color="#D32F2F" />
            </View>
            <Text style={styles.sectionTitle}>Menu & Aktivitas</Text>
          </View>

          <View style={styles.menuCard}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => navigation.navigate('MyProducts')}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name="albums-outline" size={22} color="#D32F2F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuText}>Katalog</Text>
                <Text style={styles.menuSubtext}>Kelola semua barang dan jasa jualan kamu</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#BBB" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => navigation.navigate('Favorites')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: '#F5F5F5' }]}>
                <Ionicons name="bookmark-outline" size={22} color="#D32F2F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuText}>Item Tersimpan</Text>
                <Text style={styles.menuSubtext}>Daftar barang & jasa yang kamu simpan untuk nanti</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#BBB" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => navigation.navigate('Info')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: '#F5F5F5' }]}>
                <Ionicons name="information-circle-outline" size={22} color="#D32F2F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuText}>Pusat Informasi & Panduan</Text>
                <Text style={styles.menuSubtext}>Panduan transaksi aman & kontak pengembang</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#BBB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. TOMBOL KELUAR AKUN */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#D32F2F" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* CUSTOM LOGOUT MODAL */}
      <CustomModal
        visible={logoutModalVisible}
        type="logout"
        title="Keluar dari Akun"
        message="Apakah kamu yakin ingin keluar dari akun ini?"
        confirmText="Keluar"
        cancelText="Batal"
        showCancel={true}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { padding: 18, paddingBottom: 40 },
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
  
  // Hero Card
  heroCard: { 
    alignItems: 'center', 
    paddingTop: 22, 
    paddingBottom: 22, 
    paddingHorizontal: 20,
    backgroundColor: '#fff', 
    borderRadius: 16,
    borderWidth: 1, 
    borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 14,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarContainer: { 
    width: 86, 
    height: 86, 
    borderRadius: 43, 
    backgroundColor: '#D32F2F', 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  name: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#1A1A1A', 
    marginBottom: 4, 
    textAlign: 'center' 
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  email: { 
    fontSize: 13, 
    color: '#666', 
  },
  campusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 12,
  },
  campusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D32F2F',
  },
  bioContainer: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  bioText: {
    fontSize: 13,
    color: '#444',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },
  bioPlaceholder: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 17,
  },
  btnEditProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  btnEditProfileText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },

  // Sections
  cardSection: {
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitleIconBox: {
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    letterSpacing: 0.2,
  },

  // Academic Card
  academicCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
  },
  infoValueEmpty: {
    color: '#BBB',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 64,
  },
  incompleteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  incompleteBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#D32F2F',
    lineHeight: 17,
  },

  // Menu Card
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  menuIconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: '#F5F5F5', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  menuText: { fontSize: 14, fontWeight: '700', color: '#222' },
  menuSubtext: { fontSize: 11, color: '#888', marginTop: 2 },

  // Logout Button
  logoutBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1,
    borderColor: '#ECEFF1', 
    paddingVertical: 14, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 20, 
    marginBottom: 20, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutText: { color: '#D32F2F', fontSize: 14, fontWeight: '700' }
});

export default ProfileScreen;
