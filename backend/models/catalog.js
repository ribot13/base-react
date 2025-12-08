// backend/models/catalog.js
module.exports = (sequelize, DataTypes) => {

    // --- 1. DEFINISI MODEL PIVOT: ProductCatalog ---
    const ProductCatalog = sequelize.define('ProductCatalog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // REFERENCES model: 'Product' (Akan dihubungkan melalui associate)
        },
        catalog_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // REFERENCES model: 'Catalog' (Akan dihubungkan melalui associate)
        },
    }, {
        tableName: 'product_catalog', // Nama tabel pivot
        timestamps: false
    });

    // --- 2. DEFINISI MODEL UTAMA: Catalog ---
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
        tableName: 'catalog', // Nama tabel
        timestamps: true // created_at dan updated_at standar
    });

    // --- 3. ASOSIASI RELASI (PENTING) ---
    Catalog.associate = (models) => {
        // Relasi Many-to-Many ke Product melalui tabel pivot yang baru didefinisikan
        Catalog.belongsToMany(models.Product, {
            through: ProductCatalog, // Menggunakan model pivot yang didefinisikan di atas
            foreignKey: 'catalog_id',
            as: 'Products'
        });
        
        // Relasi ProductCatalog ke Catalog
        ProductCatalog.belongsTo(models.Catalog, { foreignKey: 'catalog_id' });
        ProductCatalog.belongsTo(models.Product, { foreignKey: 'product_id' });
    };

    // Kita tetap harus mengembalikan kedua model agar Sequelize tahu bahwa ProductCatalog ada
    // Namun, kita hanya perlu mengembalikan model utama (Catalog)
    // Model ProductCatalog akan otomatis terdaftar dan diakses melalui 'models.ProductCatalog'
    return Catalog; 
};