// models/index.js

const { Sequelize, DataTypes } = require('sequelize');
// Pastikan file index.js Anda tidak mencoba memuat config.json lagi

// Ambil data langsung dari environment variables (process.env)
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        // 👇 INI YANG HILANG ATAU TIDAK TERBACA
        dialect: process.env.DB_DIALECT, 
        // 👆 PASTIKAN DB_DIALECT di .env adalah 'mysql'

        logging: false, 
        define: {
            timestamps: false
        }
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// --- Impor Semua Model Anda ---
// Pastikan semua model diimpor di sini, termasuk User dan 4 model RBA baru
db.User = require('./user')(sequelize, DataTypes);
db.Role = require('./role')(sequelize, DataTypes);
db.Permission = require('./permission')(sequelize, DataTypes);
db.UserPermission = require('./userPermission')(sequelize, DataTypes); 
db.MenuItem=require('./MenuItem')(sequelize,DataTypes);
db.ProductCategory=require('./productCategory')(sequelize,DataTypes);
db.Product = require('./product')(sequelize, DataTypes);
db.ProductStock = require('./productStock')(sequelize, DataTypes);
db.ProductImage = require('./productImage')(sequelize, DataTypes);
db.ProductWholesale = require('./productWholesale')(sequelize, DataTypes);
db.Catalog=require('./catalog')(sequelize, DataTypes);
db.ProductCatalog=require('./productCatalog')(sequelize, DataTypes);
//variasi produk
const variationModels = require('./productVariation')(sequelize, DataTypes);
db.ProductVariationGroup = variationModels.ProductVariationGroup;
db.ProductVariationOption = variationModels.ProductVariationOption;
db.ProductVariant = variationModels.ProductVariant;
// Anda mungkin juga perlu membuat model untuk tabel pivot user_roles dan role_permissions
// Jika Anda tidak menggunakan file model terpisah, Sequelize akan membuatnya secara implisit.


// --- Definisikan Asosiasi RBA (Kunci Logika Sequelize) ---
// Hubungan User - Role (Many-to-Many)
db.User.belongsToMany(db.Role, { through: 'user_roles', foreignKey: 'user_id', otherKey: 'role_id' });
db.Role.belongsToMany(db.User, { through: 'user_roles', foreignKey: 'role_id', otherKey: 'user_id' });

// Hubungan Role - Permission (Many-to-Many)
db.Role.belongsToMany(db.Permission, { through: 'role_permissions', foreignKey: 'role_id', otherKey: 'permission_id' });
db.Permission.belongsToMany(db.Role, { through: 'role_permissions', foreignKey: 'permission_id', otherKey: 'role_id' });

// Hubungan User - Permission (Override Many-to-Many)
db.User.belongsToMany(db.Permission, { through: db.UserPermission, foreignKey: 'user_id', otherKey: 'permission_id' });
db.Permission.belongsToMany(db.User, { through: db.UserPermission, foreignKey: 'permission_id', otherKey: 'user_id' });

// Asosiasi langsung ke pivot UserPermission (penting untuk fungsi getEffectivePermissionsFromDB)
db.UserPermission.belongsTo(db.User, { foreignKey: 'user_id' });
db.UserPermission.belongsTo(db.Permission, { foreignKey: 'permission_id' });

// B. Relasi Kategori Produk
if (db.ProductCategory && db.ProductCategory.associate) {
    db.ProductCategory.associate(db);
}

// C. Relasi Produk (PENTING: Ini yang sebelumnya hilang)
if (db.Product && db.Product.associate) {
    db.Product.associate(db);
}

if (db.Catalog && db.Catalog.associate) {
    db.Catalog.associate(db);
}
if (db.ProductCatalog && db.ProductCatalog.associate) {
    db.ProductCatalog.associate(db);
}

// 1. Relasi Product ke Variation Groups
db.Product.hasMany(db.ProductVariationGroup, { foreignKey: 'product_id', as: 'VariationGroups', onDelete: 'CASCADE' });
db.ProductVariationGroup.belongsTo(db.Product, { foreignKey: 'product_id' });

// 2. Relasi Product ke Variants (SKU)
db.Product.hasMany(db.ProductVariant, { foreignKey: 'product_id', as: 'Variants', onDelete: 'CASCADE' });
db.ProductVariant.belongsTo(db.Product, { foreignKey: 'product_id' });


    

module.exports = db;