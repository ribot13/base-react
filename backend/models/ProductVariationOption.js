module.exports = (sequelize, DataTypes) => {
    const ProductVariationOption = sequelize.define('ProductVariationOption', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        group_id: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false }, // Contoh: "Merah", "XL"
        
        // Tipe visual: 'text', 'color', 'image'
        meta_type: { type: DataTypes.ENUM('text', 'color', 'image'), defaultValue: 'text' },
        
        // Isi visual: Hex code (#FF0000) atau URL Gambar
        meta_value: { type: DataTypes.STRING, allowNull: true } 
    }, { 
        tableName: 'product_variation_options', 
        timestamps: false 
    });

    ProductVariationOption.associate = (models) => {
        // Relasi balik ke Group
        ProductVariationOption.belongsTo(models.ProductVariationGroup, { 
            foreignKey: 'group_id',
            as: 'Group' // Opsional, untuk memudahkan jika di-include balik
        });
    };

    return ProductVariationOption;
};