import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
import { auth, db } from '../config/firebase';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomModal from '../components/CustomModal';
import BrandLogo from '../components/BrandLogo';
import { APP_NAME } from '../constants/branding';

WebBrowser.maybeCompleteAuthSession();

const RegisterScreen = ({ navigation }) => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    onConfirm: () => {}
  });

  const showModal = (type, title, message, onConfirm = () => {}) => {
    setModalConfig({
      visible: true,
      type,
      title,
      message,
      confirmText: 'OK',
      onConfirm: () => {
        setModalConfig(prev => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      }
    });
  };

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '996352318617-6o4qjspus3ucemhiejao3giiqfvli1b3.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      setIsLoading(true);
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      
      signInWithCredential(auth, credential)
        .then(async (userCredential) => {
           const user = userCredential.user;
           const userRef = doc(db, 'users', user.uid);
           const userSnap = await getDoc(userRef);
           if(!userSnap.exists()) {
             await setDoc(userRef, {
               nama: user.displayName || 'Mahasiswa UPI',
               email: user.email,
               createdAt: new Date().toISOString()
             });
           }
           setIsLoading(false);
           showModal('success', 'Pendaftaran Berhasil', 'Akun berhasil terhubung dengan Google!', () => {
             navigation.replace('Home');
           });
        })
        .catch(error => {
           setIsLoading(false);
           showModal('danger', 'Gagal Daftar Google', 'Otorisasi Google tidak dapat diselesaikan. Silakan gunakan pendaftaran via email dan password.');
        });
    } else if (response?.type === 'error') {
      setIsLoading(false);
      showModal('danger', 'Gagal Daftar Google', 'Layanan Google OAuth memerlukan konfigurasi Client ID di Google Cloud Console. Silakan daftar via Email dan Password.');
    } else if (response?.type === 'cancel' || response?.type === 'dismiss') {
      setIsLoading(false);
    }
  }, [response]);

  const handleRegister = async () => {
    if (!email || !password || !nama) {
      showModal('warning', 'Form Belum Lengkap', 'Nama lengkap, email, dan kata sandi wajib diisi.');
      return;
    }
    
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        nama: nama,
        email: email.trim(),
        createdAt: new Date().toISOString()
      });

      setIsLoading(false);
      showModal('success', 'Akun Berhasil Dibuat', 'Pendaftaran sukses! Silakan masuk ke aplikasi.', () => {
        navigation.navigate('Login');
      });
    } catch (error) {
      setIsLoading(false);
      showModal('danger', 'Pendaftaran Gagal', error.message || 'Tidak dapat membuat akun. Silakan coba lagi.');
    }
  };

  const handleGoogleRegister = () => {
    if (!request) {
      showModal('warning', 'Daftar dengan Google', 'Layanan Google Sign-In memerlukan Client ID aktif di Google Cloud Console. Silakan daftar menggunakan Email dan Password.');
      return;
    }
    setIsLoading(true);
    promptAsync({ extraParams: { prompt: 'select_account' } })
      .then((res) => {
        if (!res || res.type === 'cancel' || res.type === 'dismiss') {
          setIsLoading(false);
        }
      })
      .catch(err => {
        setIsLoading(false);
        showModal('danger', 'Kendala Google OAuth', 'Tidak dapat menghubungkan akun Google. Silakan daftar menggunakan Email dan Password.');
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <Ionicons name="person-add" size={38} color="#D32F2F" />
            </View>
            <BrandLogo size={36} showDot={true} />
            <Text style={styles.subtitle}>Ayo gabung dan jadi bagian dari LapakUPI sekarang!</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Ketik nama lengkapmu" 
                  value={nama} 
                  onChangeText={setNama} 
                  placeholderTextColor="#bbb"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Masukkan email kamu" 
                  value={email} 
                  onChangeText={setEmail} 
                  keyboardType="email-address" 
                  autoCapitalize="none"
                  placeholderTextColor="#bbb"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Sandi</Text>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Minimal 6 karakter" 
                  value={password} 
                  onChangeText={setPassword} 
                  secureTextEntry={!showPassword} 
                  placeholderTextColor="#bbb"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7} style={{padding: 5}}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#888" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.btnPrimary, isLoading && styles.btnDisabled]} 
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Daftar Akun Baru</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ATAU</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity 
              style={[styles.btnGoogle, (!request || isLoading) && styles.btnDisabledGoogle]} 
              onPress={handleGoogleRegister}
              disabled={!request || isLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-google" size={22} color="#DB4437" style={{ marginRight: 12 }} />
              <Text style={styles.btnGoogleText}>Daftar dengan Akun Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.6}>
              <Text style={styles.linkText}> Masuk di Sini</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

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
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingVertical: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 20 },
  iconWrapper: { backgroundColor: '#FDECEA', padding: 20, borderRadius: 24, marginBottom: 20, shadowColor: '#D32F2F', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  subtitle: { fontSize: 15, color: '#888', marginTop: 8, letterSpacing: 0.3, textAlign: 'center' },
  formContainer: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 18 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginLeft: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAEAEA', paddingHorizontal: 16, borderRadius: 14, height: 56, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1A1A1A' },
  btnPrimary: { backgroundColor: '#D32F2F', padding: 18, borderRadius: 14, alignItems: 'center', shadowColor: '#D32F2F', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, marginTop: 6 },
  btnDisabled: { backgroundColor: '#EF9A9A', shadowOpacity: 0, elevation: 0 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 26 },
  divider: { flex: 1, height: 1, backgroundColor: '#EAEAEA' },
  dividerText: { marginHorizontal: 15, color: '#AAA', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  btnGoogle: { flexDirection: 'row', backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAEAEA', padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  btnDisabledGoogle: { opacity: 0.6 },
  btnGoogleText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, marginBottom: 20 },
  footerText: { color: '#888', fontSize: 15 },
  linkText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 15 }
});

export default RegisterScreen;
