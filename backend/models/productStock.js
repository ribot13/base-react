module.exports = (sequelize, DataTypes) => {
    const ProductStock = sequelize.define('ProductStock', {
        product_id: { type: DataTypes.INTEGER, allowNull: false },
        sku: DataTypes.STRING,
        stock_current: { type: DataTypes.INTEGER, defaultValue: 0 },
        stock_minimum: { type: DataTypes.INTEGER, defaultValue: 0 },
        stock_booked: { type: DataTypes.INTEGER, defaultValue: 0 },
    }, { tableName: 'product_stocks', timestamps: false, underscored: true });
    return ProductStock;
};