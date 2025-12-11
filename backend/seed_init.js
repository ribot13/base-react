// backend/seed_init.js
require('dotenv').config();

const { Sequelize } = require('sequelize');
const db = require('./models'); // Pastikan path ini benar ke models/index.js
const { refreshUserPermissions } = require('./services/permissionService');

// Data Master Modul & Permission
const MODULES_DATA = [
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: "FiHome",
        min_level: 1, // User biasa bisa akses
        permissions: [
            { name: "dashboard.view", title: "Melihat Dashboard", min_role: 1 }
        ]
    },
    {
        name: "Manajemen Produk",
        path: "/products",
        icon: "FiBox",
        min_level: 2, // Minimal Staff
        permissions: [
            { name: "product.view", title: "Melihat Produk", min_role: 2 }, // Staff
            { name: "product.create", title: "Tambah Produk", min_role: 2 }, // Staff
            { name: "product.edit", title: "Edit Produk", min_role: 2 }, // Staff
            { name: "product.delete", title: "Hapus Produk", min_role: 3 }, // Hanya Admin
            { name: "product.stock_adjust", title: "Atur Stok Manual", min_role: 3 } // Admin
        ]
    },
    {
        name: "Kategori Produk",
        path: "/products/categories",
        icon: "FiList",
        min_level: 2, // Minimal Staff
        permissions: [
            { name: "category.view", title: "Melihat Kategori", min_role: 2 },
            { name: "category.manage", title: "Kelola Kategori", min_role: 2 }
        ]
    },
    {
        name: "Manajemen User",
        path: "/admin/users",
        icon: "FiUsers",
        min_level: 3, // Minimal Admin
        permissions: [
            { name: "user.view", title: "Melihat User", min_role: 3 },
            { name: "user.create", title: "Tambah User", min_role: 3 },
            { name: "user.edit", title: "Edit User", min_role: 3 },
            { name: "user.delete", title: "Hapus User", min_role: 3 },
            { name: "user.manage_role", title: "Mengatur Role User", min_role: 3 }
        ]
    },
    {
        name: "Pengaturan Aplikasi",
        path: "/settings",
        icon: "FiSettings",
        min_level: 99, // Hanya Superadmin
        permissions: [
            { name: "settings.manage", title: "Kelola Pengaturan", min_role: 99 }
        ]
    }
];

const seedDatabase = async () => {
    try {
        console.log("🔄 Memulai Seeding...");
        
        // 1. Reset Tabel Permission (Opsional, agar bersih)
        // await db.AppModulePermission.destroy({ where: {}, truncate: true });
        // await db.AppModule.destroy({ where: {}, truncate: true });

        for (const mod of MODULES_DATA) {
            // A. Create/Update Module
            const [moduleRecord] = await db.AppModule.findOrCreate({
                where: { module_path: mod.path },
                defaults: {
                    module_name: mod.name,
                    module_icon: mod.icon,
                    min_role_level: mod.min_level
                }
            });
            
            // Update jika ada perubahan nama/icon
            await moduleRecord.update({ 
                module_name: mod.name, 
                min_role_level: mod.min_level 
            });

            console.log(`✅ Modul: ${mod.name}`);

            // B. Create/Update Permissions
            for (const perm of mod.permissions) {
                const [pRecord] = await db.AppModulePermission.findOrCreate({
                    where: { permission_name: perm.name },
                    defaults: {
                        module_id: moduleRecord.id,
                        permission_title: perm.title,
                        default_allowed_role: perm.min_role
                    }
                });
                
                // Pastikan module_id dan level terupdate
                await pRecord.update({ 
                    module_id: moduleRecord.id,
                    default_allowed_role: perm.min_role
                });
            }
        }

        console.log("✅ Semua Modul & Permission berhasil dimuat.");

        // 2. Setup Superadmin (User ID 1)
        const superUserId = 1; // Asumsi User pertama adalah owner
        const superUser = await db.User.findByPk(superUserId);

        if (superUser) {
            console.log("🔄 Mengupdate User ID 1 menjadi Superadmin...");
            await superUser.update({
                role: 'superadmin',
                role_level: 99
            });

            // 3. Generate Permission Cache untuk Superadmin
            console.log("🔄 Generating permission cache...");
            const permissions = await refreshUserPermissions(superUserId);
            console.log("✅ Superadmin Permissions:", permissions.length, "items");
        } else {
            console.log("⚠️ User ID 1 tidak ditemukan. Silakan register user dulu.");
        }

        console.log("🎉 SEEDING SELESAI!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Error Seeding:", error);
        process.exit(1);
    }
};

seedDatabase();