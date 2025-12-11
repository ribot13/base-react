// backend/models/appModule.js
module.exports = (sequelize, DataTypes) => {
    const AppModule = sequelize.define('AppModule', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        module_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        module_path: {
            type: DataTypes.STRING,
            allowNull: true // Bisa null jika ini hanya parent menu
        },
        module_icon: {
            type: DataTypes.STRING, // Nama icon (misal: 'FiBox')
            allowNull: true
        },
        min_role_level: {
            type: DataTypes.INTEGER,
            defaultValue: 1, // 1: User, 2: Staff, 3: Admin, 99: Superadmin
            comment: "Level role minimum untuk melihat menu ini"
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'app_modules',
        timestamps: false
    });

    AppModule.associate = (models) => {
        // Satu modul punya banyak permission (aksi)
        AppModule.hasMany(models.AppModulePermission, { 
            foreignKey: 'module_id', 
            as: 'Permissions',
            onDelete: 'CASCADE'
        });
    };

    return AppModule;
};