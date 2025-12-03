const { MenuItem } = require('../models');

/**
 * Helper: Build Tree
 * Perubahan: Kita TIDAK memfilter berdasarkan show_in_menu di sini.
 * Semua data dikirim agar Breadcrumb bisa mendeteksi halaman 'Edit/Tambah'.
 */
const buildMenuHierarchy = (flatData, parentId = null) => {
    const tree = [];
    const items = flatData
        .filter(item => item.parent_id === parentId)
        .sort((a, b) => a.order_index - b.order_index);

    items.forEach(item => {
        const children = buildMenuHierarchy(flatData, item.id);
        
        // Selalu sertakan children jika ada
        if (children.length) {
            item.Children = children;
        }
        
        // Masukkan ke tree (baik itu folder, link, atau hidden item)
        tree.push(item);
    });
    return tree;
};

exports.getSidebarMenu = async (req, res) => {
    try {
        // Ambil SEMUA item yang aktif (termasuk yang show_in_menu = 0)
        const menuItems = await MenuItem.findAll({
            where: { is_active: true }, 
            order: [['order_index', 'ASC'], ['id', 'ASC']], 
            // Pastikan mengambil kolom 'show_in_menu'
            attributes: [
                'id', 'title', 'path', 'required_permission', 
                'icon_name', 'parent_id', 'show_in_menu' 
            ]
        });

        // Konversi ke Hierarki
        const hierarchicalMenu = buildMenuHierarchy(
            menuItems.map(item => item.get({ plain: true }))
        );

        return res.status(200).json(hierarchicalMenu);

    } catch (error) {
        console.error("Error fetching menu:", error);
        return res.status(500).json({ message: "Gagal mengambil data menu." });
    }
};


// --------------------------------------------------------------------
// B. ENDPOINT CRUD MENU (UNTUK HALAMAN ADMINISTRASI)
// --------------------------------------------------------------------

// GET - Mengambil semua item menu (daftar datar untuk CRUD)
exports.findAll = async (req, res) => {
    try {
        const menuItems = await MenuItem.findAll({
            order: [['order_index', 'ASC']],
        });
        return res.status(200).json(menuItems);
    } catch (error) {
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