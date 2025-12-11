// controllers/user.controller.js

const { User, Role } = require('../models'); // Pastikan Anda mengimpor Role
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

// DEFINISI HIERARKI ROLE (Harus sinkron dengan auth.controller.js)
const ROLE_LEVELS = {
    'user': 1,
    'staff': 2,
    'admin': 3,
    'superadmin': 4,
};

/**
 * Helper function untuk mendapatkan level tertinggi dari role pengguna.
 * Diperlukan untuk perbandingan otorisasi.
 */
const getUserHighestLevel = (userRoles) => {
    if (!userRoles || userRoles.length === 0) return 0;
    let highestLevel = 0;
    userRoles.forEach(role => {
        const roleName = role.name.toLowerCase();
        const level = ROLE_LEVELS[roleName] || 0; 
        if (level > highestLevel) {
            highestLevel = level;
        }
    });
    return highestLevel;
};


// ----------------------------------------------------
// 1. GET ALL USERS (findAll)
// ----------------------------------------------------

exports.findAll = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'full_name', 'username', 'email', 'is_active', 'createdAt', 'updatedAt'],
            include: [{
                model: Role,
                attributes: ['id', 'name'],
                through: { attributes: [] } // Exclude pivot table attributes
            }]
        });

        // Map hasil untuk menambahkan highestRoleLevel (untuk logic delete di frontend/backend)
        const usersWithLevel = users.map(user => {
            const userPlain = user.get({ plain: true });
            const highestRoleLevel = getUserHighestLevel(userPlain.Roles);
            const highestRoleName = Object.keys(ROLE_LEVELS).find(key => ROLE_LEVELS[key] === highestRoleLevel);
            
            return {
                ...userPlain,
                highestRoleLevel,
                highestRoleName: highestRoleName || 'user',
            };
        });

        res.status(200).json(usersWithLevel);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Gagal mengambil daftar pengguna." });
    }
};

exports.findOne = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Role, attributes: ['id', 'name'], through: { attributes: [] } }]
        });
        if (!user) return res.status(404).json({ message: "Pengguna tidak ditemukan." });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data pengguna." });
    }
};


// ----------------------------------------------------
// 2. CREATE NEW USER (create)
// ----------------------------------------------------

exports.create = async (req, res) => {
    const { full_name, username, email, password, role_ids } = req.body;

    if (!username || !password || !full_name || !role_ids || role_ids.length === 0) {
        return res.status(400).json({ message: "Semua kolom wajib diisi, termasuk Role." });
    }

    try {
        // Cek duplikasi username
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: "Username sudah digunakan." });
        }

        // 1. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Buat User baru
        const newUser = await User.create({
            full_name,
            username,
            email,
            password: hashedPassword,
            is_active: true,
            _deleted: 0,
        });

        // 3. Tambahkan Role melalui pivot table
        const roles = await Role.findAll({ where: { id: { [Op.in]: role_ids } } });
        await newUser.setRoles(roles); // Menggunakan setter Sequelize untuk Many-to-Many

        res.status(201).json({ message: "Pengguna berhasil ditambahkan.", user: newUser });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Gagal membuat pengguna." });
    }
};


// ----------------------------------------------------
// 3. UPDATE USER (update)
// ----------------------------------------------------

exports.update = async (req, res) => {
    const targetUserId = req.params.id;
    const { full_name, username, email, password, role_ids, is_active } = req.body;
    const deleterLevel = req.user.highestRoleLevel; // Level pengguna yang sedang login
    const deleterUserId = req.user.id; 

    try {
        const targetUser = await User.findByPk(targetUserId, {
            include: [{ model: Role, attributes: ['name'], through: { attributes: [] } }],
        });

        if (!targetUser) {
            return res.status(404).json({ message: "Pengguna tidak ditemukan." });
        }

        // 🎯 Otorisasi Update: Cek Level Role
        const targetLevel = getUserHighestLevel(targetUser.Roles.map(r => ({ name: r.name })));
        
        // Superadmin tidak boleh mengedit Superadmin lain, kecuali dirinya sendiri (jika diperlukan)
        // Kita gunakan logika yang sama dengan delete: hanya boleh edit user dengan level LEBIH RENDAH.
        // ATAU, user boleh edit datanya sendiri.
        if (deleterLevel <= targetLevel && targetUserId !== deleterUserId) {
             return res.status(403).json({ 
                message: "Akses ditolak. Anda hanya dapat mengedit pengguna dengan level role di bawah Anda." 
            });
        }
        
        // 1. Update Password (jika disediakan)
        let updateData = { full_name, username, email, is_active };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        
        // 2. Eksekusi Update data dasar
        await targetUser.update(updateData);

        // 3. Update Roles (jika disediakan)
        if (role_ids && Array.isArray(role_ids)) {
            const roles = await Role.findAll({ where: { id: { [Op.in]: role_ids } } });
            await targetUser.setRoles(roles); // Mengganti semua role yang ada
        }

        res.status(200).json({ message: "Pengguna berhasil diperbarui." });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Gagal memperbarui pengguna." });
    }
};


