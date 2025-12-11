// backend/reset_password.js
require('dotenv').config(); // Load config DB
const bcrypt = require('bcryptjs'); // Atau 'bcrypt', sesuaikan dengan package.json Anda
const db = require('./models');

const TARGET_USERNAME = 'root'; // Ganti dengan username admin Anda (misal: admin, atau superadmin)
const NEW_PASSWORD = 'Knjds123'; // Password baru yang diinginkan

const resetPassword = async () => {
    try {
        console.log("🔄 Menghubungkan ke Database...");
        
        // Cari user berdasarkan username
        const user = await db.User.findOne({ 
            where: { username: TARGET_USERNAME } 
        });

        if (!user) {
            console.error(`❌ User dengan username '${TARGET_USERNAME}' tidak ditemukan!`);
            // Coba cari ID 1 sebagai alternatif
            const userById = await db.User.findByPk(1);
            if(userById) {
                console.log(`⚠️ Menemukan user ID 1 dengan username '${userById.username}'. Menggunakan user ini...`);
                await processUpdate(userById);
            } else {
                process.exit(1);
            }
        } else {
            await processUpdate(user);
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
};

const processUpdate = async (user) => {
    // Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

    // Update data
    await user.update({
        password: hashedPassword,
        role: 'superadmin', // Sekalian pastikan role benar
        role_level: 99
    });

    console.log(`✅ BERHASIL!`);
    console.log(`👤 Username : ${user.username}`);
    console.log(`🔑 Password : ${NEW_PASSWORD}`);
    console.log(`🛡️  Role     : ${user.role}`);
    process.exit(0);
};

resetPassword();