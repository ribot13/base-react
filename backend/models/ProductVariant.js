module.exports = (sequelize, DataTypes) => {
    const ProductVariant = sequelize.define('ProductVariant', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        product_id: { type: DataTypes.INTEGER, allowNull: false },
        
        sku: { type: DataTypes.STRING, allowNull: true },
        price: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
        stock: { type: DataTypes.INTEGER, defaultValue: 0 },
        
        // Contoh: {"Warna": "Merah", "Ukuran": "XL"}
        combination_json: { type: DataTypes.JSON, allowNull: true } 
        
    }, { 
        tableName: 'product_variants', 
        timestamps: true,
        underscored:true 
    });

    ProductVariant.associate = (models) => {
        // Relasi ke Product Induk
        ProductVariant.belongsTo(models.Product, { 
            foreignKey: 'product_id',
            as: 'Product'
        });
    };

    return ProductVariant;
};