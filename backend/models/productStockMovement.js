// backend/models/productStockMovement.js

module.exports = (sequelize, DataTypes) => {
    const ProductStockMovement = sequelize.define('ProductStockMovement', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        // Jika NULL = Pergerakan stok Produk Simple (Induk)
        // Jika TERISI = Pergerakan stok Produk Variasi
        variant_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        // Jenis transaksi: Masuk, Keluar, atau Penyesuaian (Opname)
        type: {
            type: DataTypes.ENUM('in', 'out', 'adjustment'),
            allowNull: false
        },
        // Jumlah perubahan. Contoh: +10 (Masuk), -5 (Keluar)
        qty_change: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        // Saldo akhir SETELAH transaksi ini terjadi (Snapshot)
        // Ini penting agar kita tidak perlu hitung ulang dari awal sejarah
        balance_after: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        // Asal transaksi (Opsional)
        // Contoh: "INITIAL" (Produk baru), "ORDER" (Penjualan), "OPNAME" (Koreksi Admin)
        reference_type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // ID Referensi (Misal: No Invoice, atau ID Opname)
        reference_id: {
            type: DataTypes.STRING, 
            allowNull: true
        },
        // Catatan manual (misal: "Barang rusak kena air")
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Siapa yang input (User ID)
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'product_stock_movements',
        timestamps: true, // created_at otomatis mencatat waktu transaksi
        updatedAt: false  // History stok bersifat abadi (tidak boleh diedit tanggalnya
    });

    ProductStockMovement.associate = (models) => {
        ProductStockMovement.belongsTo(models.Product, { foreignKey: 'product_id', as: 'Product' });
        ProductStockMovement.belongsTo(models.ProductVariant, { foreignKey: 'variant_id', as: 'Variant' });
        ProductStockMovement.belongsTo(models.User, { foreignKey: 'created_by', as: 'User' }); // Uncomment jika sudah ada tabel User
    };

    return ProductStockMovement;
};