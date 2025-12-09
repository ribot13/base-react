// backend/models/productCatalog.js (FILE BARU)
module.exports = (sequelize, DataTypes) => {
    const ProductCatalog = sequelize.define('ProductCatalog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        catalog_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        tableName: 'product_catalog', // Tabel Pivot
        timestamps: false
    });

    ProductCatalog.associate = (models) => {
        // Asosiasi balik, opsional namun disarankan
        ProductCatalog.belongsTo(models.Product, { foreignKey: 'product_id' });
        ProductCatalog.belongsTo(models.Catalog, { foreignKey: 'catalog_id' });
    };

    return ProductCatalog;
};