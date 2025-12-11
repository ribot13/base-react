// backend/models/appModulePermission.js
module.exports = (sequelize, DataTypes) => {
    const AppModulePermission = sequelize.define('AppModulePermission', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        module_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        permission_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            comment: "Slug unik, misal: 'product.create', 'user.view'"
        },
        permission_title: {
            type: DataTypes.STRING,
            comment: "Label yang mudah dibaca, misal: 'Tambah Data Produk'"
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        default_allowed_role: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "Level role minimal default. Jika NULL, semua level boleh (jika punya akses modul)."
        }
    }, {
        tableName: 'app_module_permissions',
        timestamps: false
    });

    AppModulePermission.associate = (models) => {
        AppModulePermission.belongsTo(models.AppModule, { 
            foreignKey: 'module_id', 
            as: 'Module' 
        });
    };

    return AppModulePermission;
};