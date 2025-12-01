/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify'; 

const AuthContext = createContext();
import { APP_CONFIG } from '../config/appConfig';
const API_BASE_URL = APP_CONFIG.API_BASE_URL;

export const AuthProvider = ({ children }) => {
    // State dasar (tidak berubah)
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [permissions, setPermissions] = useState(
        JSON.parse(localStorage.getItem('permissions')) || []
    );
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user')) || null
    );
    
    // 🎯 STATE BARU UNTUK MENU CACHING
    const [sidebarMenu, setSidebarMenu] = useState(
        JSON.parse(localStorage.getItem('sidebarMenu')) || [] // Data menu hierarki
    );
    const [menuVersion, setMenuVersion] = useState(
        localStorage.getItem('menuVersion') || null // Versi menu dari backend
    );


    // Fungsi baru untuk mengambil dan menyimpan menu dari backend
    const fetchAndSetMenu = async (authToken, newMenuVersion) => {
        try {
            const response = await fetch(`${API_BASE_URL}/menu/sidebar`, {
                headers: { 
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error("Gagal mengambil data menu.");
            }
            
            const menuData = await response.json(); 

            // Simpan menu baru
            setSidebarMenu(menuData);
            localStorage.setItem('sidebarMenu', JSON.stringify(menuData));
            
            // Perbarui versi
            setMenuVersion(newMenuVersion);
            localStorage.setItem('menuVersion', newMenuVersion);

        } catch (error) {
            console.error("Gagal mengambil data menu:", error);
            toast.error("Gagal memuat menu: " + error.message);
        }
    };


    // Fungsi Login yang dimodifikasi untuk Caching Logic
    const login = (userData, userPermissions, authToken, newMenuVersion) => {
        // Simpan data user dan token (Persistensi)
        localStorage.setItem('token', authToken);
        localStorage.setItem('permissions', JSON.stringify(userPermissions));
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('menuVersion', newMenuVersion); // Simpan versi baru

        // Simpan ke State
        setToken(authToken);
        setPermissions(userPermissions);
        setUser(userData);
        setMenuVersion(newMenuVersion); // Update state versi menu
        setIsLoggedIn(true);

        newMenuVersion=userData?.menuVersion || 'v1.0.0';
        fetchAndSetMenu(authToken,newMenuVersion);
        // Toast notifikasi
        const name = userData?.full_name || "Pengguna";
        toast.success(`Selamat datang, ${name}!`); 
    };

    // Fungsi Logout (tidak berubah)
    const logout = () => {
        // ... (Logika penghapusan data dari State dan localStorage) ...
        localStorage.removeItem('token');
        localStorage.removeItem('permissions');
        localStorage.removeItem('user');
        localStorage.removeItem('sidebarMenu'); // Hapus cache menu saat logout
        localStorage.removeItem('menuVersion');
        
        setToken(null);
        setPermissions([]);
        setUser(null);
        setSidebarMenu([]);
        setMenuVersion(null);
        setIsLoggedIn(false);
        
        toast.info("Anda telah berhasil logout.");
    };

    // ... (useEffect untuk memuat ulang data saat mounting, opsional) ...

    return (
        <AuthContext.Provider value={{ 
            isLoggedIn, 
            token, 
            permissions, 
            user, 
            sidebarMenu, // 👈 TAMBAHKAN INI
            login, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);