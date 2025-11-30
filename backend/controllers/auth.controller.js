// controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models'); // Asumsi model User diimpor
const { getEffectivePermissionsFromDB } = require('../services/permissionService'); // Fungsi yang sudah kita buat

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Cari Pengguna
        const user = await User.findOne({ where: { username: username, is_active: 1, _deleted: 0 } });
        
        if (!user) {
            return res.status(401).json({ message: "Username atau password salah." });
        }

        // 2. Bandingkan Password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Username atau password salah." });
        }

        // 3. Buat Payload JWT
        // HANYA masukkan data minimal (ID) untuk menjaga payload tetap kecil
        const tokenPayload = { 
            id: user.id, 
            username: user.username 
            // TIDAK perlu memasukkan 'role' di sini karena kita akan menggunakan permissions
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // 4. Ambil Izin Efektif (Kunci RBA)
        //console.log("LOG: Mulai mengambil izin efektif untuk user ID:", user.id);
        const effectivePermissions = await getEffectivePermissionsFromDB(user.id);
        //console.log("LOG: Izin efektif berhasil diambil:", effectivePermissions);

        // 5. Kirim Respons Berhasil
        res.status(200).json({
            message: "Login berhasil!",
            token: token,
            // Kirim data user minimal
            user: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
            },
            // KIRIM DAFTAR IZIN EFEKTIF KE FRONTEND
            permissions: effectivePermissions 
        });

    } catch (error) {
        console.error("💥 KESALAHAN SERVER (500) DI LOGIN:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat login." });
    }
};