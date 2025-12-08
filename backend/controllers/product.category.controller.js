// backend/controllers/product.category.controller.js
const { ProductCategory } = require('../models');
const { Op } = require('sequelize');

// Helper simple untuk membuat slug
const createSlug = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Ganti spasi dengan -
        .replace(/[^\w\-]+/g, '')       // Hapus karakter non-word
        .replace(/\-\-+/g, '-')         // Ganti multiple - dengan single -
        .replace(/^-+/, '')             // Trim - dari depan
        .replace(/-+$/, '');            // Trim - dari belakang
};

// 1. GET ALL
exports.findAll = async (req, res) => {
    try {
        const categories = await ProductCategory.findAll({
            include: [{
                model: ProductCategory,
                as: 'Parent',
                attributes: ['id', 'name']
            }],
            order: [['order_index', 'ASC']]
        });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. GET ONE BY ID
exports.findOne = async (req, res) => {
    try {
        const category = await ProductCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: "Kategori tidak ditemukan" });
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. CREATE
exports.create = async (req, res) => {
    try {
        const { name, parent_id, description, visibility, order_index } = req.body;
        
        // Generate slug otomatis jika tidak dikirim
        let slug = req.body.slug;
        if (!slug && name) {
            slug = createSlug(name);
        }

        const newCategory = await ProductCategory.create({
            name,
            parent_id: parent_id || null, // Pastikan null jika kosong
            slug,
            description,
            visibility,
            order_index: order_index || 0
        });

        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. UPDATE
exports.update = async (req, res) => {
    try {
        const { name, parent_id, slug, description, visibility, order_index } = req.body;
        
        // Cek circular dependency sederhana (Parent tidak boleh dirinya sendiri)
        if (parent_id && parseInt(parent_id) === parseInt(req.params.id)) {
            return res.status(400).json({ message: "Kategori tidak bisa menjadi parent bagi dirinya sendiri." });
        }

        const category = await ProductCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: "Kategori tidak ditemukan" });

        // Update slug jika nama berubah dan slug tidak diset manual
        let finalSlug = slug;
        if (!finalSlug && name !== category.name) {
            finalSlug = createSlug(name);
        }

        await category.update({
            name,
            parent_id: parent_id || null,
            slug: finalSlug,
            description,
            visibility,
            order_index
        });

        res.status(200).json({ message: "Kategori berhasil diupdate" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. DELETE
exports.delete = async (req, res) => {
    try {
        const category = await ProductCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: "Kategori tidak ditemukan" });

        // Opsional: Cek apakah punya children sebelum hapus
        const children = await ProductCategory.count({ where: { parent_id: req.params.id } });
        if (children > 0) {
            return res.status(400).json({ message: "Tidak dapat menghapus kategori yang memiliki sub-kategori." });
        }

        await category.destroy();
        res.status(200).json({ message: "Kategori berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. UPDATE ORDER (BARU)
exports.updateOrder = async (req, res) => {
    const { categoryId, siblingId, categoryOrder, siblingOrder } = req.body;
    
    // Pastikan Sequelize terinisialisasi
    if (!ProductCategory.sequelize) {
        return res.status(500).json({ message: "Database connection not initialized." });
    }

    // Gunakan transaksi untuk memastikan kedua update berhasil atau keduanya gagal
    try {
        await ProductCategory.sequelize.transaction(async (t) => {
            // 1. Update order_index kategori utama (Tukar dengan order_index sibling)
            await ProductCategory.update({ order_index: siblingOrder }, {
                where: { id: categoryId },
                transaction: t
            });

            // 2. Update order_index kategori sibling (Tukar dengan order_index kategori utama)
            await ProductCategory.update({ order_index: categoryOrder }, {
                where: { id: siblingId },
                transaction: t
            });
        });

        res.status(200).json({ message: "Urutan kategori berhasil diperbarui." });
    } catch (error) {
        console.error("Error updating category order:", error);
        res.status(500).json({ message: "Gagal memperbarui urutan: " + error.message });
    }
};