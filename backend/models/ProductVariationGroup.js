module.exports = (sequelize, DataTypes) => {
    const ProductVariationGroup = sequelize.define('ProductVariationGroup', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        product_id: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false }, // Contoh: "Warna", "Ukuran"
    }, { 
        tableName: 'product_variation_groups', 
        timestamps: false 
    });

    ProductVariationGroup.associate = (models) => {
        // Relasi ke Option (PENTING: as 'Options' harus ada agar controller jalan)
        ProductVariationGroup.hasMany(models.ProductVariationOption, { 
            foreignKey: 'group_id', 
            as: 'Options', 
            onDelete: 'CASCADE' 
        });
        
        // Relasi ke Product Induk
        ProductVariationGroup.belongsTo(models.Product, { 
            foreignKey: 'product_id',
            as: 'Product'
        });
    };

    return ProductVariationGroup;
};