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

// Helper untuk memastikan parent_id adalah INT atau NULL
const parseParentId = (id) => {
    // Jika null, undefined, atau string kosong, kembalikan null
    if (id === null || id === undefined || id === "") return null;
    
    const parsedId = parseInt(id);
    // Jika NaN atau 0 (sering dianggap null di form), kembalikan null, jika tidak, kembalikan ID
    return isNaN(parsedId) || parsedId === 0 ? null : parsedId;
};

// Helper untuk mendapatkan order index tertinggi + 1 untuk Parent ID tertentu
const getNextOrderIndex = async (parentId) => {
    const maxOrder = await ProductCategory.max('order_index', {
        where: { parent_id: parentId }
    });
    // Order index berikutnya adalah Max Order yang ada (atau 0 jika belum ada) + 1
    return (maxOrder || 0) + 1;
};

// --- END OF HELPER ---


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

// 3. CREATE (Revisi Total)
exports.create = async (req, res) => {
    const { name, parent_id, slug, description, visibility } = req.body;
    
    // Validasi dasar
    if (!name) return res.status(400).json({ message: "Nama kategori wajib diisi." });

    try {
        const parsedParentId = parseParentId(parent_id);
        let finalSlug = slug || createSlug(name);
        
        // 1. Cek duplikasi slug
        const existingCategory = await ProductCategory.findOne({ where: { slug: finalSlug } });
        if (existingCategory) {
            return res.status(400).json({ message: "Slug sudah digunakan. Silakan gunakan nama/slug lain." });
        }
        
        // 2. Tentukan order_index secara otomatis
        const nextOrderIndex = await getNextOrderIndex(parsedParentId);

        const newCategory = await ProductCategory.create({
            name,
            parent_id: parsedParentId, 
            slug: finalSlug,
            description,
            visibility,
            order_index: nextOrderIndex, // Order index dihitung otomatis
        });

        res.status(201).json(newCategory);
    } catch (error) {
        console.error("Error creating category:", error.message);
        res.status(500).json({ message: "Gagal membuat kategori: " + error.message });
    }
};

// 4. UPDATE (Revisi Total)
exports.update = async (req, res) => {
    try {
        const { name, parent_id, slug, description, visibility, order_index } = req.body;
        const categoryId = req.params.id;

        const category = await ProductCategory.findByPk(categoryId);
        if (!category) return res.status(404).json({ message: "Kategori tidak ditemukan" });
        
        // Validasi dasar
        if (!name) return res.status(400).json({ message: "Nama kategori wajib diisi." });
        
        const parsedParentId = parseParentId(parent_id);

        // 1. Pencegahan: Tidak boleh menjadi parent diri sendiri
        if (parsedParentId && parsedParentId == categoryId) {
            return res.status(400).json({ message: "Kategori tidak dapat menjadi sub-kategori dari dirinya sendiri." });
        }

        // 2. Tentukan Slug Akhir
        let finalSlug = slug;
        // Jika slug kosong ATAU nama kategori berubah, buat slug baru
        if (!finalSlug || name !== category.name) {
            finalSlug = createSlug(name);
        }

        // 3. Cek duplikasi slug (kecuali kategori yang sedang diupdate)
        const existingCategory = await ProductCategory.findOne({ 
            where: { 
                slug: finalSlug, 
                id: { [Op.ne]: categoryId } // Op.ne = Not Equal
            } 
        });
        
        if (existingCategory) {
            return res.status(400).json({ message: "Slug sudah digunakan oleh kategori lain." });
        }

        const updateData = {
            name,
            parent_id: parsedParentId,
            slug: finalSlug,
            description,
            visibility,
            // order_index dari req.body atau order_index lama
            order_index: order_index !== undefined ? order_index : category.order_index 
        };
        
        // 4. Jika parent_id berubah, dan order_index tidak dikirim (atau tidak valid), hitung order_index baru.
        if (parsedParentId !== category.parent_id && (order_index === undefined || order_index === null)) {
             updateData.order_index = await getNextOrderIndex(parsedParentId);
        }

        await category.update(updateData);

        res.status(200).json({ message: "Kategori berhasil diupdate" });
    } catch (error) {
        console.error("Error updating category:", error.message);
        res.status(500).json({ message: "Gagal mengupdate kategori: " + error.message });
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