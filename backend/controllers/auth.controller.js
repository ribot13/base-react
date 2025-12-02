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
        // ------------------------------------------------------------------
        // 1. CARI PENGGUNA (TERMASUK ROLE)
        // ------------------------------------------------------------------
        const user = await User.findOne({ 
            where: { username: username, is_active: 1, _deleted: 0 },
            include: [
                {
                    model: Role,
                    as: 'Roles', // Pastikan ini sesuai dengan alias di models/index.js
                    attributes: ['id', 'name', 'level'],
                    through: { attributes: [] } // Supaya tabel pivot tidak ikut mengotori output
                }
            ]
        });
        
        if (!user) {
            return res.status(401).json({ message: "Username atau password salah." });
        }

        // ------------------------------------------------------------------
        // 2. BANDINGKAN PASSWORD
        // ------------------------------------------------------------------
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Username atau password salah." });
        }

        // ------------------------------------------------------------------
        // 3. LOGIKA PENENTUAN ROLE TERTINGGI (Active Role)
        // ------------------------------------------------------------------
        // Kita ubah user instance jadi plain object dulu biar mudah dimanipulasi
        const userPlain = user.get({ plain: true });

        // Default value
        let highestRoleLevel = 0;
        let activeRoleObj = { id: null, name: 'user', level: 0 };

        // Cek apakah user punya roles
        if (userPlain.Roles && userPlain.Roles.length > 0) {
            // Urutkan Role dari Level Terbesar ke Terkecil (Descending)
            // Contoh: [ {name: 'superadmin', level: 4}, {name: 'staff', level: 1} ]
            userPlain.Roles.sort((a, b) => b.level - a.level);

            // Role pertama setelah diurutkan adalah role tertinggi
            const highestRole = userPlain.Roles[0];
            
            highestRoleLevel = highestRole.level;
            activeRoleObj = {
                id: highestRole.id,
                name: highestRole.name,
                level: highestRole.level
            };
        }

        // ------------------------------------------------------------------
        // 4. BUAT TOKEN & AMBIL PERMISSIONS
        // ------------------------------------------------------------------
        const tokenPayload = { 
            id: user.id, 
            username: user.username,
            role_level: highestRoleLevel // Berguna untuk middleware nanti
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Ambil Permission (Pastikan fungsi ini sudah di-import/tersedia)
        // Jika fungsi ini ada di file lain, pastikan sudah: const { getEffectivePermissionsFromDB } = require('../services/permissionService');
        const effectivePermissions = await getEffectivePermissionsFromDB(user.id);
        
        // ------------------------------------------------------------------
        // 5. KIRIM RESPONS
        // ------------------------------------------------------------------
        res.status(200).json({
            message: "Login berhasil!",
            token: token,
            user: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                email: user.email,
                
                // 🎯 PERBAIKAN UTAMA DI SINI:
                // Frontend mengharapkan object 'activeRole', bukan sekadar string 'role_name'
                activeRole: activeRoleObj,
                
                // Tetap kirim ini untuk backward compatibility logika frontend lainnya
                highestRoleLevel: highestRoleLevel, 
                
                // Kirim semua roles yang dimiliki
                Roles: userPlain.Roles,
            },
            permissions: effectivePermissions 
        });

    } catch (error) {
        console.error("💥 KESALAHAN SERVER (500) DI LOGIN:", error);
        res.status(500).json({ message: "Terjadi kesalahan server: " + error.message });
    }
}