// controllers/role.controller.js
const { Role } = require('../models');

/**
 * Mengambil semua daftar Role yang tersedia
 * Digunakan oleh UserAdminPage untuk list role di modal form.
 * Endpoint: GET /api/roles
 */
exports.findAll = async (req, res) => {
    try {
        // Ambil semua role yang aktif (asumsi ada kolom _deleted)
        const roles = await Role.findAll({
            where: { _deleted: 0 },
            // Cukup ambil ID dan Nama untuk kebutuhan dropdown
            attributes: ['id', 'name', 'description'], 
            order: [['level', 'DESC']] // Urutkan berdasarkan level, Role tertinggi (Admin/Superadmin) di atas
        });

        res.status(200).json(roles);

    } catch (error) {
        console.error("💥 KESALAHAN SERVER (500) DI role.controller.findAll:", error);
        res.status(500).json({ message: "Gagal mengambil daftar roles.", error: error.message });
    }
};

// Anda akan menambahkan fungsi CRUD (create, update, delete) lainnya di sini
// jika Anda membuat halaman admin untuk Roles.