// backend/routes/catalog.routes.js
const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalog.controller');
// const authMiddleware = require('../middleware/auth'); // Asumsikan middleware otentikasi

// Endpoint: /api/catalogs
router.route('/')
    // GET /api/catalogs - Ambil semua katalog
    .get(catalogController.findAll) 
    // POST /api/catalogs - Buat katalog baru
    .post(catalogController.create); 

// Endpoint: /api/catalogs/:id
router.route('/:id')
    // GET /api/catalogs/:id - Ambil detail satu katalog
    .get(catalogController.findOne)
    // PUT /api/catalogs/:id - Update katalog
    .put(catalogController.update)
    // DELETE /api/catalogs/:id - Hapus katalog
    .delete(catalogController.delete); 

module.exports = router;