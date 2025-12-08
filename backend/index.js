// index.js
const path = require('path');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const setupRoutes = require('./routes');

const app = express();
const port = process.env.PORT || 5001;

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- 1. Konfigurasi Sequelize ---
const db = require('./models');

// Gunakan sync() hanya untuk pengembangan. Di produksi, gunakan migrasi.
db.sequelize.sync() 
    .then(() => {
        console.log("Database terkoneksi. Model disinkronkan.");
    })
    .catch((err) => {
        console.error("Gagal terkoneksi ke database:", err.message);
    });

// --- 2. Middleware Dasar Express ---
app.use(cors()); // Izinkan permintaan lintas domain (penting untuk ReactJS)
app.use(bodyParser.json()); // Parsing JSON dari body request
app.use(bodyParser.urlencoded({ extended: true }));

// --- 3. Pemuatan Routes ---
// Import routes auth Anda
setupRoutes(app);


// --- 4. Server Listener ---
app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});