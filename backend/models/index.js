// backend/models/index.js
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const db = {};

// ============================================================
// 1. KONEKSI DATABASE (MENGGUNAKAN STYLE LAMA ANDA via .env)
// ============================================================
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || 'mysql', // Fallback ke mysql jika env kosong
        logging: false, 
        define: {
            timestamps: false // Sesuai config lama Anda
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// ============================================================
// 2. LOAD MODELS SECARA OTOMATIS (PENTING UNTUK VARIASI)
// ============================================================
// Ini akan membaca semua file di folder models secara otomatis
// sehingga Anda TIDAK PERLU lagi mengetik require manual satu per satu.
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && // Abaikan file hidden
      file !== basename &&       // Abaikan file index.js ini sendiri
      file.slice(-3) === '.js' && // Hanya ambil file .js
      file.indexOf('.test.js') === -1 // Abaikan file test
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// ============================================================
// 3. JALANKAN ASOSIASI (RELASI)
// ============================================================
// Loop ini akan mengecek setiap model. Jika di dalam file model tersebut
// ada fungsi "associate", maka fungsi itu akan dijalankan.
// INI YANG MEMPERBAIKI ERROR "ProductVariationOption is not associated"
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// ============================================================
// 4. MANUAL ASOSIASI (OPSIONAL / LEGACY)
// ============================================================
// Jika file User.js, Role.js, dll BELUM memiliki method 'associate' di dalamnya,
// Anda bisa menaruh definisi manual di bawah sini agar aplikasi tidak error.
// TAPI: Sangat disarankan memindahkan logika ini ke dalam file model masing-masing.

// Contoh cek agar tidak error jika model belum terload
if (db.User && db.Role) {
    // Definisi Many-to-Many User <-> Role (Jika belum ada di model masing-masing)
    db.User.belongsToMany(db.Role, { through: 'user_roles', foreignKey: 'user_id', otherKey: 'role_id' });
    db.Role.belongsToMany(db.User, { through: 'user_roles', foreignKey: 'role_id', otherKey: 'user_id' });
}

// Export Database
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;