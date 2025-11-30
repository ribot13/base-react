// middlewares/permission.middleware.js
const { getEffectivePermissionsFromDB } = require('../services/permissionService'); // Sesuaikan path

/**
 * Middleware 1: Mengambil daftar izin efektif pengguna dan menyimpannya di req.user.permissions.
 * Harus dijalankan setelah verifyToken.
 */
exports.fetchPermissions = async (req, res, next) => {
    // Pastikan ID pengguna tersedia dari verifyToken
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Otentikasi diperlukan." });
    }
    
    // Lewati jika izin sudah ada di cache request
    if (req.user.permissions) {
        return next();
    }
    
    try {
        const effectivePermissions = await getEffectivePermissionsFromDB(req.user.id); 

        // Simpan izin di objek user request
        req.user.permissions = effectivePermissions;
        next();
        
    } catch (error) {
        console.error("Kesalahan saat memuat hak akses:", error);
        return res.status(500).json({ message: "Gagal memuat hak akses dari database." });
    }
};


/**
 * Middleware 2: Memeriksa apakah pengguna memiliki izin tertentu.
 * Harus dijalankan setelah fetchPermissions.
 * @param {string} requiredPermission - Nama izin yang dibutuhkan (misalnya 'create-pinjaman')
 */
exports.hasPermission = (requiredPermission) => {
    return (req, res, next) => {
        // Pastikan izin sudah dimuat
        if (!req.user || !req.user.permissions) {
            return res.status(403).json({ message: "Izin pengguna belum dimuat atau tidak tersedia." });
        }

        // Cek apakah izin yang dibutuhkan ada dalam daftar izin efektif
        const hasAccess = req.user.permissions.includes(requiredPermission);

        if (hasAccess) {
            next();
        } else {
            return res.status(403).json({ 
                message: `Akses ditolak. Anda tidak memiliki hak akses: ${requiredPermission}.` 
            });
        }
    };
};