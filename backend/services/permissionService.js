// services/permissionService.js
const { User, Role, Permission, UserPermission } = require("../models");

/**
 * Mengambil daftar izin efektif pengguna dari DB (Role + Override)
 * @param {number} userId - ID pengguna yang sedang login
 * @returns {Array<string>} Daftar nama izin efektif
 */
async function getEffectivePermissionsFromDB(userId) {
  let permissionsSet = new Set();
  const deniedPermissions = [];

  // 1. Ambil Izin dari Role & Tentukan Role Name (untuk Superadmin Check)
  const userWithRoles = await User.findByPk(userId, {
    attributes: ["id"],
    include: [
      {
        model: Role,
        attributes: ["name"], // Ambil nama role (misal: 'superadmin')
        include: [
          {
            model: Permission,
            attributes: ["name"],
          },
        ],
      },
    ],
  });

  //console.log("LOG [RBA Debug]: Data User Ditemukan:", JSON.stringify(userWithRoles, null, 2));

  if (!userWithRoles) {
    return [];
  }

  // 2. Cek apakah salah satu role adalah 'superadmin'
  const isSuperAdmin = userWithRoles.Roles.some(
    (role) => role.name.toLowerCase() === "superadmin"
  );

  if (isSuperAdmin) {
    // console.log(`LOG [RBA]: User adalah Superadmin ID: ${userId}. Memberikan akses penuh.`);

    // 1. Ambil semua izin dari DB (hanya nama)
    const allPermissionsFromDB = await Permission.findAll({
      attributes: ["name"],
    });

    // 2. Konversi ke array of string
    let superAdminPermissions = allPermissionsFromDB.map((perm) => perm.name);

    // 3. Hardcode izin tambahan yang pasti diperlukan
    const hardcodedPermissions = [
      "manage-menu", // Izin yang Anda butuhkan
      "manage-system", // Tambahkan ini sekalian, jaga-jaga jika di masa depan menu ini akan menjadi parent lagi.
    ];

    // 4. Gabungkan dan hapus duplikasi menggunakan Set
    const finalPermissionsSet = new Set([
      ...superAdminPermissions,
      ...hardcodedPermissions,
    ]);

    // Kembalikan array string final
    return Array.from(finalPermissionsSet);
  }

  // 3. Kumpulkan Izin dari Roles (Hanya jika BUKAN Superadmin)
  userWithRoles.Roles.forEach((role) => {
    if (role.Permissions) {
      role.Permissions.forEach((perm) => {
        permissionsSet.add(perm.name);
      });
    }
  });

  // 4. Ambil Izin Override (Allow & Deny) - Logika sisanya tidak berubah
  const overrides = await UserPermission.findAll({
    where: { user_id: userId },
    attributes: ["type"],
    include: [{ model: Permission, attributes: ["name"] }],
  });

  // 5. Terapkan Logika Override
  overrides.forEach((override) => {
    // ... (Logika Allow/Deny) ...
  });

  // 6. Final Filter
  const finalPermissions = Array.from(permissionsSet).filter(
    (name) => !deniedPermissions.includes(name)
  );

  return finalPermissions;
}

module.exports = {
  getEffectivePermissionsFromDB,
};
