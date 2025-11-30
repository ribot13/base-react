// backend/middlewares/auth.js
const jwt = require('jsonwebtoken');

// Middleware 1: Cek Token (Apakah user sudah login?)
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: "Akses ditolak. Token tidak tersedia." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Simpan data user (id, role) ke request
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token tidak valid atau kadaluarsa." });
    }
};

// Middleware 2: Cek Admin (Apakah user punya hak akses admin?)
exports.verifyAdmin = (req, res, next) => {
    // Pastikan req.user ada (dari verifyToken)
    if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Akses ditolak. Role tidak dikenali." });
    }

    // 👇 PERBAIKAN UTAMA: Gunakan toLowerCase() agar tidak sensitif huruf besar/kecil
    const role = req.user.role.toLowerCase();

    // Izinkan jika role adalah admin atau superadmin
    if (role === 'admin' || role === 'superadmin') {
        next();
    } else {
        return res.status(403).json({ message: `Akses ditolak. Anda bukan Admin.` });
    }
};