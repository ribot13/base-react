// backend/models/user.js
const ROLE_LEVELS = {
    'user': 1,
    'staff': 2,
    'admin': 3,
    'superadmin': 99
};

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
            type: DataTypes.TINYINT(1),
            defaultValue: 1
        },
        // --- FIELD BARU UNTUK OPTIMASI ROLE ---
        role: {
            type: DataTypes.ENUM('superadmin', 'admin', 'staff', 'user'),
            allowNull: false,
            defaultValue: 'user'
        },
        role_level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: "1=User, 2=Staff, 3=Admin, 99=Superadmin"
        }
    }, {
        tableName: 'users',
        timestamps: true,
        underscored: true,
        hooks: {
            // Hook otomatis: Set role_level berdasarkan role string sebelum save
            beforeSave: (user) => {
                if (user.role) {
                    user.role_level = ROLE_LEVELS[user.role] || 1;
                }
            }
        }
    });

    User.associate = (models) => {
        // Relasi lama (UserRoles) kita hapus/komentari karena kita pakai single role
        // User.belongsToMany(models.Role, { through: 'user_roles', ... });
        
        // Relasi ke JSON Permission Cache
        User.hasOne(models.UserPermission, { 
            foreignKey: 'user_id', 
            as: 'Permissions',
            onDelete: 'CASCADE' 
        });
    };

    return User;
};