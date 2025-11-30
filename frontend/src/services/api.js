// frontend/src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Base URL Backend Anda
  timeout: 10000, // Timeout setelah 10 detik
  headers: {
    'Content-Type': 'application/json',
  },
});

// 👇 INTERCEPTOR REQUEST: Menambahkan Token ke Header
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem('authToken');
    
    // Jika token ada, lampirkan ke header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 👇 INTERCEPTOR RESPONSE: Menangani 401/403 (Token Expired/Invalid)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Cek jika status kode 401 atau 403 (Unauthorized/Forbidden)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Hapus token yang sudah kadaluarsa
            localStorage.removeItem('authToken');
            toast.error('Sesi Anda berakhir. Silakan login kembali.');
            
            // Redirect manual ke halaman login
            // Note: Karena kita tidak punya akses ke 'navigate' hook di sini, 
            // kita lakukan redirect sederhana (terkadang browser perlu refresh total)
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;