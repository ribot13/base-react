// frontend/src/config/routesConfig.js

/**
 * Mendefinisikan semua rute statis di aplikasi
 * Path harus sesuai persis dengan yang ada di <Route path="">
 */
export const ROUTES_CONFIG = [
    // Rute Publik
    { path: '/', title: 'Beranda' },
    { path: '/products', title: 'Daftar Produk' },
    { path: '/products/detail/:id', title: 'Detail Produk' },
    { path: '/cart', title: 'Keranjang Belanja' },
    { path: '/login', title: 'Login Admin' },
    { path: '/checkout', title: 'Checkout' }, 
    { path: '/order-success', title: 'Pesanan Berhasil' },
    { path: '/track-order', title: 'Lacak Pesanan' },

    // Rute Admin
    { path: '/admin', title: 'Dashboard Admin' },
    // Produk
    { path: '/admin/products', title: 'Manajemen Produk' },
    { path: '/admin/products/create', title: 'Tambah Produk Baru' },
    { path: '/admin/products/edit/:id', title: 'Edit Produk' },
    { path: '/admin/products/category', title: 'Manajemen Kategori Produk' },
    { path: '/admin/products/category/create', title: 'Tambah Kategori Produk' },
    { path: '/admin/products/category/edit/:id', title: 'Edit Kategori Produk' },
    { path: '/admin/products/catalog', title: 'Manajemen Katalog Produk' },
    { path: '/admin/products/catalog/create', title: 'Buat Katalog Baru' },
    { path: '/admin/products/catalog/edit/:id', title: 'Edit Katalog' },
    { path: '/admin/products/variations/:id', title: 'Variasi Produk' },

    // User & Profil
    { path: '/admin/users', title: 'Manajemen Pengguna' },
    { path: '/admin/users/create', title: 'Tambah Pengguna' },
    { path: '/admin/users/edit/:id', title: 'Edit Pengguna' },
    { path: '/admin/profile', title: 'Edit Profil' },
    { path: '/admin/password', title: 'Ubah Password' },
    { path: '/admin/settings', title: 'Pengaturan Aplikasi' },
    // Pesanan
    { path: '/admin/orders', title: 'Manajemen Pesanan' },
    { path: '/admin/orders/create', title: 'Buat Pesanan Baru' },
    { path: '/admin/orders/detail/:id', title: 'Detail Pesanan' },
    { path: '/admin/orders/drafts', title: 'Draft Pesanan' },
    // Diskon
    { path: '/admin/discounts', title: 'Manajemen Diskon' },
    { path: '/admin/discounts/create', title: 'Buat Diskon Baru' },
    // Pelanggan
    { path: '/admin/customers', title: 'Manajemen Pelanggan' },
    { path: '/admin/customers/create', title: 'Tambah Pelanggan' },
    { path: '/admin/customers/edit/:id', title: 'Edit Pelanggan' },
    { path: '/admin/customers/resellers', title: 'Manajemen Reseller' },
    { path: '/admin/customers/resellers/create', title: 'Tambah Reseller' },
    { path: '/admin/customers/resellers/edit/:id', title: 'Edit Reseller' },
    { path: '/admin/customers/resellers/detail/:id', title: 'Detail Reseller' },

    //Blog
    { path: '/admin/blog', title:"Manajemen Blog"},
    { path: '/admin/blog/create', title:"Tulis Artikel"},
    { path: '/admin/blog/edit/:id', title:"Edit Artikel"},
    { path: '/admin/blog/categories', title:"Manajemen Kategori Blog"},
    { path: '/admin/blog/categories/create', title:"Tambah Kategori Blog"},
    { path: '/admin/blog/categories/edit/:id', title:"Edit Kategori Blog"},
    // Tambahkan User Management di sini nanti:
    // { path: '/admin/users', title: 'Manajemen Pengguna' },
];

/**
 * Fungsi pembantu untuk mencari detail rute berdasarkan pathname
 */
export const findRouteConfig = (pathname) => {
// ... sisa file ...
// (Tidak ada perubahan di bawah ini)
// ...
    // 1. Coba cari rute yang cocok secara persis
    const exactMatch = ROUTES_CONFIG.find(route => route.path === pathname);
    if (exactMatch) return exactMatch;

    // 2. Coba cari rute dengan parameter dinamis (seperti :id)
    // Ubah pathname dinamis menjadi RegEx, misalnya: /admin/products/edit/5 -> /admin/products/edit/:id
    const dynamicRoute = ROUTES_CONFIG.find(route => {
        // Ganti parameter dinamis (:id, :slug) dengan ekspresi RegEx
        const regexPath = route.path.replace(/:\w+/g, '([\\w-]+)');
        const regex = new RegExp(`^${regexPath}$`);
        
        // Cek apakah pathname saat ini (misalnya: /admin/products/edit/1) cocok
        return regex.test(pathname);
    });

    return dynamicRoute;
};

// Ekspor juga untuk Breadcrumbs
export const getRouteTitle = (path) => {
    const config = findRouteConfig(path);
    return config ? config.title : path;
};