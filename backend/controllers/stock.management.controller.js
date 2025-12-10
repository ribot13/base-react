// backend/controllers/stock.management.controller.js
const {
    Product,
    ProductStock,
    ProductVariant,
    ProductVariationGroup,
    ProductVariationOption,
    sequelize
} = require('../models');
const StockService = require('../services/stock.service'); // Kita pakai service yang sudah dibuat!
const { Op } = require('sequelize');

// --- HELPER UNTUK MENGGABUNGKAN PRODUK & VARIAN KE DALAM SATU LIST ---
const flattenInventory = (products) => {
    const flatList = [];

    products.forEach(product => {
        const p = product.toJSON();
        
        const isVariable = p.Variants && p.Variants.length > 0;
        
        // 1. Jika ada Varian, masukkan semua varian
        if (isVariable) {
            p.Variants.forEach(variant => {
                const combination = variant.combination_json ? Object.values(variant.combination_json).join(' / ') : 'Varian';
                
                flatList.push({
                    // ID unik untuk baris ini
                    id: `V-${variant.id}`, 
                    product_id: p.id,
                    variant_id: variant.id,
                    name: `${p.name} (${combination})`,
                    sku: variant.sku || 'N/A',
                    current_stock: Number(variant.stock) || 0,
                    is_variant: true,
                    // Tambahkan data induk untuk referensi
                    parent_name: p.name,
                    parent_sku: p.Stock?.sku || '-',
                });
            });
        } 
        
        // 2. Jika Produk Simple ATAU produk variasi tapi mau tampilkan induknya juga
        // Kita tampilkan Produk Simple atau Induk Varian
        if (!isVariable || (isVariable && flatList.length === 0)) { // Cek if flatList is empty just in case
            flatList.push({
                id: `P-${p.id}`, 
                product_id: p.id,
                variant_id: null,
                name: p.name,
                sku: p.Stock?.sku || 'N/A',
                current_stock: Number(p.Stock?.stock_current) || 0,
                is_variant: false,
                parent_name: null,
                parent_sku: null,
            });
        }
    });

    return flatList;
};


// ==========================================
// 1. GET ALL INVENTORY ITEMS (FLAT LIST)
// ==========================================
exports.getInventoryList = async (req, res) => {
    // Implementasi pencarian, sorting, filtering akan dilakukan di sini.
    // Untuk saat ini, kita ambil semua dulu.
    const { search, sortBy, sortOrder } = req.query;

    let whereClause = {};
    let orderClause = [];

    // Logika Pencarian (Mencari di Nama Produk atau SKU)
    if (search) {
        whereClause[Op.or] = [
            { '$Product.name$': { [Op.like]: `%${search}%` } },
            { '$Stock.sku$': { [Op.like]: `%${search}%` } },
            { '$Variants.sku$': { [Op.like]: `%${search}%` } },
        ];
    }
    
    // Logika Sorting
    // Kita sort berdasarkan SKU induk untuk memudahkan pencarian
    orderClause.push([ { model: ProductStock, as: 'Stock' }, 'sku', sortOrder || 'ASC' ]);

    try {
        const products = await Product.findAll({
            where: whereClause,
            include: [
                { model: ProductStock, as: 'Stock', attributes: ['sku', 'stock_current'] },
                { 
                    model: ProductVariant, 
                    as: 'Variants',
                    required: false, // Penting agar produk tanpa varian tetap muncul
                    attributes: ['id', 'sku', 'stock', 'combination_json'] 
                }
            ],
            order: orderClause
        });

        const flatList = flattenInventory(products);
        
        // Catatan: Filtering/Sorting berdasarkan stok harus dilakukan setelah flatten
        // Namun, kita abaikan dulu untuk kesederhanaan.

        res.json(flatList);
    } catch (err) {
        console.error("Error fetching inventory list:", err);
        res.status(500).json({ message: "Gagal memuat daftar inventaris.", error: err.message });
    }
};

// ==========================================
// 2. INLINE STOCK ADJUSTMENT (TAMBAH/KURANG/SETEL)
// ==========================================
exports.adjustInlineStock = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { product_id, variant_id, method, value, current_stock, description } = req.body;
        
        if (!product_id || !method || value === undefined) {
             throw new Error("Data input tidak lengkap.");
        }

        const numericValue = Number(value);
        let qtyChange = 0;

        // A. Tentukan Qty Change berdasarkan method
        switch(method) {
            case 'add': 
                qtyChange = numericValue; // Tambah
                break;
            case 'subtract':
                qtyChange = -numericValue; // Kurang
                break;
            case 'set':
                // Selisih = Set Value - Current Stock
                qtyChange = numericValue - Number(current_stock);
                break;
            default:
                throw new Error("Metode adjustment tidak valid.");
        }

        // B. PANGGIL STOCK SERVICE
        const newStock = await StockService.recordMovement({
            productId: product_id,
            variantId: variant_id || null,
            type: 'adjustment', // Selalu 'adjustment' untuk aksi admin
            qtyChange: qtyChange,
            referenceType: 'INLINE_EDIT',
            description: description || `Inline update: ${method} ${numericValue}`,
            userId: req.user ? req.user.id : null, // Ambil dari token
            transaction: t
        });

        await t.commit();

        res.json({ 
            message: "Stok berhasil diperbarui.", 
            new_stock: newStock,
            change: qtyChange
        });

    } catch (err) {
        await t.rollback();
        console.error("Error adjusting inline stock:", err);
        res.status(500).json({ message: err.message || "Gagal menyesuaikan stok." });
    }
};