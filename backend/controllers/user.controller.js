// controllers/user.controller.js
const { User, Role } = require('../models'); // Asumsikan Anda memiliki model User dan Role
const DEFAULT_LIMIT = 10;

// Logika mengambil semua user dengan paginasi
exports.findAll = async (req, res) => {
    try {
        // 🎯 PERUBAHAN KRITIS 1: Ambil 'limit' dan 'page' dari req.query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || DEFAULT_LIMIT; 
        
        // Pastikan page dan limit adalah angka positif
        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: "Parameter 'page' dan 'limit' harus berupa angka positif." });
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            attributes: ['id', 'full_name', 'username', 'email', 'is_active', 'created_at'],
            // Tambahkan relasi Role jika Anda ingin menampilkan peran pengguna
            include: [{
                model: Role,
                attributes: ['name'],
                through: { attributes: [] } 
            }],
            limit: limit, // 🎯 Gunakan nilai 'limit' dari request
            offset: offset,
            order: [['id', 'DESC']]
        });

        // Format data roles agar lebih mudah dikonsumsi frontend
        const users = rows.map(user => ({
            ...user.get({ plain: true }),
            roles: user.Roles.map(role => role.name).join(', ') 
        }));

        res.status(200).json({
            data: users,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            itemsPerPage: limit // 🎯 Kirim kembali limit yang digunakan
        });

    } catch (error) {
        console.error("Kesalahan saat mengambil daftar pengguna:", error);
        res.status(500).json({ message: "Gagal mengambil data pengguna." });
    }
};

// Logika membuat user baru (Placeholder)
exports.create = async (req, res) => {
    // ⚠️ TODO: Implementasi logika validasi input, hashing password, dan penugasan role.
    // Contoh sederhana:
    res.status(501).json({ message: "Endpoint create belum diimplementasikan." });
};

// Logika mengupdate user (Placeholder)
exports.update = async (req, res) => {
    // ⚠️ TODO: Implementasi logika update user, termasuk mengganti role dan password.
    res.status(501).json({ message: "Endpoint update belum diimplementasikan." });
};

// Logika menghapus user (Placeholder)
exports.delete = async (req, res) => {
    // ⚠️ TODO: Implementasi logika penghapusan user.
    res.status(501).json({ message: "Endpoint delete belum diimplementasikan." });
};