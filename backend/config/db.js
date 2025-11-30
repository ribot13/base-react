// backend/config/db.js
const mysql = require('mysql2');
require('dotenv').config(); // Memuat variabel dari .env

// Konfigurasi koneksi menggunakan variabel lingkungan
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Batasi jumlah koneksi
    queueLimit: 0
});

// Ekspor pool dengan dukungan promise
module.exports = pool.promise();