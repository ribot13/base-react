// backend/routes/stock.management.routes.js
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.management.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth'); // Sesuaikan path

// Middleware yang akan digunakan (verifyToken cukup, tapi verifyAdmin lebih aman untuk edit)
const authMiddleware = [verifyToken];

// 1. GET: List Produk/Varian untuk Manajemen Stok
router.get('/', authMiddleware, stockController.getInventoryList);

// 2. POST: Endpoint untuk Adjust Stok Inline
router.post('/adjust', authMiddleware, stockController.adjustInlineStock);

module.exports = router;