// ----------------------------------------------------
// 4. DELETE USER (delete)
// ----------------------------------------------------

exports.delete = async (req, res) => {
    const targetUserId = parseInt(req.params.id); // ID user yang akan dihapus
    const deleterUserId = req.user.id; // ID user yang sedang login
    const deleterLevel = req.user.highestRoleLevel; // Level tertinggi user yang sedang login

    // 1. Cek: Tidak bisa menghapus diri sendiri
    if (targetUserId === deleterUserId) {
        return res.status(403).json({ message: "Anda tidak dapat menghapus akun Anda sendiri." });
    }

    try {
        // 2. Cari target user dan role-nya
        const targetUser = await User.findByPk(targetUserId, {
            include: [{ model: Role, attributes: ['name'], through: { attributes: [] } }],
        });

        if (!targetUser) {
            return res.status(404).json({ message: "Pengguna tidak ditemukan." });
        }

        // 3. Hitung level role tertinggi dari target user
        const targetRoleNames = targetUser.Roles.map(role => ({ name: role.name }));
        const targetLevel = getUserHighestLevel(targetRoleNames);

        // 4. 🎯 Otorisasi Delete: Perbandingan Level Role
        // Pengguna yang menghapus HARUS memiliki level role yang lebih tinggi daripada target
        if (deleterLevel <= targetLevel) {
            return res.status(403).json({ 
                message: "Akses ditolak. Anda tidak memiliki wewenang untuk menghapus pengguna ini karena level role Anda tidak lebih tinggi." 
            });
        }

        // 5. Eksekusi Penghapusan (Secara fisik atau soft delete)
        await targetUser.destroy();

        res.status(200).json({ message: "Pengguna berhasil dihapus." });

    } catch (error) {
        console.error("Kesalahan saat menghapus pengguna:", error);
        res.status(500).json({ message: "Gagal menghapus pengguna." });
    }
};

// ==========================================
// 1. GET PROFILE (Current User)
// ==========================================
exports.getProfile = async (req, res) => {
    try {
        // ID diambil dari token yang diverifikasi di middleware (req.user.id)
        const userId = req.user.id; 
        //console.log(`USER ID: ${req}`);
        
        const user = await User.findByPk(userId, {
            attributes: { 
                // Exclude password untuk keamanan
                exclude: ['password', 'role_id', 'created_at', 'updated_at'] 
            },
            include: [{ model: Role, as: 'Role', attributes: ['name'] }]
        });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 2. UPDATE PROFILE (Data Pribadi)
// ==========================================
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, birthday, email } = req.body;
        
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

        // Validasi minimal (Misal: email unik)
        if (email && email !== user.email) {
            const existing = await User.findOne({ where: { email } });
            if (existing) {
                return res.status(400).json({ message: "Email sudah digunakan oleh user lain." });
            }
        }

        await user.update({
            full_name, 
            birthday: birthday || null, // Tangani jika birthday kosong
            email
        });

        res.json({ message: "Profil berhasil diperbarui." });

    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 3. CHANGE PASSWORD
// ==========================================
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { old_password, new_password } = req.body;

        if (!old_password || !new_password) {
            return res.status(400).json({ message: "Password lama dan baru wajib diisi." });
        }
        
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

        // A. VALIDASI PASSWORD LAMA
        const passwordIsValid = bcrypt.compareSync(
            old_password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).json({ message: "Password lama salah." });
        }

        // B. HASH PASSWORD BARU & UPDATE
        const salt = bcrypt.genSaltSync(10);
        const newPasswordHash = bcrypt.hashSync(new_password, salt);

        await user.update({ password: newPasswordHash });

        res.json({ message: "Password berhasil diubah." });

    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: error.message });
    }
};