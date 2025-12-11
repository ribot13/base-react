// backend/services/permissionService.js
const { User, UserPermission, AppModulePermission, AppModule } = require('../models');
const { Op } = require('sequelize');

const ROLE_LEVELS = {
    'user': 1,
    'staff': 2,
    'admin': 3,
    'superadmin': 99
};

/**
 * Menghitung ulang permission user dan update cache JSON
 * @param {number} userId 
 */
exports.refreshUserPermissions = async (userId) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        const userRoleLevel = user.role_level || ROLE_LEVELS[user.role] || 1;

        // 1. Ambil semua permission yang boleh diakses oleh role level ini
        // Logic: default_allowed_role <= userRoleLevel
        const allowedPermissions = await AppModulePermission.findAll({
            where: {
                default_allowed_role: {
                    [Op.lte]: userRoleLevel // Less than or equal
                }
            },
            attributes: ['permission_name']
        });

        // 2. Konversi ke array string simple
        // Contoh: ['product.view', 'product.create']
        let permissionList = allowedPermissions.map(p => p.permission_name);

        // 3. (Override Logic - Future)
        // Di sini nanti kita bisa tambahkan query ke tabel `custom_permissions` 
        // jika ingin memberi akses khusus di luar role.
        
        // 4. Update atau Create ke tabel user_permissions (JSON)
        const [permRecord, created] = await UserPermission.findOrCreate({
            where: { user_id: userId },
            defaults: { permissions: permissionList }
        });

        if (!created) {
            permRecord.permissions = permissionList;
            permRecord.last_updated = new Date();
            await permRecord.save();
        }

        return permissionList;

    } catch (error) {
        console.error("Failed to refresh permissions:", error);
        throw error;
    }
};

/**
 * Mendapatkan level role dari string role
 */
exports.getRoleLevel = (roleName) => {
    return ROLE_LEVELS[roleName] || 0;
};