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
    return Permission;
};