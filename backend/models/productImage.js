module.exports = (sequelize, DataTypes) => {
    const ProductImage = sequelize.define('ProductImage', {
        product_id: { type: DataTypes.INTEGER, allowNull: false },
        image_path: DataTypes.STRING,
        is_main: { type: DataTypes.BOOLEAN, defaultValue: false },
        order_index: DataTypes.INTEGER
    }, { tableName: 'product_images', timestamps: false, underscored: true });
    return ProductImage;
};