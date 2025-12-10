// backend/controllers/product.variation.controller.js
const { Product, ProductVariationGroup, ProductVariationOption, ProductVariant, sequelize } = require('../models');

// GET Variasi berdasarkan Product ID
exports.getVariations = async (req, res) => {
    try {
        const { productId } = req.params;

        // Ambil Groups beserta Options-nya
        const groups = await ProductVariationGroup.findAll({
            where: { product_id: productId },
            include: [{ model: ProductVariationOption, as: 'Options' }]
        });

        // Ambil Tabel Variants (SKU, Harga, Stok)
        const variants = await ProductVariant.findAll({
            where: { product_id: productId }
        });

        res.status(200).json({ groups, variants });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SAVE (Create/Update) Variasi
exports.saveVariations = async (req, res) => {
    const { productId } = req.params;
    const { variationGroups, variants } = req.body;

    // Mulai Transaksi Database
    const t = await sequelize.transaction();

    try {
        // 1. BERSIHKAN DATA LAMA (Wipe)
        // Kita hapus varian dan grup lama agar tidak ada data "hantu"
        await ProductVariant.destroy({ where: { product_id: productId }, transaction: t });
        
        // Hapus Group (Option akan terhapus otomatis karena CASCADE di database)
        await ProductVariationGroup.destroy({ where: { product_id: productId }, transaction: t });

        // 2. SIMPAN GROUP & OPSI BARU
        // Loop setiap grup (Warna, Ukuran)
        for (const group of variationGroups) {
            const newGroup = await ProductVariationGroup.create({
                product_id: productId,
                name: group.name
            }, { transaction: t });

            // Simpan Opsi di dalam grup ini (Merah, Biru / S, M)
            if (group.options && group.options.length > 0) {
                const optionsData = group.options.map(opt => ({
                    group_id: newGroup.id,
                    name: opt.name,
                    meta_type: opt.meta_type,
                    meta_value: opt.meta_value
                }));
                await ProductVariationOption.bulkCreate(optionsData, { transaction: t });
            }
        }

        // 3. SIMPAN TABEL VARIAN (SKU, Stok, Harga)
        if (variants && variants.length > 0) {
            const variantsData = variants.map(v => ({
                product_id: productId,
                sku: v.sku,
                price: v.price || 0,
                stock: v.stock || 0,
                combination_json: v.combination // Simpan JSON kombinasi
            }));
            await ProductVariant.bulkCreate(variantsData, { transaction: t });
        }

        // Commit Transaksi
        await t.commit();
        res.status(200).json({ message: "Variasi produk berhasil disimpan." });

    } catch (error) {
        // Rollback jika ada error
        await t.rollback();
        console.error("Error saving variations:", error);
        res.status(500).json({ message: "Gagal menyimpan variasi: " + error.message });
    }
};