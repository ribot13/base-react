const { MenuItem } = require('../models');

/**
 * Fungsi pembantu untuk mengubah daftar menu datar menjadi struktur hierarki (Tree).
 * Digunakan untuk menyajikan data ke Sidebar.jsx.
 * * @param {Array<Object>} flatData - Daftar datar semua item menu dari database.
 * @param {number|null} parentId - ID parent yang sedang diproses (null untuk root level).
 * @returns {Array<Object>} Struktur menu hierarki.
 */
const buildMenuHierarchy = (flatData, parentId = null) => {
    const tree = [];

    // Filter item yang sesuai dengan parentId saat ini.
    // PENTING: Menggunakan === untuk perbandingan ketat (null vs ID number).
    const items = flatData
        .filter(item => item.parent_id === parentId)
        .sort((a, b) => a.order_index - b.order_index);

    items.forEach(item => {
        // Cari children dari item saat ini secara rekursif.
        const children = buildMenuHierarchy(flatData, item.id);
        
        // Jika item memiliki children, tambahkan array 'Children'.
        if (children.length) {
            item.Children = children;
        }
        
        // Hanya tambahkan item yang memiliki path (link) atau memiliki children (folder).
        if (item.path || children.length > 0) {
            tree.push(item);
        }
    });
    return tree;
};


// --------------------------------------------------------------------
// A. ENDPOINT UNTUK SIDEBAR (DATA HIERARKI)
// --------------------------------------------------------------------

exports.getSidebarMenu = async (req, res) => {
    try {
        // Ambil semua item menu yang aktif
        const menuItems = await MenuItem.findAll({
            where: { is_active: true },
            // Order berdasarkan order_index, kemudian id (untuk stabilitas)
            order: [['order_index', 'ASC'], ['id', 'ASC']], 
            attributes: [
                'id', 'title', 'path', 'required_permission', 
                'icon_name', 'parent_id' 
            ]
        });

        // Ubah format data dari flat list menjadi hierarki.
        // Pemanggilan awal menggunakan parentId = null (default).
        const hierarchicalMenu = buildMenuHierarchy(
            menuItems.map(item => item.get({ plain: true }))
        );

        return res.status(200).json(hierarchicalMenu);

    } catch (error) {
        console.error("==========================================");
        console.error("ERROR FETCHING SIDEBAR MENU:", error.message);
        console.error("ERROR STACK:", error.stack);
        console.error("==========================================");

        console.error("Error fetching hierarchical menu items:", error);
        return res.status(500).json({ message: "Gagal mengambil data menu dari database." });
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