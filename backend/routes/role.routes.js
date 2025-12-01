// routes/role.routes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { verifyToken } = require('../middlewares/auth'); 
const { fetchPermissions, hasPermission } = require('../middlewares/permission.middleware'); 

// Permission yang dibutuhkan untuk melihat/mengelola Role.
// UserAdminPage membutuhkan daftar roles, jadi kita proteksi dengan permission ini.
const permission = 'manage-roles'; 

// [GET] /api/roles - Mengambil daftar semua role
router.get('/', [verifyToken, fetchPermissions, hasPermission(permission)], roleController.findAll);

// Tambahkan rute CRUD lainnya di masa mendatang:
// router.post('/', [verifyToken, fetchPermissions, hasPermission(permission)], roleController.create);
// router.put('/:id', [verifyToken, fetchPermissions, hasPermission(permission)], roleController.update);
// router.delete('/:id', [verifyToken, fetchPermissions, hasPermission(permission)], roleController.delete);

module.exports = router;