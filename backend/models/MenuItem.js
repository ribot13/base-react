// backend/models/MenuItem.js

module.exports = (sequelize, DataTypes) => {
    const MenuItem = sequelize.define('MenuItem', {
        // 1. ID (Primary Key) - HILANG DI KODE ANDA SEBELUMNYA
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        
        // 2. title
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        
        // 3. path
        path: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true
        },
        
        // 4. required_permission
        required_permission: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        
        // 5. icon_name
        icon_name: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        
        // 6. parent_id
        parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'parent_id',
            references: {
                model: 'menu_items', 
                key: 'id',
            },
        },
        
        // 7. order_index
        order_index: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            defaultValue: 0,
        },
        
        // 8. is_active
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        // 9. show_in_menu
        show_in_menu: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        
    }, {
        tableName: 'menu_items',
        timestamps: true,
        underscored: true
    });

    // Asosiasi Self-Referencing (Parent-Child)
    MenuItem.associate = (models) => {
        MenuItem.belongsTo(models.MenuItem, { 
            as: 'Parent', 
            foreignKey: 'parent_id' 
        });

        MenuItem.hasMany(models.MenuItem, { 
            as: 'Children', 
            foreignKey: 'parent_id' 
        });
    };

    return MenuItem;
};