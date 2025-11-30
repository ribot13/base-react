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
    return Role;
};