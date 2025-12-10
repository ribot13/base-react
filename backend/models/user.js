// models/user.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        full_name: {
            type: DataTypes.STRING(255)
        },
        email: {
            type: DataTypes.STRING(255)
        },
        birthday: {
            type: DataTypes.STRING(255)
        },
        is_active: {
            type: DataTypes.TINYINT(1)
        },
        
    }, {
        tableName: 'users',
        timestamps: true, // Sesuaikan ini dengan kolom created_at/updated_at Anda
        underscored: true // Opsional: jika kolom DB Anda menggunakan snake_case (misal: full_name)
    });

    User.associate = (models) => {
        User.belongsToMany(models.Role, { through: 'user_roles', foreignKey: 'user_id', otherKey: 'role_id' });
    };

    return User;
};