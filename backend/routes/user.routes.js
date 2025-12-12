// backend/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth'); 
const { fetchPermissions, hasPermission } = require('../middlewares/permission.middleware'); 

// ==================================================================
// 1. ROUTE PROFILE (Akses Diri Sendiri)
// ==================================================================
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.post('/profile/change-password', verifyToken, userController.changePassword);

// ==================================================================
// 2. ROUTE MANAJEMEN USER (ADMIN)
// ==================================================================

// 💡 PERBAIKAN: Gunakan permission standar 'user.view'
// Pastikan di database menu_items, kolom required_permission untuk menu "Kelola User" juga 'user.view'
const viewPermission = 'user.view'; 
const managePermission = 'user.manage'; // Atau sesuaikan dengan kebutuhan (misal user.manage)
const editPermission = 'user.edit'; // Atau sesuaikan dengan kebutuhan (misal user.manage)
const deletePermission = 'user.delete'; // Atau sesuaikan dengan kebutuhan (misal user.manage)
const createPermission = 'user.haha'; // Atau sesuaikan dengan kebutuhan (misal user.manage)

// GET - Ambil semua User (Gunakan viewPermission)
router.get('/', [verifyToken, fetchPermissions, hasPermission(viewPermission)], userController.findAll);

// POST - Buat User Baru (Gunakan createPermission atau managePermission)
router.post('/', [verifyToken, fetchPermissions, hasPermission(createPermission)], userController.create);

// ------------------------------------------------------------------
// ROUTE DINAMIS (/:id)
// ------------------------------------------------------------------

// GET - Ambil user by ID
router.get('/:id', [verifyToken, fetchPermissions, hasPermission(viewPermission)], userController.findOne);

// PUT - Update User by ID
router.put('/:id', [verifyToken, fetchPermissions, hasPermission(createPermission)], userController.update);

// DELETE - Hapus User by ID
router.delete('/:id', [verifyToken, fetchPermissions, hasPermission(deletePermission)], userController.delete);

module.exports = router;