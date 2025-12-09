// backend/models/catalog.js (REVISI)
module.exports = (sequelize, DataTypes) => {
    const Catalog = sequelize.define('Catalog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
    }, {
        tableName: 'catalog',
        timestamps: true,
        underscored: true
    });

    Catalog.associate = (models) => {
        // Relasi Many-to-Many ke Product melalui model pivot yang sudah diinisialisasi
        Catalog.belongsToMany(models.Product, {
            through: models.ProductCatalog, // <-- Mengakses model pivot dari object models
            foreignKey: 'catalog_id',
            as: 'Products'
        });
    };

    return Catalog;
};