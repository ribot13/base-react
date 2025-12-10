// backend/models/productVariation.js
module.exports = (sequelize, DataTypes) => {
    // 1. Group Variasi (Warna, Ukuran)
    const ProductVariationGroup = sequelize.define('ProductVariationGroup', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        product_id: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false }, // Contoh: "Color", "Size"
    }, { tableName: 'product_variation_groups', timestamps: false });

    // 2. Opsi Variasi (Merah, Biru, S, M)
    const ProductVariationOption = sequelize.define('ProductVariationOption', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        group_id: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false }, // Contoh: "Red", "XL"
        
        // Tipe visual: 'text', 'color', 'image'
        meta_type: { type: DataTypes.ENUM('text', 'color', 'image'), defaultValue: 'text' },
        
        // Isi visual: Hex code (#FF0000) atau URL Gambar
        meta_value: { type: DataTypes.STRING, allowNull: true } 
    }, { tableName: 'product_variation_options', timestamps: false });

    // 3. Varian Produk / SKU (Item nyata yang dijual)
    const ProductVariant = sequelize.define('ProductVariant', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        product_id: { type: DataTypes.INTEGER, allowNull: false },
        
        // SKU unik untuk varian ini
        sku: { type: DataTypes.STRING, allowNull: true },
        
        // Harga & Stok spesifik varian
        price: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
        stock: { type: DataTypes.INTEGER, defaultValue: 0 },
        
        // Menyimpan kombinasi opsi dalam bentuk JSON agar mudah dibaca frontend
        // Contoh: {"Warna": "Merah", "Ukuran": "XL"}
        combination_json: { type: DataTypes.JSON, allowNull: true } 
        
    }, { tableName: 'product_variants', timestamps: true });


    // --- ASOSIASI ---
    ProductVariationGroup.associate = (models) => {
        ProductVariationGroup.hasMany(models.ProductVariationOption, { 
            foreignKey: 'group_id', as: 'Options', onDelete: 'CASCADE' 
        });
        ProductVariationGroup.belongsTo(models.Product, { foreignKey: 'product_id' });
    };

    ProductVariationOption.associate = (models) => {
        ProductVariationOption.belongsTo(models.ProductVariationGroup, { foreignKey: 'group_id' });
    };

    ProductVariant.associate = (models) => {
        ProductVariant.belongsTo(models.Product, { foreignKey: 'product_id' });
    };

    return { ProductVariationGroup, ProductVariationOption, ProductVariant };
};