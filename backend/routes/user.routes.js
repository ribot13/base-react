// backend/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth'); 
const { fetchPermissions, hasPermission } = require('../middlewares/permission.middleware'); 

// ==================================================================
// 1. ROUTE PROFILE (WAJIB DI PALING ATAS!)
// ==================================================================
// Route ini khusus user login (akses diri sendiri)
// Jika ditaruh di bawah /:id, "profile" akan dianggap sebagai ID user (Error 404/Empty Form)

router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.post('/profile/change-password', verifyToken, userController.changePassword);

// ==================================================================
// 2. ROUTE MANAJEMEN USER (ADMIN)
// ==================================================================

// GET - Ambil semua User
router.get('/', verifyToken,  userController.findAll);

// POST - Buat User Baru
router.post('/', verifyToken,  userController.create);

// ------------------------------------------------------------------
// ROUTE DINAMIS (/:id) HARUS DI PALING BAWAH
// ------------------------------------------------------------------

// GET - Ambil user by ID
router.get('/:id', verifyToken,  userController.findOne);

// PUT - Update User by ID
router.put('/:id', verifyToken,  userController.update);

// DELETE - Hapus User by ID
router.delete('/:id', verifyToken,  userController.delete);

module.exports = router;