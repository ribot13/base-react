// routes/pinjaman.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth'); // Middleware lama
const { fetchPermissions, hasPermission } = require('../middlewares/permission.middleware');

// Endpoint untuk membuat pinjaman baru (hanya boleh jika punya izin 'create-pinjaman')
router.post('/',
    verifyToken,
    fetchPermissions,
    hasPermission('create-pinjaman'), 
    (req, res) => {
        // ... logika controller
    }
);

// Endpoint untuk menyetujui pinjaman (hanya boleh jika punya izin 'approve-pinjaman')
router.put('/:id/approve',
    verifyToken,
    fetchPermissions,
    hasPermission('approve-pinjaman'), 
    (req, res) => {
        // ... logika controller
    }
);

module.exports = router;