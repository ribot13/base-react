// models/permission.js
module.exports = (sequelize, DataTypes) => {
    const Permission = sequelize.define('Permission', {
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'permissions',
        timestamps: false
    });

    Permission.associate = (models) => {
        Permission.belongsToMany(models.Role, { through: 'role_permissions', foreignKey: 'permission_id', otherKey: 'role_id' });
    };

    return Permission;
};