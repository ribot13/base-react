// routes/index.js (Bundler untuk semua rute aplikasi)
const uploadRoutes = require('./upload.routes');
const authRoutes = require('./auth.routes');
const menuRoutes = require('./menu.routes');
const userRoutes = require('./user.routes');
const roleRoutes = require('./role.routes');
const productCategoryRoutes=require('./product.category.routes');
const productRoutes=require('./product.routes');
const catalogRoutes=require('./catalog.routes');
const stockRoutes = require('./stock.management.routes');

/**
 * Fungsi untuk mendaftarkan semua rute ke instance Express app.
 * @param {express.Application} app - Instance aplikasi Express.
 */
module.exports = (app) => {
    // Definisi rute: [BASE_PATH, ROUTER_MODULE]
    const routes = [
        ['/api/upload', uploadRoutes],
        ['/api/auth', authRoutes],
        ['/api/menu', menuRoutes],
        ['/api/profile', userRoutes],
        ['/api/admin/users', userRoutes],
        ['/api/roles', roleRoutes],
        ['/api/products/category', productCategoryRoutes],
        ['/api/products', productRoutes],
        ['/api/stock-management', stockRoutes],
        ['/api/catalogs', catalogRoutes],
    ];

    routes.forEach(([path, router]) => {
        app.use(path, router);
        //console.log(`[ROUTE] Terdaftar: ${path}`);
    });

    // 🎯 Opsi: Tambahkan rute fallback/root jika diperlukan
    //app.get('/', (req, res) => res.send('API Running!')); 
};