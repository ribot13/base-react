module.exports = (sequelize, DataTypes) => {
    const ProductWholesale = sequelize.define('ProductWholesale', {
        product_id: { type: DataTypes.INTEGER, allowNull: false },
        min_qty: DataTypes.INTEGER,
        price: DataTypes.DECIMAL(15, 2)
    }, { tableName: 'product_wholesale_prices', timestamps: false, underscored: true });
    return ProductWholesale;
};