// backend/middlewares/permission.middleware.js
const { UserPermission } = require('../models');

/**
 * Middleware untuk mengecek apakah user memiliki permission tertentu.
 * Menggunakan strategi JSON Cache untuk performa.
 */
exports.hasPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const user = req.user; // Dari verifyToken

            // 1. BYPASS SUPERADMIN
            // Superadmin (Level 99) boleh akses segalanya tanpa cek permission
            if (user.role === 'superadmin' || user.role_level === 99) {
                return next();
            }

            // 2. Ambil Permission User dari Tabel Cache (JSON)
            const userPermRecord = await UserPermission.findByPk(user.id);
            
            if (!userPermRecord || !userPermRecord.permissions) {
                return res.status(403).json({ 
                    message: "Akses Ditolak. Anda tidak memiliki izin apapun." 
                });
            }

            const myPermissions = userPermRecord.permissions; // Array string

            // 3. Cek apakah permission yang diminta ada di array user
            if (myPermissions.includes(requiredPermission)) {
                return next();
            }

            // Gagal
            return res.status(403).json({ 
                message: `Akses Ditolak. Membutuhkan izin: ${requiredPermission}` 
            });

        } catch (error) {
            console.error("Permission Error:", error);
            return res.status(500).json({ message: "Internal Server Error saat cek permission" });
        }
    };
};

/**
 * Middleware dummy jika Anda butuh mengambil permission tapi tidak memblokir
 * (Opsional, tergantung kebutuhan)
 */
exports.fetchPermissions = async (req, res, next) => {
    next(); 
};