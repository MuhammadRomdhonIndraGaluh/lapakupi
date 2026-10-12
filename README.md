# LapakUPI 🛍️🎓

Platform Jual Beli Barang Bekas/Preloved & Layanan Jasa di Lingkungan Kampus Universitas Pendidikan Indonesia (UPI) Bandung.

---

## 📱 Tentang LapakUPI

**LapakUPI** adalah aplikasi mobile berbasis React Native & Expo yang dirancang khusus untuk memfasilitasi mahasiswa UPI dalam bertransaksi secara aman, mudah, dan terpercaya di lingkungan kampus. 

Aplikasi ini mencakup:
- **Jual Beli Barang Kampus**: Buku kuliah, perangkat elektronik, perlengkapan kos, pakaian, dan kebutuhan kuliah lainnya.
- **Tawarkan & Cari Jasa**: Jasa ketik/tugas, desain grafis/pamflet, fotografi, reparasi, tutor privat, hingga jasa pindahan/angkut kos.
- **Area & Lokasi Fleksibel**: Memudahkan COD di titik-titik sekitar kampus (Gerlong, FPMIPA, FIP, Asrama UPI, dll.).
- **Direct WhatsApp Chat**: Menghubungkan langsung pembeli dan penyedia jasa/penjual via WhatsApp resmi tanpa perantara yang rumit.

---

## ✨ Fitur Utama

- 🏠 **Beranda Interaktif**: Menampilkan daftar barang dan jasa terbaru dengan filter kategori, pencarian cepat, serta pengurutan harga/waktu.
- 📦 **Katalog Saya**: Kelola listing produk/jasa sendiri — ubah status barang (*Tersedia / Terjual*), edit deskripsi/harga/lokasi, atau hapus listing.
- ➕ **Tambah Iklan Mudah**: Upload foto langsung dari kamera atau galeri smartphone, tentukan harga, kategori, kondisi fisik, dan area COD.
- 📍 **Lokasi & Area Jangkauan**: Setiap barang dan jasa dilengkapi info lokasi spesifik di sekitar UPI.
- 🧭 **Navigasi Modern (Curved Notch Tab Bar)**: Desain bilah navigasi bawah lengkung estetik dengan tombol aksi mengambang (*floating action button*).
- 🔐 **Autentikasi Aman**: Pendaftaran dan login mahasiswa terintegrasi dengan Firebase Authentication & Firestore.
- 👤 **Profil & Bio Mahasiswa**: Menampilkan profil penjual, program studi, kontak, dan daftar listing aktif.

---

## 🛠️ Teknologi & Dependensi

- **Frontend**: [React Native](https://reactnative.dev/) (Expo SDK 52+)
- **Routing & Navigasi**: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- **Komponen Vektor & Kurva**: `react-native-svg`, `@expo/vector-icons`
- **Backend / Database**: [Firebase](https://firebase.google.com/) (Cloud Firestore & Firebase Authentication)
- **Media & Kamera**: `expo-image-picker`

---

## 🚀 Panduan Memulai (Instalasi Lokal)

### 1. Prasyarat
Pastikan komputer kamu sudah terinstall:
- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru)
- Aplikasi **Expo Go** di smartphone Android atau iOS

### 2. Clone Repositori
```bash
git clone https://github.com/<username-kamu>/lapakupi.git
cd lapakupi
```

### 3. Install Dependensi
```bash
npm install
```

### 4. Konfigurasi Firebase
Pastikan file konfigurasi Firebase kamu berada di `src/config/firebase.js` dengan kredensial project Firebase kamu.

### 5. Jalankan Aplikasi
```bash
npx expo start
```
- Pindai (scan) QR code menggunakan aplikasi **Expo Go** di smartphone kamu.

---

## 📂 Struktur Direktori Proyek

```
upi-preloved/
├── assets/                  # Logo, ikon aplikasi, dan gambar splash
├── src/
│   ├── components/          # Komponen UI (BrandLogo, CurvedTabBar, CustomModal)
│   ├── config/              # Konfigurasi Firebase Firestore & Auth
│   ├── constants/           # Konstanta kategori barang/jasa dan branding
│   ├── navigation/          # AppNavigator (Stack) & MainTabNavigator (Curved Tab)
│   └── screens/             # Halaman aplikasi (Home, AddProduct, Detail, Katalog, Login, Profil, dll.)
├── App.js                   # Entry point aplikasi
├── app.json                 # Konfigurasi Expo & metadata aplikasi
└── package.json             # Dependensi proyek
```

---

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan akademik dan komunitas mahasiswa Universitas Pendidikan Indonesia.
