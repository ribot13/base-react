// controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// 🎯 PERBAIKAN: Impor model Role
const { User, Role } = require('../models'); 
const { refreshUserPermissions } = require('../services/permissionService'); 


// ----------------------------------------------------
// HELPER DAN KONSTANTA UNTUK LOGIKA ROLE LEVEL
// ----------------------------------------------------

// 1. DEFINISI HIERARKI ROLE (Harus sinkron dengan frontend dan user.controller.js)
const ROLE_LEVELS = {
    'user': 1,
    'staff': 2,
    'admin': 3,
    'superadmin': 4,
};

/**
 * Helper function untuk mendapatkan level tertinggi dari role pengguna.
 * @param {Array<object>} userRoles - Array of objects, e.g., [{ name: 'admin' }, { name: 'user' }]
 * @returns {number} Level tertinggi.
 */
const getUserHighestLevel = (userRoles) => {
    if (!userRoles || userRoles.length === 0) return 0;

    let highestLevel = 0;
    userRoles.forEach(role => {
        const roleName = role.name.toLowerCase();
        // Ambil level, jika tidak ada di mapping, level = 0
        const level = ROLE_LEVELS[roleName] || 0; 
        if (level > highestLevel) {
            highestLevel = level;
        }
    });
    return highestLevel;
};


// ----------------------------------------------------
// FUNGSI LOGIN UTAMA (Revisi)
// ----------------------------------------------------

exports.login = async (req, res) => {
    try {
        // ... (Kode validasi user & password lama Anda tetap sama) ...
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Password salah" });
        
        // ... (sampai sini sama)

        // --- BAGIAN BARU: GENERATE PERMISSION SAAT LOGIN ---
        let permissions = [];
        
        // Jika Superadmin, beri tanda khusus atau array kosong (karena dia bypass)
        if (user.role === 'superadmin') {
            permissions = ['*']; // Wildcard marker
        } else {
            // Hitung ulang permission berdasarkan role level saat ini
            permissions = await refreshUserPermissions(user.id);
        }

        // Buat Token
        const token = jwt.sign(
            { id: user.id, role: user.role, role_level: user.role_level }, // Masukkan role_level ke token
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Kirim response lengkap ke Frontend
        res.json({
            message: "Login berhasil",
            token,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                role_level: user.role_level
            },
            permissions: permissions // <--- PENTING: Frontend butuh ini
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};