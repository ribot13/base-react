// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');

// 1. Storage Configuration: Tentukan tempat penyimpanan dan nama file
const storage = multer.diskStorage({
  // Tentukan folder tujuan penyimpanan
  destination: (req, file, cb) => {
    // Path.join memastikan path benar di OS manapun
    cb(null, path.join(__dirname, '..', 'public', 'images')); 
  },
  
  // Tentukan nama file yang akan disimpan
  filename: (req, file, cb) => {
    // Contoh format nama file: product-1678880000000.jpg
    const ext = path.extname(file.originalname); // Ambil ekstensi asli (.jpg, .png)
    const timestamp = Date.now();
    const uniqueFileName = 'product-' + timestamp + ext;
    cb(null, uniqueFileName);
  }
});

// 2. Filter File: Hanya izinkan JPEG dan PNG
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true); // Izinkan
  } else {
    cb(new Error('Format file harus JPG atau PNG'), false); // Tolak
  }
};

// 3. Konfigurasi Utama Multer
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 1024 * 1024 * 5 // Batas maksimal 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;