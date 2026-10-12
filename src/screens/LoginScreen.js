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
  Modal
} from 'react-native';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithCredential,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomModal from '../components/CustomModal';
import BrandLogo from '../components/BrandLogo';
import { APP_NAME, APP_SUBTITLE } from '../constants/branding';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // State untuk Reset Password
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // State untuk Custom Dialog Modal
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    onConfirm: null,
  });

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
           navigation.replace('Home');
        })
        .catch(error => {
           setIsLoading(false);
           setModalConfig({
             visible: true,
             type: 'danger',
             title: 'Gagal Masuk Google',
             message: 'Otorisasi Google tidak dapat diselesaikan. Silakan gunakan email dan kata sandi.',
             confirmText: 'Tutup',
             onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
           });
        });
    } else if (response?.type === 'error') {
      setIsLoading(false);
      setModalConfig({
        visible: true,
        type: 'danger',
        title: 'Gagal Masuk Google',
        message: 'Layanan Google OAuth membutuhkan verifikasi domain di Google Cloud Console. Silakan login dengan Email dan Kata Sandi.',
        confirmText: 'Mengerti',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    } else if (response?.type === 'cancel' || response?.type === 'dismiss') {
      setIsLoading(false);
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Formulir Kosong',
        message: 'Silakan isi email dan kata sandi terlebih dahulu.',
        confirmText: 'Mengerti',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setIsLoading(false);
      navigation.replace('Home');
    } catch (error) {
      setIsLoading(false);
      setModalConfig({
        visible: true,
        type: 'danger',
        title: 'Login Gagal',
        message: 'Email atau kata sandi tidak sesuai. Pastikan akun kamu sudah terdaftar.',
        confirmText: 'Coba Lagi',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    }
  };

  const handleOpenForgotModal = () => {
    setResetEmail(email.trim());
    setForgotModalVisible(true);
  };

  const handleSendResetPassword = async () => {
    if (!resetEmail.trim()) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Email Diperlukan',
        message: 'Ketik alamat email Anda yang terdaftar untuk menerima tautan reset password.',
        confirmText: 'Mengerti',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setIsResetting(false);
      setForgotModalVisible(false);
      setModalConfig({
        visible: true,
        type: 'success',
        title: 'Tautan Terkirim',
        message: `Tautan pengaturan ulang kata sandi berhasil dikirim ke ${resetEmail.trim()}. Silakan periksa kotak masuk atau spam email Anda.`,
        confirmText: 'Selesai',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    } catch (error) {
      setIsResetting(false);
      setModalConfig({
        visible: true,
        type: 'danger',
        title: 'Gagal Mengirim Tautan',
        message: error.message || 'Email tidak terdaftar atau terjadi kesalahan sistem.',
        confirmText: 'Tutup',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    }
  };

  const handleGoogleLogin = () => {
    if (!request) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Masuk dengan Google',
        message: 'Koneksi Google Sign-In memerlukan Client ID terdaftar di Google Console. Silakan masuk menggunakan Email dan Kata Sandi.',
        confirmText: 'Mengerti',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }
    setIsLoading(true);
    promptAsync({ extraParams: { prompt: 'select_account' } })
      .then((res) => {
        if (!res || res.type === 'cancel' || res.type === 'dismiss') {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setModalConfig({
          visible: true,
          type: 'danger',
          title: 'Kendala Autentikasi Google',
          message: 'Layanan Google OAuth mendeteksi redirect URI yang belum terdaftar di Google Console. Silakan login menggunakan Email dan Kata Sandi.',
          confirmText: 'Mengerti',
          onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
        });
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Ionicons name="bag-handle" size={38} color="#D32F2F" />
          </View>
          <BrandLogo size={36} showDot={true} />
          <Text style={styles.subtitle}>{APP_SUBTITLE}</Text>
        </View>

        <View style={styles.formContainer}>
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
                placeholder="Masukkan kata sandi" 
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

          <TouchableOpacity style={styles.forgotPassword} onPress={handleOpenForgotModal} activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>Lupa Kata Sandi?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnPrimary, isLoading && styles.btnDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Masuk ke Aplikasi</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>ATAU</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity 
            style={[styles.btnGoogle, (!request || isLoading) && styles.btnDisabledGoogle]} 
            onPress={handleGoogleLogin}
            disabled={!request || isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-google" size={22} color="#DB4437" style={{ marginRight: 12 }} />
            <Text style={styles.btnGoogleText}>Masuk dengan Akun Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Mahasiswa baru?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.6}>
            <Text style={styles.linkText}> Buat Akun Sekarang</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      {/* MODAL LUPA PASSWORD */}
      <Modal
        visible={forgotModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setForgotModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Ionicons name="key-outline" size={32} color="#D32F2F" />
            </View>
            <Text style={styles.modalTitle}>Lupa Kata Sandi</Text>
            <Text style={styles.modalSubtitle}>
              Masukkan alamat email akunmu. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
            </Text>

            <View style={styles.modalInputBox}>
              <Ionicons name="mail-outline" size={20} color="#888" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.modalInput}
                placeholder="nama@gmail.com"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.btnModalPrimary, isResetting && { opacity: 0.6 }]}
              onPress={handleSendResetPassword}
              disabled={isResetting}
              activeOpacity={0.8}
            >
              {isResetting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnModalPrimaryText}>Kirim Tautan Reset</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnModalCancel}
              onPress={() => setForgotModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.btnModalCancelText}>Batal</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flex: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40, paddingHorizontal: 20 },
  iconWrapper: { backgroundColor: '#FDECEA', padding: 20, borderRadius: 24, marginBottom: 20, shadowColor: '#D32F2F', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  title: { fontSize: 32, fontWeight: '900', color: '#1A1A1A', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#888', marginTop: 8, letterSpacing: 0.5 },
  formContainer: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginLeft: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAEAEA', paddingHorizontal: 16, borderRadius: 14, height: 56, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1A1A1A' },
  forgotPassword: { alignItems: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { color: '#D32F2F', fontSize: 14, fontWeight: '600' },
  btnPrimary: { backgroundColor: '#D32F2F', padding: 18, borderRadius: 14, alignItems: 'center', shadowColor: '#D32F2F', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnDisabled: { backgroundColor: '#EF9A9A', shadowOpacity: 0, elevation: 0 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  divider: { flex: 1, height: 1, backgroundColor: '#EAEAEA' },
  dividerText: { marginHorizontal: 15, color: '#AAA', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  btnGoogle: { flexDirection: 'row', backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAEAEA', padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  btnDisabledGoogle: { opacity: 0.6 },
  btnGoogleText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, marginBottom: 20 },
  footerText: { color: '#888', fontSize: 15 },
  linkText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center' },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  modalInputBox: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, height: 48, marginBottom: 20 },
  modalInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },
  btnModalPrimary: { width: '100%', backgroundColor: '#D32F2F', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  btnModalPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnModalCancel: { width: '100%', paddingVertical: 10, alignItems: 'center' },
  btnModalCancelText: { color: '#888', fontSize: 14, fontWeight: '600' }
});

export default LoginScreen;
