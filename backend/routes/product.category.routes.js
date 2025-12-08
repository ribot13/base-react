// backend/routes/productCategory.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.category.controller');
const { verifyToken } = require('../middlewares/auth');
// Asumsikan Anda ingin memproteksi ini
// const { hasPermission } = require('../middlewares/permission.middleware'); 

// Base Path nanti: /api/product-categories

router.get('/', verifyToken, controller.findAll);
router.get('/:id', verifyToken, controller.findOne);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.put('/order', verifyToken, controller.updateOrder);
router.delete('/:id', verifyToken, controller.delete);

module.exports = router;