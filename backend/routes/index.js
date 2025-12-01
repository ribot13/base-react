// routes/index.js (Bundler untuk semua rute aplikasi)
const authRoutes = require('./auth.routes');
const menuRoutes = require('./menu.routes');
const userRoutes = require('./user.routes');
const roleRoutes = require('./role.routes');

/**
 * Fungsi untuk mendaftarkan semua rute ke instance Express app.
 * @param {express.Application} app - Instance aplikasi Express.
 */
module.exports = (app) => {
    // Definisi rute: [BASE_PATH, ROUTER_MODULE]
    const routes = [
        ['/api/auth', authRoutes],
        ['/api/menu', menuRoutes],
        ['/api/users', userRoutes],
        ['/api/roles', roleRoutes],
    ];

    routes.forEach(([path, router]) => {
        app.use(path, router);
        //console.log(`[ROUTE] Terdaftar: ${path}`);
    });

    // 🎯 Opsi: Tambahkan rute fallback/root jika diperlukan
    //app.get('/', (req, res) => res.send('API Running!')); 
};