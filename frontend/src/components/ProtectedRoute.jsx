// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { isLoggedIn } = useAuth();
    const location = useLocation();

    // 1. Cek Login Dasar (Wajib)
    if (!isLoggedIn) {
        // Redirect ke login, tapi simpan lokasi asal agar bisa balik lagi nanti
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. HAPUS LOGIKA "hasAccess" YANG BIKIN BLANK
    // Biarkan user masuk dulu. Jika nanti dia klik menu yang dilarang,
    // Sidebar yang akan menyembunyikannya, atau API yang akan menolak datanya.
    
    // Render Halaman
    return <Outlet />;
};

export default ProtectedRoute;