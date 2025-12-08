const { Product, ProductStock, ProductImage, ProductWholesale, ProductCategory, Sequelize } = require('../models');
const { Op } = require('sequelize');

const createSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

exports.findAll = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                { model: ProductCategory, as: 'Category', attributes: ['name'] },
                { model: ProductStock, as: 'Stock' },
                { model: ProductImage, as: 'Images', where: { is_main: true }, required: false }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(products);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.findOne = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: ['Category', 'Stock', 'Images', 'Wholesales']
        });
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(product);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
    const t = await Product.sequelize.transaction();
    try {
        const data = req.body;
        
        // 1. Auto Logic
        const slug = data.slug || createSlug(data.name);
        const seo_title = data.seo_title || data.name;
        const seo_description = data.seo_description || (data.description ? data.description.substring(0, 160) : '');

        // 2. Create Product Base
        const product = await Product.create({
            ...data,
            slug, seo_title, seo_description,
            category_id: data.category_id || null // Handle uncategorized
        }, { transaction: t });

        // 3. Create Stock
        await ProductStock.create({
            product_id: product.id,
            sku: data.sku,
            stock_current: data.stock_current,
            stock_minimum: data.stock_minimum
        }, { transaction: t });

        // 4. Create Wholesale Prices (Array)
        if (data.wholesales && data.wholesales.length > 0) {
            const wholesaleData = data.wholesales.map(w => ({ ...w, product_id: product.id }));
            await ProductWholesale.bulkCreate(wholesaleData, { transaction: t });
        }
        
        // 5. Images akan dihandle terpisah atau via upload middleware yg mengembalikan path
        // Disini kita asumsikan FE mengirim array object gambar {image_path, is_main}
        if (data.images && data.images.length > 0) {
             const imageData = data.images.map(img => ({ ...img, product_id: product.id }));
             await ProductImage.bulkCreate(imageData, { transaction: t });
        }

        await t.commit();
        res.status(201).json(product);
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: err.message });
    }
};

// Implementasikan Update dan Delete dengan logika serupa (Transaction)
exports.delete = async (req, res) => {
    try {
        await Product.destroy({ where: { id: req.params.id } }); // Cascade akan hapus stock, images, dll
        res.json({ message: 'Produk dihapus' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};