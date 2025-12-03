// routes/user.routes.js
const express = require('express');
const router = express.Router();
// 🎯 Import Controller dan Middlewares yang Anda miliki
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth'); 
const { fetchPermissions, hasPermission } = require('../middlewares/permission.middleware'); 


// 🎯 Definisikan Izin yang diperlukan untuk mengelola User
const permission = 'manage-users';

// Middleware yang dibutuhkan: [verifyToken, fetchPermissions, hasPermission(permission)]

// 1. GET - Ambil semua User (Read All)
router.get('/', [verifyToken, fetchPermissions, hasPermission(permission)], userController.findAll);

router.get('/:id', [verifyToken, fetchPermissions, hasPermission(permission)], userController.findOne);

// 2. POST - Buat User Baru (Create)
router.post('/', [verifyToken, fetchPermissions, hasPermission(permission)], userController.create);

// 3. PUT - Update User berdasarkan ID (Update)
router.put('/:id', [verifyToken, fetchPermissions, hasPermission(permission)], userController.update);

// 4. DELETE - Hapus User berdasarkan ID (Delete)
router.delete('/:id', [verifyToken, fetchPermissions, hasPermission(permission)], userController.delete);


module.exports = router;