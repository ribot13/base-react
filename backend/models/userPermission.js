// backend/models/userPermission.js
module.exports = (sequelize, DataTypes) => {
    const UserPermission = sequelize.define('UserPermission', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true, // 1 User = 1 Row Permission
            allowNull: false
        },
        // Menyimpan array permission dalam JSON
        // Contoh: ["product.view", "product.create", "report.view"]
        permissions: {
            type: DataTypes.JSON, 
            allowNull: false,
            defaultValue: []
        },
        last_updated: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'user_permissions',
        timestamps: false
    });

    UserPermission.associate = (models) => {
        UserPermission.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
    };

    return UserPermission;
};