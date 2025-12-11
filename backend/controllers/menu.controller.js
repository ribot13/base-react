const { MenuItem } = require('../models');

/**
 * Helper: Build Tree
 * Perubahan: Kita TIDAK memfilter berdasarkan show_in_menu di sini.
 * Semua data dikirim agar Breadcrumb bisa mendeteksi halaman 'Edit/Tambah'.
 */
// Helper: Membuat struktur pohon (Tree)
const buildMenuHierarchy = (flatData, parentId = null) => {
    const tree = [];
    const items = flatData
        .filter(item => item.parent_id === parentId)
        .sort((a, b) => a.order_index - b.order_index); // 👈 PENTING: Sorting di sini

    items.forEach(item => {
        // Ambil properti yang relevan (jika menggunakan raw: true)
        const itemData = { ...item }; 

        const children = buildMenuHierarchy(flatData, item.id);
        
        if (children.length) {
            itemData.Children = children;
        }
        
        tree.push(itemData);
    });
    return tree;
};

// GET - Sidebar Menu (Public/User)
exports.getSidebarMenu = async (req, res) => {
    try {
        // 1. Ambil data mentah (Flat)
        const rawItems = await MenuItem.findAll({
            where: { is_active: true }, // Hanya yang aktif
            order: [['order_index', 'ASC']],
            raw: true, // Ambil sebagai plain JSON object
            nest: true
        });

        // 2. Konversi ke Hierarchy (Tree)
        const menuTree = buildMenuHierarchy(rawItems);

        // 3. Kirim dengan format { menu: [], version: '...' }
        // Ini agar cocok dengan 'setSidebarMenu(data.menu)' di frontend
        return res.status(200).json({
            menu: menuTree,
            version: 'v1.0.1' // Anda bisa simpan versi ini di DB settings jika mau dinamis
        });

    } catch (error) {
        console.error("Sidebar Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

// --------------------------------------------------------------------
// B. ENDPOINT CRUD MENU (UNTUK HALAMAN ADMINISTRASI)
// --------------------------------------------------------------------

// GET - Mengambil semua item menu (daftar datar untuk CRUD)
exports.findAll = async (req, res) => {
    try {
        const rawItems = await MenuItem.findAll({
            // Tidak perlu filter is_active=true, karena ini halaman admin
            order: [['order_index', 'ASC'], ['id', 'ASC']], // Sorting dasar
            raw: true, 
            nest: true
        });

        const menuTree = buildMenuHierarchy(rawItems);
        
        // 3. Kirim data Tree
        return res.status(200).json(menuTree);
    } catch (error) {
        console.error("Error in menuController.findAll:", error);
        return res.status(500).json({ message: error.message });
    }
};

// POST - Membuat item menu baru
exports.create = async (req, res) => {
    try {
        const newMenuItem = await MenuItem.create(req.body);
        return res.status(201).json(newMenuItem);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// PUT - Mengupdate item menu
exports.update = async (req, res) => {
    try {
        const [updated] = await MenuItem.update(req.body, {
            where: { id: req.params.id }
        });

        if (updated) {
            const updatedItem = await MenuItem.findByPk(req.params.id);
            return res.status(200).json(updatedItem);
        }
        return res.status(404).json({ message: "Item menu tidak ditemukan." });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// DELETE - Menghapus item menu
exports.delete = async (req, res) => {
    try {
        const deleted = await MenuItem.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            return res.status(204).json(); // Status 204 No Content
        }
        return res.status(404).json({ message: "Item menu tidak ditemukan." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};