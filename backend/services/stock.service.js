// backend/services/stock.service.js
const { Product, ProductStock, ProductVariant, ProductStockMovement, sequelize } = require('../models');

/**
 * Mencatat Pergerakan Stok (Centralized Logic)
 * * @param {Object} params
 * @param {number} params.productId - ID Produk
 * @param {number|null} params.variantId - ID Varian (null jika produk simple)
 * @param {string} params.type - 'in', 'out', atau 'adjustment'
 * @param {number} params.qtyChange - Jumlah perubahan (Positif untuk tambah, Negatif untuk kurang)
 * @param {string} params.referenceType - 'INITIAL', 'ORDER', 'OPNAME', dll
 * @param {string|null} params.referenceId - ID referensi
 * @param {string|null} params.description - Catatan tambahan
 * @param {number|null} params.userId - ID User yang melakukan
 * @param {Object} params.transaction - Sequelize Transaction (Wajib diteruskan dari controller)
 */
exports.recordMovement = async ({ 
    productId, variantId, type, qtyChange, 
    referenceType = 'MANUAL', referenceId = null, 
    description = '', userId = null, transaction 
}) => {
    
    // Validasi Transaction
    if (!transaction) {
        throw new Error("Stock Movement requires a database transaction for safety.");
    }

    let currentStock = 0;
    let newStock = 0;

    // 1. TENTUKAN TARGET UPDATE (Simple Product atau Variant?)
    if (variantId) {
        // --- KASUS: PRODUK VARIASI ---
        const variant = await ProductVariant.findByPk(variantId, { transaction });
        if (!variant) throw new Error("Varian produk tidak ditemukan.");

        currentStock = Number(variant.stock);
        newStock = currentStock + Number(qtyChange);

        if (newStock < 0) throw new Error(`Stok tidak cukup! (Saat ini: ${currentStock}, Diminta: ${Math.abs(qtyChange)})`);

        // Update Stok di Tabel Variant
        await variant.update({ stock: newStock }, { transaction });

    } else {
        // --- KASUS: PRODUK SIMPLE (Menggunakan tabel ProductStock) ---
        // Cari ProductStock (bukan tabel Product, karena stok simple ada di ProductStock)
        let productStock = await ProductStock.findOne({ where: { product_id: productId }, transaction });
        
        // Jika belum ada record stock (kasus langka), buat dulu
        if (!productStock) {
            productStock = await ProductStock.create({ 
                product_id: productId, 
                stock_current: 0, 
                sku: '-' // Dummy SKU
            }, { transaction });
        }

        currentStock = Number(productStock.stock_current);
        newStock = currentStock + Number(qtyChange);

        if (newStock < 0) throw new Error(`Stok tidak cukup! (Saat ini: ${currentStock}, Diminta: ${Math.abs(qtyChange)})`);

        // Update Stok di Tabel ProductStock
        await productStock.update({ stock_current: newStock }, { transaction });
    }

    // 2. CATAT DI HISTORY (KARTU STOK)
    await ProductStockMovement.create({
        product_id: productId,
        variant_id: variantId || null,
        type: type,
        qty_change: qtyChange,
        balance_after: newStock, // Saldo akhir setelah transaksi
        reference_type: referenceType,
        reference_id: referenceId ? String(referenceId) : null,
        description: description,
        created_by: userId
    }, { transaction });

    return newStock;
};