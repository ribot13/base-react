const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { verifyToken } = require('../middlewares/auth'); 
// Asumsikan Anda memiliki middleware checkPermission untuk admin routes
// const { checkPermission } = require('../middlewares/permission'); 


// 1. GET - Endpoint untuk Sidebar (DIAMBIL SETELAH LOGIN)
router.get('/sidebar', verifyToken, menuController.getSidebarMenu); 


// 2. CRUD - Endpoint untuk Halaman Admin Menu
// Asumsikan rute admin memerlukan izin 'manage-menu'
// Anda bisa menambahkan middleware checkPermission di sini.

router.get('/', verifyToken, /* checkPermission('manage-menu'), */ menuController.findAll);
router.post('/', verifyToken, /* checkPermission('manage-menu'), */ menuController.create);
router.put('/:id', verifyToken, /* checkPermission('manage-menu'), */ menuController.update);
router.delete('/:id', verifyToken, /* checkPermission('manage-menu'), */ menuController.delete);


module.exports = router;