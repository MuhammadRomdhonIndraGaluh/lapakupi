// src/constants/categories.js

export const LISTING_TYPES = [
  { id: 'all', label: 'Semua', icon: 'grid-outline' },
  { id: 'barang', label: 'Barang', icon: 'cube-outline' },
  { id: 'jasa', label: 'Jasa & Layanan', icon: 'construct-outline' },
];

export const KONDISI_OPTIONS = [
  { id: 'bekas', label: 'Bekas' },
  { id: 'baru', label: 'Baru' },
];

export const CATEGORIES = [
  { id: 'all', name: 'Semua', icon: 'apps-outline', type: 'all' },
  
  // Kategori Barang (General & Jelas)
  { id: 'buku', name: 'Buku & Literatur', icon: 'book-outline', type: 'barang' },
  { id: 'fashion', name: 'Pakaian & Fashion', icon: 'shirt-outline', type: 'barang' },
  { id: 'gadget', name: 'Elektronik & Gadget', icon: 'hardware-chip-outline', type: 'barang' },
  { id: 'kos', name: 'Perlengkapan Kos', icon: 'home-outline', type: 'barang' },
  { id: 'kendaraan', name: 'Kendaraan & Transport', icon: 'bicycle-outline', type: 'barang' },
  { id: 'hobi', name: 'Hobi & Olahraga', icon: 'football-outline', type: 'barang' },
  { id: 'makanan', name: 'Makanan & Danus', icon: 'fast-food-outline', type: 'barang' },
  
  // Kategori Jasa (General: Mencakup Semua Kebutuhan)
  { id: 'jasa_ketik', name: 'Pengetikan & Dokumen', icon: 'document-text-outline', type: 'jasa' },
  { id: 'jasa_desain', name: 'Desain & Grafis', icon: 'color-palette-outline', type: 'jasa' },
  { id: 'jasa_tutor', name: 'Bimbel & Edukasi', icon: 'school-outline', type: 'jasa' },
  { id: 'jasa_it', name: 'IT & Komputer', icon: 'laptop-outline', type: 'jasa' },
  { id: 'jasa_foto', name: 'Fotografi & Video', icon: 'camera-outline', type: 'jasa' },
  { id: 'jasa_titip', name: 'Jastip & Pindahan', icon: 'car-outline', type: 'jasa' },
  
  // Kategori Lainnya
  { id: 'lainnya', name: 'Lainnya', icon: 'ellipsis-horizontal-circle-outline', type: 'all' },
];

export const SORT_OPTIONS = [
  { id: 'terbaru', label: 'Terbaru', icon: 'time-outline' },
  { id: 'termurah', label: 'Termurah', icon: 'arrow-down-outline' },
  { id: 'termahal', label: 'Termahal', icon: 'arrow-up-outline' },
];

// Helper untuk mendapatkan nama & icon kategori berdasarkan id
export const getCategoryMeta = (categoryId) => {
  const found = CATEGORIES.find((c) => c.id === categoryId);
  return found || { id: 'lainnya', name: 'Lainnya', icon: 'pricetag-outline', type: 'all' };
};

// Helper untuk mengambil daftar kategori berdasarkan tipe ('barang' | 'jasa')
export const getCategoriesByType = (type) => {
  if (!type || type === 'all') return CATEGORIES.filter((c) => c.id !== 'all');
  return CATEGORIES.filter((c) => c.type === type || c.id === 'lainnya');
};
