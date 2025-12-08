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

if (db.ProductCategory && db.ProductCategory.associate) {
    db.ProductCategory.associate(db);
}

module.exports = db;