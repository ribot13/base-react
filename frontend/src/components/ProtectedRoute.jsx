// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useMenuLogic } from '../hooks/useMenuLogic';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { isLoggedIn } = useAuth();
    const { hasAccess } = useMenuLogic();

    // 1. Cek Login Dasar
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // 2. Cek Permission Spesifik per Halaman (dari Database)
    if (!hasAccess) {
        // Jika user memaksa masuk URL (misal /admin/users) tapi tidak punya hak akses
        // Redirect ke Dashboard atau halaman Unauthorized custom
        return <Navigate to="/dashboard" replace />; 
    }

    // Jika aman, render halaman yang diminta
    return <Outlet />;
};

export default ProtectedRoute;