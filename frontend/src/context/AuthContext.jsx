/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Definisikan state awal dari localStorage
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem('token') // Cek apakah token ada
    );
    const [token, setToken] = useState(
        localStorage.getItem('token')
    );
    const [permissions, setPermissions] = useState(
        JSON.parse(localStorage.getItem('permissions')) || [] // Ambil atau default ke array kosong
    );
    // Tambahkan state user data jika Anda menyimpannya juga
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user')) || null
    );

    // 2. Fungsi Login: Menyimpan data ke State DAN localStorage
    const login = (userData, userPermissions, authToken) => {
        // Simpan ke State
        setToken(authToken);
        setPermissions(userPermissions);
        setUser(userData);
        setIsLoggedIn(true);

        // Simpan ke LocalStorage (Persistensi)
        localStorage.setItem('token', authToken);
        localStorage.setItem('permissions', JSON.stringify(userPermissions));
        localStorage.setItem('user', JSON.stringify(userData));

        // 🎯 TOAST NOTIFIKASI LOGIN BERHASIL
        const name = userData?.full_name || "Pengguna";
        toast.success(`Selamat datang, ${name}! Anda berhasil login.`, {
            toastId: 'login-success' // Mencegah duplikasi toast
        });

    };

    // 3. Fungsi Logout: Menghapus data dari State DAN localStorage
    const logout = () => {
        setToken(null);
        setPermissions([]);
        setUser(null);
        setIsLoggedIn(false);

        // Hapus dari LocalStorage
        localStorage.removeItem('token');
        localStorage.removeItem('permissions');
        localStorage.removeItem('user');
        // 🎯 TOAST NOTIFIKASI LOGOUT
        toast.info("Anda telah berhasil logout.", {
            toastId: 'logout-success'
        });
    };

    // 4. (Opsional) Efek untuk memuat ulang data saat window diinisialisasi
    // Tidak perlu useEffect di sini karena state sudah diinisialisasi dari localStorage di awal.

    return (
        <AuthContext.Provider value={{ 
            isLoggedIn, 
            token, 
            permissions, 
            user, 
            login, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);