// models/userPermission.js
module.exports = (sequelize, DataTypes) => {
    const UserPermission = sequelize.define('UserPermission', {
        type: {
            type: DataTypes.ENUM('allow', 'deny'),
            allowNull: false,
            defaultValue: 'allow'
        }
    }, {
        tableName: 'user_permission',
        timestamps: false,
        primaryKey: ['user_id', 'permission_id'] // Compound Primary Key
    });
    return UserPermission;
};