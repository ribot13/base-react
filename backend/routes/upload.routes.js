const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { verifyToken } = require('../middlewares/auth');
const fs = require('fs');
const path = require('path');

// 1. Upload File
router.post('/', verifyToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }
    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.status(200).json({ message: 'Upload berhasil', url: imageUrl });
});

// 2. Hapus File (BARU)
router.delete('/', verifyToken, (req, res) => {
    const { imageUrl } = req.body; // Menerima path gambar, misal: /uploads/products/abc.jpg

    if (!imageUrl) {
        return res.status(400).json({ message: 'Path gambar wajib disertakan' });
    }

    // Konversi URL relatif menjadi Path Absolut di server
    // Kita asumsikan imageUrl dimulai dengan /uploads/products/
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, '../public/uploads/products', filename);

    // Cek apakah file ada, lalu hapus
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Gagal menghapus file:", err);
                return res.status(500).json({ message: 'Gagal menghapus file fisik' });
            }
            res.status(200).json({ message: 'File berhasil dihapus' });
        });
    } else {
        // Jika file tidak ditemukan, kita anggap sukses saja (mungkin sudah terhapus)
        res.status(200).json({ message: 'File tidak ditemukan, namun dianggap terhapus' });
    }
});

module.exports = router;