// backend/models/productCategory.js
module.exports = (sequelize, DataTypes) => {
    const ProductCategory = sequelize.define('ProductCategory', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        visibility: {
            type: DataTypes.ENUM('public', 'hidden'),
            defaultValue: 'public'
        },
        order_index: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'product_category',
        timestamps: false // Sesuai DDL tidak ada created_at/updated_at default
    });

    ProductCategory.associate = (models) => {
        // Relasi ke dirinya sendiri (Parent Category)
        ProductCategory.belongsTo(models.ProductCategory, {
            as: 'Parent',
            foreignKey: 'parent_id'
        });
        
        // Relasi ke anak-anaknya (Sub Categories)
        ProductCategory.hasMany(models.ProductCategory, {
            as: 'Children',
            foreignKey: 'parent_id'
        });
    };

    return ProductCategory;
};