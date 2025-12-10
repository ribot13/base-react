// backend/controllers/product.controller.js
const fs = require('fs');
const path = require('path');
const StockService = require('../services/stock.service');
const {
    Product,
    ProductStock,
    ProductImage,
    ProductWholesale,
    ProductCategory,
    ProductVariationGroup,
    ProductVariationOption,
    ProductVariant,
    ProductStockMovement,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

const createSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// --- HELPER: Hapus File Fisik ---
// Sesuaikan 'public' dengan folder root statis Anda jika berbeda
const deleteFile = (filePath) => {
    if (!filePath) return;
    
    // Normalisasi path (misal: dari URL http://.../uploads/x.jpg menjadi path lokal)
    // Asumsi filePath yang disimpan di DB adalah relative: "/uploads/products/abc.jpg"
    // Jika format full URL, Anda perlu parsing dulu. 
    // Di sini kita asumsi format path relative dari root project/public.
    
    // Hapus awalan slash jika ada
    const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    
    // Tentukan full path di server
    // Asumsi: file uploads ada di folder "public" atau sejajar dengan folder backend
    // Sesuaikan path.join ini dengan struktur folder Anda!
    const absolutePath = path.join(__dirname, '../', relativePath); 

    fs.access(absolutePath, fs.constants.F_OK, (err) => {
        if (!err) {
            fs.unlink(absolutePath, (err) => {
                if (err) console.error(`Gagal menghapus file: ${absolutePath}`, err);
                else console.log(`File terhapus: ${absolutePath}`);
            });
        }
    });
};

exports.findAll = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                { model: ProductCategory, as: 'Category', attributes: ['name'] },
                
                // Include Stock (Penting untuk sorting SKU induk)
                { model: ProductStock, as: 'Stock', attributes: ['sku', 'stock_current'] },
                
                { model: ProductImage, as: 'Images', where: { is_main: true }, required: false },
                
                // Include Variation Group (Untuk Metadata Warna/Gambar)
                {
                    model: ProductVariationGroup,
                    as: 'VariationGroups',
                    include: [
                        { model: ProductVariationOption, as: 'Options' }
                    ]
                },
                
                // Include Variants (Untuk Expandable Row)
                { 
                    model: ProductVariant, 
                    as: 'Variants',
                    attributes: ['id', 'sku', 'price', 'stock', 'combination_json'] 
                }
            ],
            
            // === BAGIAN INI YANG DIUBAH (SORTING) ===
            order: [
                // 1. Urutkan Produk Utama berdasarkan SKU (A-Z)
                // Karena SKU ada di tabel relasi 'Stock', syntax-nya: [{model, as}, column, direction]
                [ { model: ProductStock, as: 'Stock' }, 'sku', 'ASC' ],

                // 2. Urutkan List Variasi (anak) berdasarkan SKU juga
                [ { model: ProductVariant, as: 'Variants' }, 'sku', 'ASC' ]
            ]
        });
        res.json(products);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.findOne = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                'Category', 
                'Stock', 
                'Images', 
                'Wholesales',
                // === TAMBAHKAN INI AGAR VARIASI MUNCUL DI EDIT FORM ===
                {
                    model: ProductVariationGroup,
                    as: 'VariationGroups',
                    include: [
                        { model: ProductVariationOption, as: 'Options' }
                    ]
                },
                { 
                    model: ProductVariant, 
                    as: 'Variants' 
                }
                // =======================================================
            ]
        });
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(product);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
    // Debugging Log
    console.log("=== INCOMING CREATE PRODUCT REQUEST ===");
    const t = await sequelize.transaction();

    try {
        const { 
            name, category_id, description, visibility,
            base_price, sales_price, max_price,
            sku, stock_current, stock_minimum,
            weight, length, width, height, volumetric_weight,
            is_preorder, po_process_time, po_dp_requirement, po_dp_type, po_dp_value,
            slug, seo_title, seo_description,
            images, wholesales,
            variationGroups, variants 
        } = req.body;

        const finalSlug = slug || createSlug(name);

        // 1. Simpan Produk Utama
        const newProduct = await Product.create({
            name, category_id: category_id || null, description, visibility,
            base_price, sales_price, max_price,
            weight, length, width, height, volumetric_weight,
            is_preorder, po_process_time, po_dp_requirement, po_dp_type, po_dp_value,
            slug: finalSlug, seo_title, seo_description
        }, { transaction: t });

        const productId = newProduct.id;

        // 2. Simpan Stok
        await ProductStock.create({
            product_id: productId, sku, stock_current, stock_minimum
        }, { transaction: t });

        // 3. Simpan Gambar
        if (images && images.length > 0) {
            const imagePayload = images.map(img => ({
                product_id: productId,
                image_path: img.image_path,
                is_main: img.is_main
            }));
            await ProductImage.bulkCreate(imagePayload, { transaction: t });
        }

        // 4. Simpan Grosir
        if (wholesales && wholesales.length > 0) {
            const wholesalePayload = wholesales.map(w => ({
                product_id: productId,
                min_qty: w.min_qty,
                price: w.price
            }));
            await ProductWholesale.bulkCreate(wholesalePayload, { transaction: t });
        }

        // 5. Simpan Variasi (Group & Options)
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

        // 6. Simpan Variants (SKU)
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
        res.status(201).json({ message: "Produk dan Variasi berhasil disimpan.", product: newProduct });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const data = req.body;

        const product = await Product.findByPk(id);
        if (!product) {
            await t.rollback();
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        // 1. Update Basic Info
        let newSlug = data.slug;
        if (!newSlug && data.name !== product.name) {
            newSlug = createSlug(data.name);
        }

        await product.update({
            ...data,
            slug: newSlug || product.slug,
            category_id: data.category_id || null
        }, { transaction: t });

        // 2. Update Stock
        const stock = await ProductStock.findOne({ where: { product_id: id } });
        if (stock) {
            await stock.update({
                sku: data.sku, stock_current: data.stock_current, stock_minimum: data.stock_minimum
            }, { transaction: t });
        } else {
            await ProductStock.create({
                product_id: id, sku: data.sku, stock_current: data.stock_current, stock_minimum: data.stock_minimum
            }, { transaction: t });
        }

        // 3. Update Wholesale (Wipe & Replace)
        if (data.wholesales) {
            await ProductWholesale.destroy({ where: { product_id: id }, transaction: t });
            if (data.wholesales.length > 0) {
                const wholesaleData = data.wholesales.map(w => ({ ...w, product_id: id }));
                await ProductWholesale.bulkCreate(wholesaleData, { transaction: t });
            }
        }

        // 4. UPDATE GAMBAR (INI YANG SEBELUMNYA HILANG)
        // Strategi: Wipe & Replace Database Records
        // Catatan: Penghapusan file fisik saat edit dilakukan oleh Frontend via API 'deleteImageFromServer'
        // Jadi di sini kita hanya perlu memastikan Database sinkron dengan apa yang dikirim Frontend.
        if (data.images) {
            // Hapus semua record gambar milik produk ini di DB
            await ProductImage.destroy({ where: { product_id: id }, transaction: t });

            // Insert ulang semua gambar yang dikirim frontend
            if (data.images.length > 0) {
                const imageData = data.images.map(img => ({
                    product_id: id,
                    image_path: img.image_path,
                    is_main: img.is_main
                }));
                await ProductImage.bulkCreate(imageData, { transaction: t });
            }
        }

        await t.commit();
        res.status(200).json({ message: 'Produk berhasil diupdate', product });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        // --- CLEANUP FILE FISIK SEBELUM HAPUS DATA DB ---
        
        // 1. Ambil & Hapus Gambar Produk Utama
        const images = await ProductImage.findAll({ where: { product_id: id } });
        images.forEach(img => {
            deleteFile(img.image_path);
        });

        // 2. Ambil & Hapus Gambar Variasi
        // Kita perlu cari Option yang tipe-nya 'image' dan milik produk ini
        const groups = await ProductVariationGroup.findAll({ 
            where: { product_id: id },
            include: [{ model: ProductVariationOption, as: 'Options' }]
        });

        groups.forEach(group => {
            if (group.Options) {
                group.Options.forEach(opt => {
                    if (opt.meta_type === 'image' && opt.meta_value) {
                        deleteFile(opt.meta_value);
                    }
                });
            }
        });

        // 3. Hapus Data dari DB (Cascade akan menghapus variants, stock, dll)
        await Product.destroy({ where: { id } }); 
        
        res.json({ message: 'Produk dan file terkait berhasil dihapus' });
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};

// ==========================================
// 6. GET STOCK HISTORY (RIWAYAT STOK)
// ==========================================
exports.getStockHistory = async (req, res) => {
    try {
        const { id } = req.params; // Product ID
        
        const history = await ProductStockMovement.findAll({
            where: { product_id: id },
            include: [
                { 
                    model: ProductVariant, 
                    as: 'Variant', // Pastikan alias ini sama dengan di productStockMovement.js
                    attributes: ['sku', 'combination_json'] 
                }
            ],
            // Gunakan 'createdAt' (default Sequelize) atau 'created_at' (jika Anda pakai underscore: true)
            order: [['createdAt', 'DESC']] 
        });

        res.json(history);
    } catch (err) {
        // === PENTING: LOGGING DETAIL ERROR DI TERMINAL SERVER ===
        console.error("CRITICAL BACKEND ERROR | GET STOCK HISTORY:", err.name);
        console.error("Message:", err.message);
        // Jika ini adalah error database, err.sql akan menampilkan query yang gagal
        if (err.sql) console.error("SQL:", err.sql); 
        
        // Kirim error generik 500 ke frontend
        res.status(500).json({ message: "Gagal mengambil riwayat stok dari server. Lihat log backend untuk detail." });
    }
};

// ==========================================
// 7. STOCK ADJUSTMENT (OPNAME / KOREKSI)
// ==========================================
exports.adjustStock = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params; // Product ID
        const { variant_id, actual_stock, note } = req.body;

        // Validasi Input
        if (actual_stock === undefined || actual_stock === null || actual_stock < 0) {
            throw new Error("Stok fisik (actual_stock) harus diisi dan tidak boleh minus.");
        }

        let currentStock = 0;
        let qtyChange = 0;

        // A. HITUNG SELISIH (Diff)
        if (variant_id) {
            // Kasus Produk Variasi
            const variant = await ProductVariant.findByPk(variant_id, { transaction: t });
            if (!variant) throw new Error("Varian tidak ditemukan.");
            currentStock = variant.stock;
        } else {
            // Kasus Produk Simple
            const pStock = await ProductStock.findOne({ where: { product_id: id }, transaction: t });
            currentStock = pStock ? pStock.stock_current : 0;
        }

        // Rumus: Selisih = Stok Fisik - Stok Sistem
        // Contoh: Fisik 50, Sistem 45. Selisih = +5 (Masuk)
        // Contoh: Fisik 40, Sistem 45. Selisih = -5 (Keluar/Hilang)
        qtyChange = Number(actual_stock) - Number(currentStock);

        if (qtyChange === 0) {
            await t.rollback();
            return res.status(400).json({ message: "Stok fisik sama dengan stok sistem. Tidak ada perubahan." });
        }

        // B. PANGGIL STOCK SERVICE
        await StockService.recordMovement({
            productId: id,
            variantId: variant_id || null,
            type: 'adjustment', // Tipe khusus Opname
            qtyChange: qtyChange,
            referenceType: 'OPNAME',
            description: note || 'Stock Opname Manual',
            userId: req.userId, // Dari middleware auth
            transaction: t
        });

        await t.commit();
        res.json({ message: "Stok berhasil disesuaikan.", adjustment: qtyChange, current: actual_stock });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};