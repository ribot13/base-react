module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        category_id: { type: DataTypes.INTEGER, allowNull: true },
        name: { type: DataTypes.STRING, allowNull: false },
        slug: { type: DataTypes.STRING, allowNull: true },
        description: DataTypes.TEXT,
        visibility: { type: DataTypes.ENUM('public', 'hidden', 'link_only'), defaultValue: 'public' },
        base_price: DataTypes.DECIMAL(15, 2),
        sales_price: DataTypes.DECIMAL(15, 2),
        max_price: DataTypes.DECIMAL(15, 2),
        is_preorder: { type: DataTypes.BOOLEAN, defaultValue: false },
        po_process_time: DataTypes.INTEGER,
        po_dp_requirement: DataTypes.ENUM('none', 'optional', 'mandatory'),
        po_dp_type: DataTypes.ENUM('fixed', 'percentage'),
        po_dp_value: DataTypes.DECIMAL(15, 2),
        weight: DataTypes.INTEGER,
        length: DataTypes.INTEGER,
        width: DataTypes.INTEGER,
        height: DataTypes.INTEGER,
        volumetric_weight: DataTypes.INTEGER,
        seo_title: DataTypes.STRING,
        seo_description: DataTypes.STRING,
    }, { tableName: 'products', timestamps: true, underscored: true });

    Product.associate = (models) => {
        Product.belongsTo(models.ProductCategory, { foreignKey: 'category_id', as: 'Category' });
        Product.hasOne(models.ProductStock, { foreignKey: 'product_id', as: 'Stock', onDelete: 'CASCADE' });
        Product.hasMany(models.ProductImage, { foreignKey: 'product_id', as: 'Images', onDelete: 'CASCADE' });
        Product.hasMany(models.ProductWholesale, { foreignKey: 'product_id', as: 'Wholesales', onDelete: 'CASCADE' });
    };

    return Product;
};