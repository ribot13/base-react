// controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// 🎯 PERBAIKAN: Impor model Role
const { User, Role } = require('../models'); 
const { getEffectivePermissionsFromDB } = require('../services/permissionService'); 


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
    const { username, password } = req.body;

    try {
        // 1. Cari Pengguna (TERMASUK ROLE)
        const user = await User.findOne({ 
            where: { username: username, is_active: 1, _deleted: 0 },
            // 🎯 KRITIS: Tambahkan 'include' untuk relasi Many-to-Many (User->UserRole->Role)
            include: [{
                model: Role, 
                attributes: ['name'], // Hanya ambil nama role
                through: { attributes: [] } // Jangan sertakan kolom dari tabel pivot
            }]
        });
        
        if (!user) {
            return res.status(401).json({ message: "Username atau password salah." });
        }

        // 2. Bandingkan Password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Username atau password salah." });
        }

        // --- LOGIKA ROLE DAN LEVEL ---
        const userPlain = user.get({ plain: true });
        
        // A. Hitung Level Tertinggi
        const roleNames = userPlain.Roles.map(r => ({ name: r.name }));
        const highestRoleLevel = getUserHighestLevel(roleNames);
        
        // B. Tentukan Nama Role Tertinggi (Opsional, untuk tampilan/debug)
        let highestRoleName = 'user'; // Default
        for (const [name, level] of Object.entries(ROLE_LEVELS)) {
            if (level === highestRoleLevel) {
                // Ini akan memastikan jika Level 4 ditemukan, nama yang diambil adalah 'superadmin'
                highestRoleName = name; 
            }
        }
        // --- AKHIR LOGIKA ROLE DAN LEVEL ---
        
        // 3. Buat Payload JWT
        const tokenPayload = { 
            id: user.id, 
            username: user.username 
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // 4. Ambil Izin Efektif (Kunci RBA)
        const effectivePermissions = await getEffectivePermissionsFromDB(user.id);
        
        // 5. Kirim Respons Berhasil
        res.status(200).json({
            message: "Login berhasil!",
            token: token,
            // Kirim data user
            user: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                email:user.email,
                // 🎯 KRITIS: Kirim role name dan level
                role_name: highestRoleName, 
                highestRoleLevel: highestRoleLevel, // Frontend akan menggunakan ini
            },
            // KIRIM DAFTAR IZIN EFEKTIF KE FRONTEND
            permissions: effectivePermissions 
        });

    } catch (error) {
        console.error("💥 KESALAHAN SERVER (500) DI LOGIN:", error);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
}