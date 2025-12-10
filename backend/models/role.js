// models/role.js
module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'roles',
        timestamps: false // Opsional: Sesuaikan jika Anda menggunakan created_at/updated_at
    });

    Role.associate = (models) => {
        Role.belongsToMany(models.User, { through: 'user_roles', foreignKey: 'role_id', otherKey: 'user_id' });
        Role.belongsToMany(models.Permission, { through: 'role_permissions', foreignKey: 'role_id', otherKey: 'permission_id' });
    };

    return Role;
};