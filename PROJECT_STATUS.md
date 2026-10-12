# Dokumentasi Status Proyek: LapakUPI

- **Terakhir Diperbarui:** 12 Oktober 2026
- **Pengembang:** Muhammad Ramdhan Indra Galuh (Pendidikan Ilmu Komputer 2024, Universitas Pendidikan Indonesia)
- **Nama Aplikasi:** LapakUPI
- **Platform:** React Native (Expo) & Firebase

---

## Ringkasan Proyek

LapakUPI adalah aplikasi direktori dan marketplace komunitas mahasiswa Universitas Pendidikan Indonesia (UPI) Bandung. Aplikasi ini memfasilitasi transaksi jual beli perlengkapan kuliah dan kebutuhan kos antar mahasiswa, serta penyediaan layanan jasa akademik dan umum di lingkungan kampus dan kawasan sekitarnya.

Dokumen ini mencatat arsitektur, daftar fitur yang telah diselesaikan, serta riwayat perubahan teknis sebagai rujukan pengembangan proyek.

---

## Arsitektur dan Teknologi

- **Framework**: React Native dengan Expo SDK
- **Manajemen Rute**: React Navigation (Native Stack Navigator & Bottom Tabs)
- **Backend & Database**: Firebase Cloud Firestore dan Firebase Authentication
- **Media & Kamera**: Expo Image Picker (kompresi gambar Base64 untuk efisiensi penyimpanan Firestore)
- **Desain & Ikon**: React Native SVG dan Expo Vector Icons (Ionicons)
- **Penyimpanan Lokal**: React Native Async Storage (untuk fitur simpan item/bookmark)

---

## Rincian Fitur yang Telah Selesai

### 1. Autentikasi dan Akun
- Pendaftaran akun baru dan login menggunakan email dan kata sandi via Firebase Authentication.
- Formulir pendaftaran yang rapi dan terpusat tanpa tombol kembali ganda, dengan pesan instruksi yang jelas.
- Dialog modal Lupa Kata Sandi terintegrasi untuk pengiriman tautan reset sandi ke email pengguna.
- Penanganan umpan balik informatif untuk login Google, menjelaskan kebutuhan otorisasi domain pada akun kampus.

### 2. Beranda dan Penjelajahan
- Daftar produk dan jasa ditampilkan secara dua kolom (grid layout) secara real-time dari Firestore.
- Segmented filter untuk memilah tampilan antara Semua, Barang, dan Jasa.
- Filter kategori horizontal (Buku & Modul, Elektronik, Kos & Kamar, Fashion, Makanan & Danus, Desain, IT, dsb.).
- Fitur pencarian instan berdasarkan nama barang, jasa, atau kata kunci deskripsi.
- Pengurutan katalog berdasarkan waktu rilis (Terbaru), harga termurah, dan harga tertinggi.
- Banner sambutan informatif yang bersih tanpa klaim berlebihan dan tanpa penggunaan kata "pasar".
- Header atas yang memuat logo resmi LapakUPI berlatar transparan serta shortcut ke halaman Informasi dan Profil.

### 3. Penambahan Barang dan Jasa
- Pilihan tipe unggahan fleksibel: Jual Barang atau Tawarkan Jasa.
- Pilihan kondisi fisik untuk barang: Baru atau Bekas.
- Fitur input lokasi mandiri: Penjual dapat mengisi titik lokasi spesifik atau area COD (misalnya Gerlong Girang, FPMIPA, Asrama UPI, atau Online).
- Pengambilan foto langsung melalui Kamera atau Galeri ponsel dengan pratinjau foto sebelum disimpan.
- Validasi formulir lengkap dengan modal dialog kustom.

### 4. Halaman Detail Produk dan Jasa
- Tampilan detail produk yang imersif mencakup galeri foto, badge tipe dan kategori, kondisi fisik, harga, dan tanggal posting.
- Keterangan lokasi spesifik barang/jasa dengan penanda ikon pin lokasi.
- Tombol kontak langsung via WhatsApp dengan warna hijau resmi (`#25D366`) yang konsisten untuk barang maupun jasa, dilengkapi pesan pembuka otomatis.
- Modal profil penjual yang memuat identitas akademik (Program Studi, Fakultas, Angkatan) dan nomor kontak penjual.
- Akses cepat untuk mengelola barang jika halaman detail dibuka oleh pemiliknya sendiri.

### 5. Pengelolaan Katalog Saya
- Menampilkan seluruh daftar barang dan jasa yang diunggah oleh pengguna yang sedang aktif.
- Opsi instan untuk mengubah status barang menjadi Terjual / Selesai atau mengaktifkannya kembali.
- Modal edit untuk memperbarui nama, tarif/harga, deskripsi, nomor kontak, serta memperbarui lokasi barang/jasa.
- Opsi hapus produk dari database dengan dialog konfirmasi pengaman.
- Label status dan badge kategori dirancang dengan tata letak responsif (flex-wrap), sehingga tidak terpotong saat teks panjang.

### 6. Desain Bilah Navigasi Bawah (Curved Tab Bar)
- Bilah navigasi bawah menggunakan latar belakang melengkung berbasis SVG dengan lekukan di bagian tengah.
- Tombol aksi bulat melayang di tengah khusus untuk menambah barang/jasa baru.
- Susunan menu navigasi yang seimbang: Beranda, Katalog, Tambah (tengah), Informasi, dan Profil.
- Tampilan bersih tanpa bayangan kotak yang mengganggu garis kurva.

### 7. Profil Mahasiswa dan Pusat Informasi
- Halaman profil mahasiswa dengan identitas akademik terstruktur dan avatar inisial nama.
- Tata letak header profil yang simetris dan aman dari benturan kamera poni ponsel (safe area context).
- Fitur Item Tersimpan (Bookmark) menggunakan penyimpanan lokal terisolasi per akun mahasiswa.
- Halaman Pusat Informasi yang memuat panduan transaksi aman di lingkungan kampus, titik rekomendasi COD di UPI, serta kontak pengembang.

---

## Struktur Data Koleksi Firestore

### Koleksi `products`
- `namaBarang`: String (nama produk atau judul jasa)
- `deskripsi`: String (detail spesifikasi atau ketentuan pemesanan)
- `harga`: Number (nominal harga jual atau tarif awal)
- `tipe`: String (`"barang"` atau `"jasa"`)
- `kategori`: String (id kategori dari daftar categories)
- `kondisi`: String atau null (`"baru"` atau `"bekas"`)
- `lokasi`: String (area COD atau jangkauan layanan, default: `"Sekitar Kampus UPI"`)
- `kontak`: String (nomor WhatsApp penjual)
- `imageUrl`: String (data gambar Base64)
- `sellerId`: String (UID akun pengunggah)
- `sellerEmail`: String (email akun pengunggah)
- `isSold`: Boolean (status ketersediaan barang/jasa)
- `createdAt`: String (timestamp ISO)
- `updatedAt`: String (timestamp ISO)

### Koleksi `users`
- `nama`: String (nama lengkap mahasiswa)
- `email`: String (email mahasiswa)
- `prodi`: String (program studi)
- `fakultas`: String (fakultas)
- `angkatan`: String (tahun angkatan)
- `noWa`: String (nomor kontak utama)
- `bio`: String (deskripsi singkat pengguna)
- `createdAt`: String (timestamp ISO)
