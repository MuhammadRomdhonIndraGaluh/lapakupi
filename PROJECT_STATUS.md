# 🚀 STATUS PROJECT: UPI PRELOVED
**Terakhir Diperbarui:** 11 Oktober 2026 (Malam)
**Developer:** Muhammad Ramdhan Indra Galuh (Ji) - Pilkom 24

File ini adalah **BACKUP PLAN (Otak Cadangan)** buat AI Antigravity, jaga-jaga kalau besok pas dibuka AI-nya amnesia / lupa ingatan.

---

## 🛠️ TEKNOLOGI YANG DIPAKAI
- **Framework:** React Native (Expo)
- **Database & Auth:** Firebase (Firestore & Authentication)
- **UI/UX Theme:** Tema warna resmi UPI (Merah #D32F2F, Hitam, Putih).
- **Struktur Navigasi:** `@react-navigation/native-stack`

## ✅ FITUR YANG SUDAH SELESAI HARI INI
1. **Login & Register:**
   - Udah pakai UI Premium (Safe Area, input rapi).
   - Bisa login pakai Email & Password.
   - Opsi Login Google udah disiapin (dengan `prompt: select_account`).
   - Fitur "Email Bebas" tanpa batasan email kampus.
2. **Koneksi Firebase:**
   - Masalah `auth already initialized` saat reload udah diperbaiki pakai blok `try-catch`.
   - Masalah `loading` muter-muter pas upload barang udah diakalin dengan `experimentalForceLongPolling: true` (biar lolos blokiran Wi-Fi kampus).
3. **Halaman Home (Katalog):**
   - Nampilin *Grid* 2 kolom daftar barang (*Real-time* dari Firestore).
   - Ada fitur **Search Bar** yang udah berfungsi memfilter barang.
   - Bersih dan fokus: Footer developer lama telah dipindahkan ke halaman Pusat Informasi tersendiri.
   - Dilengkapi tombol cepat navigasi ke Pusat Informasi dan Profil di header.
4. **Halaman Add Product (Jual Barang):**
   - Transisi *smooth*: Alert muncul duluan, pas diklik OK baru balik ke halaman Home.
   - **Upload Foto Asli:** Terintegrasi dengan `expo-image-picker`. Pengguna bisa ambil foto langsung lewat **Kamera** atau pilih dari **Galeri HP**, lengkap dengan live preview, tombol *Ganti*, dan *Hapus*.
   - Foto dikompresi otomatis dalam format Base64 berkualitas tinggi agar aman disimpan di Firestore tanpa ribet setel Firebase Storage rules / CORS, serta tetap memiliki fallback gambar jika belum punya foto.
5. **Halaman Detail Produk:**
   - Desain imersif, tombol panah ganda (bug) udah hilang.
   - Ada *Sticky Footer* (tombol WhatsApp) untuk langsung nge-chat penjual.
   - Status barang terjual terintegrasi: jika barang sudah laku, tombol WhatsApp dinonaktifkan otomatis.
   - Jika pemilik barang membuka detail barang miliknya, muncul tombol langsung "Kelola di Barang Jualan Saya".
6. **Halaman Profile:**
   - Menampilkan nama dan email aktif.
   - Tempat tombol khusus untuk **Keluar Akun (Logout)**.
   - Menu **"Barang Jualan Saya"** aktif dan langsung mengarah ke halaman kelola barang.
   - Menu **"Pusat Informasi & Panduan"** aktif untuk mengakses tutorial dan kontak developer.
7. **Halaman Barang Jualan Saya (My Products):**
   - Menampilkan daftar semua barang yang diunggah oleh user yang sedang login.
   - **Fitur Tandai Terjual / Aktifkan Kembali:** Memungkinkan penjual mengubah status barang menjadi Terjual / Tersedia secara instan.
   - **Fitur Edit Barang (Modal):** Memperbarui nama, harga, deskripsi, dan nomor kontak langsung tanpa berpindah halaman.
   - **Fitur Hapus Barang:** Menghapus barang dari Firestore dengan konfirmasi alert.
   - Sinkronisasi status *Terjual* langsung terlihat di Home Screen dan Detail Screen.
8. **Bottom Tab Navigation (Simetris & Estetik):**
   - Menggunakan `@react-navigation/bottom-tabs` dengan nuansa warna resmi UPI (#D32F2F).
   - Terdiri dari 5 menu simetris dengan tombol tambah barang tepat di tengah:
     - 🏠 **Beranda:** Katalog produk dan pencarian barang.
     - 📦 **Barang Saya:** Kelola, edit, dan cek status barang jualan sendiri.
     - ➕ **Jual (Center Button):** Tombol merah terangkat & menonjol persis di tengah untuk pengalaman pengguna yang estetik.
     - ℹ️ **Informasi:** Pusat panduan, tips COD aman kampus, profil developer Ji, dan kontak bisnis.
     - 👤 **Akun:** Profil mahasiswa dan tombol logout.
9. **Halaman Pusat Informasi & Panduan:**
   - **Tentang UPI Preloved:** Latar belakang dan visi platform marketplace mahasiswa UPI.
   - **Panduan & Tutorial:** Langkah-langkah cari barang, chat penjual WA, titik COD di kampus UPI, dan cara jual barang.
   - **Tips Aman Bertransaksi:** Panduan anti-penipuan & rekomendasi titik COD aman (Isola, Gymnasium, Perpus, Fakultas).
   - **Profil Pengembang:** Informasi resmi developer Ji (Pendidikan Ilmu Komputer 2024 / Pilkom 24 UPI).
   - **Kontak Bisnis & Kerjasama:** Tombol interaktif langsung ke Instagram (@ji.galuh) dan WhatsApp Bisnis.
10. **Fitur Favorit / Wishlist (Baru!):**
    - **Tombol Hati di Home:** Pengguna bisa langsung menekan tombol ❤️ pada kartu barang untuk menyimpan barang incaran.
    - **Tombol Hati di Detail Produk:** Floating action button ❤️ di pojok atas detail barang untuk bookmark cepat.
    - **Halaman Barang Favorit (FavoritesScreen):** Menampilkan semua barang yang disukai pengguna, lengkap dengan status ketersediaan dan opsi hapus dari favorit.
    - **Penyimpanan Lokal Super Cepat:** Menggunakan AsyncStorage terisolasi per ID akun mahasiswa (`@upi_preloved_favorites_${uid}`) sehingga instan dan dapat diakses kapan saja.
    - Terintegrasi langsung di menu **Profil Saya** ➜ **Barang Favorit**.
11. **Sistem Kategori Produk & Filter / Sortir Harga (Katalog Lengkap):**
    - **Kategori Kampus Terarah:** Buku & Modul, Almet & Fashion, Elektronik, Alat Kos, dan Lainnya (`src/constants/categories.js`).
    - **Pilihan Kategori di Form Tambah & Edit Barang:** Chip horizontal estetik dengan icon Ionicons dan penanda aktif merah UPI `#D32F2F`.
    - **Filter Kategori Horizontal di Home:** Pengguna dapat berpindah kategori secara instan di bawah search bar.
    - **Sortir 3 Mode:** Sortir barang berdasarkan **Terbaru** (waktu unggah), **Termurah** (harga terendah), dan **Termahal** (harga tertinggi).
    - **Badge Kategori Visual:** Tampil di setiap kartu katalog Home, halaman Detail Barang, dan daftar Barang Jualan Saya.
    - **Pencarian Cerdas & Tombol Reset:** Bar status menampilkan jumlah barang hasil filter dan tombol "Reset Filter" jika barang tidak ditemukan.
12. **Fitur Edit Profil Mahasiswa & Pembersihan Klaim Verifikasi:**
    - **Halaman Edit Profil Baru (`EditProfileScreen.js`):** Memungkinkan mahasiswa mengubah Nama Lengkap, Program Studi / Jurusan, Fakultas, Angkatan Kuliah, Nomor WhatsApp, dan Bio singkat.
    - **Sinkronisasi Ganda:** Menyimpan ke Firebase Authentication (`updateProfile` displayName) dan Cloud Firestore (`users/{uid}`).
    - **Hapus Total Badge "Akun Terverifikasi":** Menghapus badge verifikasi palsu di `ProfileScreen.js` dan `ProductDetailScreen.js`, diganti dengan rincian kampus nyata (Prodi, Angkatan, Penjual Mahasiswa UPI).
    - **Pembaruan Nama di Beranda:** Nama yang diubah di Edit Profil langsung tampil di sapaan Beranda (*"Selamat datang, [Nama Lengkap]"*).
13. **Foto Profil Asli, Modal Showcase Penjual & Custom UI Notifikasi:**
    - **Upload Foto Profil:** Mahasiswa dapat mengambil foto profil via Kamera atau Galeri HP di `EditProfileScreen.js` (kompresi Base64 ringan).
    - **Label Status Input Jelas:** Nama & WhatsApp berlabel merah **Wajib**, sedangkan Prodi, Fakultas, Angkatan, dan Bio berlabel **Opsional**.
    - **Custom Success Modal (UI Notif Mewah):** Pop-up notifikasi cantik dengan checkmark hijau besar, judul tebal, dan tombol konfirmasi yang menggantikan Alert kaku.
    - **Pembersihan Redundansi Menu Akun:** Menghapus item duplikat "Edit Data Diri" di menu bawah, menyisakan tombol estetik "Edit Profil" di header.
    - **Modal Showcase Penjual di Detail Produk:** Calon pembeli dapat mengklik kartu penjual di `ProductDetailScreen.js` untuk melihat foto profil, prodi, angkatan, bio penjual, dan tombol chat WhatsApp langsung.
14. **Ekspansi Marketplace Mahasiswa: Jual Beli Barang & Jasa / Layanan Kampus:**
    - **Dukungan 2 Tipe Listing (`LISTING_TYPES`):** Pengguna kini dapat memilih antara **Barang** dan **Jasa** di seluruh ekosistem aplikasi.
    - **Form Tambah Iklan Dinamis (`AddProductScreen.js`):** Segmented tab `[Barang] [Tawarkan Jasa]` yang secara otomatis menyesuaikan label input, tarif, kategori pilihan, dan pesan konfirmasi simpan.
    - **Filter Tipe & Kategori di Beranda (`HomeScreen.js`):** Segmented type selector (`[Semua] [Barang] [Jasa]`) yang memfilter kategori dan produk secara interaktif, kartu ber-badge biru khusus jasa, dan format tarif (`Mulai Rp...`).
    - **Detail Jasa & Kontak Khusus (`ProductDetailScreen.js`):** Badge ganda tipe & kategori, format tarif fleksibel, serta template pesan WhatsApp otomatis yang disesuaikan ("Halo, saya tertarik dengan layanan/jasa...").
    - **Manajemen Iklan Saya (`MyProductsScreen.js`):** Kartu berlabel tipe, status ketersediaan cerdas (Aktif / Penuh / Terjual), serta Modal Edit yang mendukung pengubahan tipe dan kategori secara instan.
15. **Penyempurnaan Total Berdasarkan Feedback Suara (Voice Note Refinement):**
    - **Kategori Lebih Umum & Universal (`src/constants/categories.js`):** Mengganti kategori yang terlalu sempit menjadi kategori umum (misal: "Pengetikan & Dokumen" agar mencakup laporan/makalah/skripsi, "Desain & Grafis", "Bimbel & Edukasi", "IT & Komputer", dsb).
    - **Pembersihan Total Emoji Menjadi Clean Vector Icons:** Seluruh emoji dihapus dari nama kategori, tombol tipe, badge status, dan dialog. Semua digantikan oleh vector icon Ionicons yang rapi dan elegan.
    - **Upload Foto WAJIB (Mandatory):** Menghapus catatan ilustrasi opsional dan mewajibkan unggah foto sebelum iklan barang/jasa dapat disimpan.
    - **Placeholder Sederhana & Profesional:** Seluruh placeholder formulir diperbaiki menjadi contoh yang rapi, ringkas, dan relevan.
    - **Fleksibilitas Kondisi Barang (Lepas dari Konsep Preloved yang Kaku):** Menambahkan pilihan kondisi barang **Baru** dan **Bekas** pada form pasang iklan, modal edit, dan kartu katalog.
    - **Penghapusan Tag "Bisa Nego":** Menghilangkan badge "Bisa Nego" di seluruh aplikasi agar penjual dapat menuliskannya langsung secara fleksibel di deskripsi.
    - **Banner Sambutan Kawasan UPI Bumi Siliwangi di Beranda:** Menampilkan header sambutan ramah bahwa pasar ini mencakup jual beli barang & jasa di sekitar lingkungan Kampus UPI Bumi Siliwangi dan sekitarnya.
    - **Navbar Diperbarui Menjadi "Iklan Saya" & Tombol "Pasang":** Mengganti nama tab "Barang Saya" menjadi "Iklan Saya" dan tombol tengah menjadi "Pasang" agar mencakup barang dan jasa.
16. **Penyempurnaan Natural Scrolling, Pembersihan Kata "Iklan", Kategori Makanan & Danus, serta Overhaul Profil:**
    - **Natural Seamless Scrolling di Beranda (`HomeScreen.js`):** Memindahkan Search Bar, Banner Bumi Siliwangi, Filter Tipe, dan Chips Kategori ke dalam `ListHeaderComponent` FlatList. Seluruh komponen atas kini ikut ter-scroll secara mulus bersama daftar produk sehingga layar terasa luas dan nyaman.
    - **Pembersihan Menyeluruh Istilah "Iklan":**
      - Tab navigasi bawah diubah menjadi **"Katalog Saya"** (dengan ikon `albums-outline`).
      - Tombol tengah diubah menjadi **"Tambah"**.
      - Halaman form diubah menjadi **"Tambah Barang / Jasa"** dan tombol submit menjadi **"Publikasikan Sekarang"**.
      - Menghilangkan kata iklan di detail pesan WhatsApp, modal edit, dan teks instruksi aplikasi.
    - **Penambahan Kategori Baru "Makanan & Danus" (`src/constants/categories.js`):** Mendukung mahasiswa/organisasi yang berjualan snack, minuman, kuliner, dan danus kepanitiaan dengan ikon `fast-food-outline`.
    - **Overhaul Total Tampilan Profil Akun (`ProfileScreen.js`):**
      - Hero Card modern dengan avatar ber-badge edit kamera, Nama tebal, Email mahasiswa, badge civitas UPI, dan Bio quote.
      - Tombol **"Ubah Data Profil"** yang proporsional, elegan, dan mudah diakses tepat di hero header.
      - **Kartu Identitas Akademik Kampus (KTM Digital):** Menampilkan rincian Fakultas, Program Studi, Angkatan Kuliah, dan WhatsApp Transaksi secara terstruktur rapi. Jika data belum lengkap, terdapat banner notifikasi ramah untuk melengkapi data profil.
      - Menu aktivitas yang selaras dan tombol Logout yang aman.

17. **Refinement Presisi UI/UX, Harmonisasi Palet Warna & Custom Modal Terpadu (12 Oktober 2026):**
    - **Tombol Tambah Navbar Presisi di Tengah (`MainTabNavigator.js`):** Tombol bulat merah (+) diatur menggunakan custom wrapper flexbox yang presisi, simetris, dan terpusat di antara 5 menu navigasi.
    - **Penyederhanaan Tab Navigasi & Profil:** Tab dan menu profil kini diseragamkan dengan nama **"Katalog"** (subjudul: *"Kelola semua barang dan jasa jualan kamu"*).
    - **Banner Beranda Objektif & Profesional (`HomeScreen.js`):** Menghilangkan narasi berlebihan/overclaim *"platform transaksi terpercaya"*, digantikan dengan deskripsi objektif: *"Direktori Barang & Jasa Mahasiswa - Sarana informasi jual beli barang dan penawaran jasa mahasiswa di kawasan Kampus UPI Bumi Siliwangi dan sekitarnya"*.
    - **Custom Dialog & Notification Modal Terpadu (`src/components/CustomModal.js`):** 
      - Dibuat komponen modal modern menggantikan seluruh `Alert.alert` bawaan HP.
      - Mendukung tipe `success`, `warning`, `danger`, `logout`, dan `info`.
      - Diterapkan pada: Form validasi tambah barang, modal keluar akun (logout), konfirmasi & notifikasi hapus barang, notifikasi simpan status & edit barang, registrasi akun, dan pusat informasi.
    - **Transisi "Barang Favorit" ➔ "Item Tersimpan" (Bookmark):**
      - Istilah diganti dari *"Barang Favorit"* menjadi *"Item Tersimpan"* (disimpan untuk ditinjau nanti).
      - Menghapus emoji hati (❤️) dan diganti dengan icon vector Ionicons `bookmark` / `bookmark-outline`.
      - Berlaku konsisten di Home Screen, Detail Produk, Halaman Tersimpan (`FavoritesScreen.js`), Header Navigasi, dan Menu Profil.
    - **Harmonisasi Color Palette:** Menghilangkan aksen warna pink acak (`#FFF0F0`, `#FFF8F8`) dan biru yang bentrok, diganti palet warna netral modern (`#FFFFFF`, `#F8F9FA`, border `#E5E7EB` / `#ECEFF1`) dengan aksen merah resmi UPI (`#D32F2F`).
    - **Eliminasi Fitur Foto Profil (Efisiensi Database):** Fitur upload foto profil di `EditProfileScreen.js` dan `ProfileScreen.js` dihapus agar tidak membebani database Firestore dengan data base64. Diganti dengan Avatar Inisial Nama mahasiswa yang elegan dan modern.
    - **Pembersihan Istilah Alay:** Mengganti label *"Civitas UPI Bumi Siliwangi"* di profil menjadi *"Mahasiswa UPI"*.
    - **Integrasi WhatsApp Dinamis Sesuai Nomor Penjual:** Tombol WhatsApp di detail produk langsung mengarahkan ke nomor HP yang diisi oleh pengunggah barang/jasa (`product.kontak || sellerData.noWa`), lengkap dengan sanitasi nomor (`62...`) dan template pesan interaktif yang ramah.
    - **Fitur Lupa Kata Sandi & Login Email Gmail Bebas:**
      - Ditambahkan dialog modal Lupa Kata Sandi di `LoginScreen.js` menggunakan Firebase `sendPasswordResetEmail`.
      - Form Login dan Register mendukung email apa pun (`@gmail.com`) secara bebas tanpa dipaksa `@upi.edu`.

18. **Penyempurnaan Privasi Akun, Header Ikonik, Tombol Navigasi Presisi & Branding Terpusat (12 Oktober 2026 - Sore):**
    - **Privasi Email Terjaga (Anti-Bocor):** Menghilangkan tampilan email penjual (`sellerEmail`) saat pengguna lain melihat profil/modal penjual di `ProductDetailScreen.js`. Hanya menampilkan Nama, Kampus, Prodi, Angkatan, dan tombol WhatsApp.
    - **Penyederhanaan Greeting & Banner Beranda (`HomeScreen.js`):** Sapaan beranda diubah menjadi lebih hangat dan ramah (*"Halo, [Nama / Teman Kampus]"*), serta banner sambutan disederhanakan menjadi *"Pasar Mahasiswa - Temukan perlengkapan kuliah, kebutuhan kos, dan berbagai jasa bermanfaat di lingkungan kampus"*.
    - **Tombol Tambah Navbar Presisi 100% di Tengah (`MainTabNavigator.js`):** Menghilangkan batasan lebar statis `width: 60` pada wrapper tombol tambah sehingga flex-1 cell terbagi rata 20% secara matematis dan tombol bulat merah (+) berada tepat di titik tengah horizontal layar.
    - **Branding & Penamaan Terpusat (`src/constants/branding.js`):** Dibuat konstanta `APP_NAME` agar nama baru aplikasi dapat ditentukan dan diubah di satu file kapan saja tanpa perlu mencari-cari di puluhan file.
    - **Label Form Otentikasi Bersih:** Label input di `LoginScreen.js` dan `RegisterScreen.js` disederhanakan menjadi cukup *"Email"* tanpa tanda kurung `(Gmail / Email Bebas)` atau `(Gmail / Email Kampus)`, dan placeholder dibuat bersih.
    - **Penanganan Google Sign-In yang Ramah & Jelas:** Menambahkan feedback modal informatif saat koneksi Google OAuth memerlukan registrasi URI redirect / Client ID di Google Cloud Console, sehingga pengguna tidak bingung dan diarahkan masuk via Email & Password.
    - **Harmonisasi Warna Ikon Profil (`ProfileScreen.js`):** Ikon menu "Pusat Informasi & Panduan" yang sebelumnya berwarna biru telah diselaraskan menjadi warna merah resmi UPI (`#D32F2F`).
    - **Pembaruan Kontak Resmi Developer di Halaman Informasi (`InfoScreen.js`):** Nomor WhatsApp diperbarui ke `0895-1944-4728` (`6289519444728`) dan tautan Instagram ke `@galuh.ind` (`https://instagram.com/galuh.ind`).
    - **Ikon Estetik di Atas Judul Halaman:**
      - Halaman Katalog (`MyProductsScreen.js`): Ditambahkan icon bulat `albums-outline` tepat di atas judul *"Katalog Saya"*.
      - Halaman Pusat Informasi (`InfoScreen.js`): Ditambahkan icon bulat `information-circle-outline` tepat di atas judul *"Pusat Informasi"*.
      - Halaman Akun (`ProfileScreen.js`): Ditambahkan icon bulat `person-circle-outline` tepat di atas judul *"Akun Saya"*.
      - System header bawaan tab bar disembunyikan sehingga tampilan atas halaman rapi dan lega.

---

## 🆘 CARA PAKAI BACKUP INI BESOK (JIKA AI LUPA)
Kalau besok kamu buka aplikasi Antigravity dan kerasa respon AI-nya "ngaco" atau lupa sama *project* ini, cukup **copy-paste** pesan di bawah ini ke kolom chat:

> *"Halo AI, tolong baca file `PROJECT_STATUS.md` di folder root aplikasiku sekarang. Itu adalah catatan sejarah dan rangkuman kode kita. Setelah kamu membacanya, mari kita lanjutkan mengerjakan aplikasi UPI Preloved ini!"*
