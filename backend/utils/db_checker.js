// utils/db_checker.js

// Asumsikan Anda menggunakan modul db yang sama dengan yang ada di ProductController
const db = require("../config/db"); // Sesuaikan path jika perlu

const checkDatabaseConnection = async () => {
    console.log("🚀 Memeriksa koneksi database MySQL...");
    try {
        // Coba mendapatkan koneksi dari pool.
        // Jika pool kosong atau DB tidak merespons, ini akan gagal.
        const connection = await db.getConnection();
        
        // Coba jalankan query sederhana (misal: SELECT 1)
        await connection.query('SELECT 1'); 

        // Rilis koneksi kembali ke pool
        connection.release(); 

        console.log("✅ Koneksi MySQL berhasil! Database berjalan normal.");
        return true;
    } catch (error) {
        console.error("❌ KONEKSI MYSQL GAGAL!");
        console.error("   Pastikan server MySQL (XAMPP/WAMP/lainnya) sedang berjalan.");
        console.error("   Detail Error:", error.message);
        
        // Log error dengan warna merah untuk penekanan
        console.error("\x1b[31m%s\x1b[0m", "💥 Server backend akan berhenti karena koneksi database gagal.");
        
        // Mengembalikan false untuk menandakan kegagalan
        return false;
    }
};

module.exports = { checkDatabaseConnection };