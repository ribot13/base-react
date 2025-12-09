// backend/controllers/catalog.controller.js
const { Catalog, Product, ProductCatalog, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper untuk penanganan error
const handleError = (res, message, error) => {
    console.error(`[Catalog Error] ${message}:`, error.message);
    res.status(500).json({ message: `${message}: ${error.message}` });
};

// 1. GET ALL CATALOGS
exports.findAll = async (req, res) => {
    try {
        const catalogs = await Catalog.findAll({
            // 💡 FIX: Gunakan literal untuk menghitung produk via subquery
            attributes: [
                'id',
                'name',
                'description',
                'status',
                'createdAt',
                'updatedAt',
                // Subquery untuk menghitung jumlah produk dari tabel pivot
                [
                    sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM product_catalog AS ProductCatalogs
                        WHERE
                            ProductCatalogs.catalog_id = Catalog.id
                    )`),
                    'product_count' // Alias untuk hasil hitungan
                ]
            ],
            // Hapus 'include' Product dan 'group' karena kita tidak lagi melakukan JOIN
            // order: [['updatedAt', 'DESC']] // Order tetap bisa digunakan
        });
        res.status(200).json(catalogs);
    } catch (error) {
        handleError(res, "Gagal mengambil daftar katalog", error);
    }
};

// 2. GET ONE CATALOG BY ID
exports.findOne = async (req, res) => {
    try {
        const catalog = await Catalog.findByPk(req.params.id, {
            // Sertakan semua produk di dalam katalog ini
            include: [{
                model: Product,
                as: 'Products',
                through: { attributes: [] } 
            }]
        });

        if (!catalog) {
            return res.status(404).json({ message: "Katalog tidak ditemukan." });
        }
        res.status(200).json(catalog);
    } catch (error) {
        handleError(res, "Gagal mengambil detail katalog", error);
    }
};

// 3. CREATE CATALOG
exports.create = async (req, res) => {
    const { name, description, status,productIds=[] } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Nama katalog wajib diisi." });
    }

    try {
        const newCatalog = await Catalog.create({ name, description, status });
        if (productIds.length > 0) {
            await newCatalog.addProducts(productIds); 
        }
        res.status(201).json(newCatalog);
    } catch (error) {
        // Cek duplikasi nama
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: "Nama katalog sudah ada." });
        }
        handleError(res, "Gagal membuat katalog", error);
    }
};

// 4. UPDATE CATALOG
exports.update = async (req, res) => {
    const { name, description, status, productIds = [] } = req.body;
    const catalogId = req.params.id;

    try {
        const catalog = await Catalog.findByPk(catalogId);

        await sequelize.transaction(async (t) => {
            await catalog.update({ name, description, status }, { transaction: t });
            await catalog.setProducts(productIds, { transaction: t }); 
        });
        
        await catalog.update({ name, description, status });
        res.status(200).json({ message: "Katalog berhasil diupdate dan produk disinkronisasi." });

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: "Nama katalog sudah digunakan." });
        }
        handleError(res, "Gagal mengupdate katalog", error);
    }
};

// 5. DELETE CATALOG
exports.delete = async (req, res) => {
    const catalogId = req.params.id;
    try {
        // Hapus Katalog
        const result = await Catalog.destroy({
            where: { id: catalogId }
        });

        if (result === 0) {
            return res.status(404).json({ message: "Katalog tidak ditemukan." });
        }

        // Catatan: Jika Anda mengatur onDelete: CASCADE pada Foreign Key di ProductCatalog, 
        // entri pivot akan terhapus otomatis. Jika tidak, Anda perlu menghapus manual.

        res.status(200).json({ message: "Katalog berhasil dihapus." });
    } catch (error) {
        handleError(res, "Gagal menghapus katalog", error);
    }
};