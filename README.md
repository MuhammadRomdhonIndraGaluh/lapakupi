# LapakUPI

Aplikasi jual beli barang dan penawaran jasa untuk mahasiswa di lingkungan Universitas Pendidikan Indonesia (UPI) Bandung.

---

## Tentang Proyek

LapakUPI adalah aplikasi mobile berbasis React Native dan Expo yang dibuat untuk mempermudah mahasiswa UPI dalam bertransaksi di sekitar kampus. Aplikasi ini menjadi wadah bagi mahasiswa yang ingin menjual perlengkapan kuliah atau kebutuhan kos yang sudah tidak terpakai, sekaligus memfasilitasi mahasiswa yang ingin menawarkan berbagai layanan jasa seperti pengetikan tugas, desain grafis, les privat, hingga fotografi.

Dengan basis komunitas kampus, transaksi dapat dilakukan secara langsung (COD) di titik-titik yang disepakati di lingkungan kampus atau sekitar Gerlong.

---

## Fitur Utama

- **Katalog Barang dan Jasa**: Menampilkan produk dan layanan yang ditawarkan mahasiswa dengan pembagian kategori yang jelas serta fitur pencarian cepat.
- **Informasi Lokasi dan Area COD**: Setiap barang dan jasa dilengkapi keterangan lokasi spesifik penjual (misalnya Gerlong Girang, FPMIPA, Asrama UPI, atau Online).
- **Kontak Langsung via WhatsApp**: Calon pembeli dapat langsung menghubungi penjual atau penyedia jasa melalui tombol WhatsApp dengan template pesan otomatis.
- **Katalog Saya**: Halaman pengelolaan produk milik pengguna untuk memperbarui data, mengubah harga/lokasi, menandai barang yang sudah terjual/selesai, atau menghapus listing.
- **Tambah Barang dan Jasa**: Formulir unggah dengan dukungan pengambilan foto dari kamera atau galeri, penentuan kondisi barang (baru/bekas), kategori, dan tarif.
- **Item Tersimpan**: Fitur penanda (bookmark) untuk menyimpan barang atau jasa yang ingin ditinjau kembali di kemudian hari.
- **Navigasi Melengkung**: Bilah navigasi bawah dengan model lengkungan tengah dan tombol aksi melayang untuk menambah postingan baru.
- **Akun dan Profil Mahasiswa**: Halaman profil yang memuat identitas akademik mahasiswa (Program Studi, Fakultas, Angkatan) serta pengaturan akun.

---

## Teknologi yang Digunakan

- **Framework**: React Native dengan Expo
- **Navigasi**: React Navigation (Native Stack dan Bottom Tabs)
- **Komponen Visual**: React Native SVG dan Expo Vector Icons
- **Backend dan Database**: Firebase (Cloud Firestore dan Authentication)
- **Pengolahan Gambar**: Expo Image Picker
- **Penyimpanan Lokal**: React Native Async Storage

---

## Cara Menjalankan Proyek

### Prasyarat
- Node.js (versi 18 atau lebih baru)
- Aplikasi Expo Go di perangkat Android atau iOS

### Langkah Instalasi

1. Salin repositori ini:
   ```bash
   git clone https://github.com/MuhammadRomdhonIndraGaluh/lapakupi.git
   cd lapakupi
   ```

2. Pasang semua dependensi proyek:
   ```bash
   npm install
   ```

3. Konfigurasi Firebase:
   Pastikan konfigurasi Firebase pada file `src/config/firebase.js` sudah sesuai dengan project Firebase yang digunakan.

4. Jalankan server lokal:
   ```bash
   npx expo start
   ```

5. Buka aplikasi Expo Go pada smartphone dan pindai kode QR yang muncul di terminal.

---

## Struktur Direktori

```
upi-preloved/
├── assets/                  # Aset gambar, logo resmi, dan ikon aplikasi
├── src/
│   ├── components/          # Komponen antarmuka (CurvedTabBar, BrandLogo, CustomModal)
│   ├── config/              # Konfigurasi koneksi Firebase (Auth & Firestore)
│   ├── constants/           # Definisi kategori produk/jasa dan branding aplikasi
│   ├── navigation/          # Pengaturan alur navigasi aplikasi
│   ├── screens/             # Halaman antarmuka pengguna
│   └── utils/               # Fungsi utilitas pembantu
├── App.js                   # Entry point aplikasi
├── app.json                 # Konfigurasi proyek Expo
└── package.json             # Daftar pustaka dan dependensi proyek
```

---

## Pengembang

Dikembangkan oleh Muhammad Ramdhan Indra Galuh (Pendidikan Ilmu Komputer, Universitas Pendidikan Indonesia) untuk memenuhi kebutuhan transaksi yang praktis dan aman bagi civitas akademika UPI.
