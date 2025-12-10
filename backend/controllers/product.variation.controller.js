// backend/controllers/product.variation.controller.js
const fs = require('fs');
const path = require('path');
const { Product, ProductVariationGroup, ProductVariationOption, ProductVariant, sequelize } = require('../models');

// --- HELPER: Copy Paste Helper deleteFile yang sama ---
const deleteFile = (filePath) => {
    if (!filePath) return;
    const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const absolutePath = path.join(__dirname, '../', relativePath); 
    fs.access(absolutePath, fs.constants.F_OK, (err) => {
        if (!err) {
            fs.unlink(absolutePath, (err) => {
                if (err) console.error(`Gagal menghapus file variasi: ${absolutePath}`, err);
            });
        }
    });
};

// GET Variasi
exports.getVariations = async (req, res) => {
    try {
        const productId = req.params.productId || req.query.productId;
        if (!productId) return res.status(400).json({ message: "Product ID tidak ditemukan." });

        const groups = await ProductVariationGroup.findAll({
            where: { product_id: productId },
            include: [{ model: ProductVariationOption, as: 'Options' }]
        });
        const variants = await ProductVariant.findAll({ where: { product_id: productId }});

        res.status(200).json({ groups, variants });
    } catch (error) {
        console.error("Error fetching variations:", error);
        res.status(500).json({ message: error.message });
    }
};

// SAVE (Create/Update) Variasi
exports.saveVariations = async (req, res) => {
    try {
        let productId = req.params.productId || req.body.productId || req.body.product_id;
        const { variationGroups, variants } = req.body;

        if (!productId || productId === 'undefined') {
            return res.status(400).json({ message: "Product ID tidak valid." });
        }

        const t = await sequelize.transaction();

        try {
            // --- CLEANUP FILE FISIK SEBELUM WIPE ---
            // Cari data lama sebelum dihapus
            const oldGroups = await ProductVariationGroup.findAll({
                where: { product_id: productId },
                include: [{ model: ProductVariationOption, as: 'Options' }],
                transaction: t // Gunakan transaksi biar konsisten
            });

            // Loop untuk hapus file gambar
            for (const grp of oldGroups) {
                if (grp.Options) {
                    for (const opt of grp.Options) {
                        // Jika opsi ini punya gambar, hapus filenya
                        if (opt.meta_type === 'image' && opt.meta_value) {
                            // Cek apakah gambar ini MASIH DIPAKAI di data baru?
                            // Logika sederhana: Hapus saja dulu. Jika user upload ulang, file baru akan tersimpan.
                            // Atau cek: apakah meta_value ini ada di request body 'variationGroups'?
                            // Demi keamanan storage, kita hapus yang lama.
                            
                            // Tapi hati-hati: jika user TIDAK mengubah gambar (tetap pakai gambar lama),
                            // kita jangan hapus filenya!
                            
                            // LOGIKA SMART CLEANUP:
                            // Cek apakah URL gambar ini ada di data request body?
                            let isStillUsed = false;
                            if (variationGroups && variationGroups.length > 0) {
                                for (const newGrp of variationGroups) {
                                    if (newGrp.options) {
                                        for (const newOpt of newGrp.options) {
                                            if (newOpt.meta_value === opt.meta_value) {
                                                isStillUsed = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }

                            if (!isStillUsed) {
                                deleteFile(opt.meta_value);
                            }
                        }
                    }
                }
            }

            // 1. BERSIHKAN DATA LAMA (Wipe DB)
            await ProductVariant.destroy({ where: { product_id: productId }, transaction: t });
            await ProductVariationGroup.destroy({ where: { product_id: productId }, transaction: t });

            // 2. SIMPAN GROUP & OPSI BARU
            if (variationGroups && variationGroups.length > 0) {
                for (const group of variationGroups) {
                    const newGroup = await ProductVariationGroup.create({
                        product_id: productId,
                        name: group.name
                    }, { transaction: t });

                    const opts = group.options || group.Options || [];
                    if (opts.length > 0) {
                        const optionsData = opts.map(opt => ({
                            group_id: newGroup.id,
                            name: opt.name,
                            meta_type: opt.meta_type,
                            meta_value: opt.meta_value
                        }));
                        await ProductVariationOption.bulkCreate(optionsData, { transaction: t });
                    }
                }
            }

            // 3. SIMPAN TABEL VARIAN
            if (variants && variants.length > 0) {
                const variantsData = variants.map(v => ({
                    product_id: productId,
                    sku: v.sku,
                    price: v.price || 0,
                    stock: v.stock || 0,
                    combination_json: v.combination 
                }));
                await ProductVariant.bulkCreate(variantsData, { transaction: t });
            }

            await t.commit();
            res.status(200).json({ message: "Variasi produk berhasil disimpan." });

        } catch (dbError) {
            await t.rollback();
            throw dbError;
        }

    } catch (error) {
        console.error("Error saving variations:", error);
        res.status(500).json({ message: "Gagal menyimpan variasi: " + error.message });
    }
};