/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify'; 
import { APP_CONFIG } from '../config/appConfig';

const AuthContext = createContext();
const API_BASE_URL = APP_CONFIG.API_BASE_URL;

export const AuthProvider = ({ children }) => {
    // --- HELPER: SAFE PARSE JSON ---
    // Mencegah error crash jika localStorage berisi "undefined" atau data rusak
    const safeParse = (key, fallback) => {
        try {
            const item = localStorage.getItem(key);
            // Cek null, undefined, atau string "undefined"
            if (!item || item === "undefined" || item === "null") {
                return fallback;
            }
            return JSON.parse(item);
        } catch (error) {
            console.warn(`Error parsing key "${key}" from localStorage:`, error);
            // Hapus data rusak agar tidak error lagi
            localStorage.removeItem(key);
            return fallback;
        }
    };

    // 1. State Initialization
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [token, setToken] = useState(localStorage.getItem('token'));
    
    // Gunakan safeParse untuk semua JSON
    const [permissions, setPermissions] = useState(
        safeParse('permissions', [])
    );
    
    const [user, setUser] = useState(
        safeParse('user', null)
    );
    
    const [sidebarMenu, setSidebarMenu] = useState(
        safeParse('sidebarMenu', []) 
    );

    const [menuVersion, setMenuVersion] = useState(
        localStorage.getItem('menuVersion') || null 
    );

    // 2. Fungsi Fetch Menu (Sidebar)
    const fetchAndSetMenu = async (authToken, currentVersion) => {
        try {
            const url = currentVersion 
                ? `${API_BASE_URL}/menu/structure?v=${currentVersion}`
                : `${API_BASE_URL}/menu/structure`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.status === 304) {
                //console.log("Menu up-to-date (Cached)");
                return; 
            }

            if (response.ok) {
                const data = await response.json();
                
                // --- BAGIAN ANTI BLANK ---
                // Cek apakah data adalah Array langsung, atau Object { menu: [] }
                let finalMenu = [];
                
                if (Array.isArray(data)) {
                    finalMenu = data; // Backend kirim array langsung
                } else if (data && Array.isArray(data.menu)) {
                    finalMenu = data.menu; // Backend kirim object { menu: ... }
                } else {
                    console.warn("Format menu dari API tidak dikenali:", data);
                    finalMenu = []; // Fallback agar tidak crash
                }

                //console.log("Menu berhasil dimuat:", finalMenu); // Debugging

                setSidebarMenu(finalMenu); 
                localStorage.setItem('sidebarMenu', JSON.stringify(finalMenu));
                
                if (data.version) {
                    setMenuVersion(data.version);
                    localStorage.setItem('menuVersion', data.version);
                }
            }
        } catch (error) {
            console.error("Gagal memuat menu:", error);
            // Jangan throw error, biarkan aplikasi jalan dengan menu kosong
            setSidebarMenu([]); 
        }
    };

    // 3. Fungsi Login
    const login = (userData, authToken, userPermissions = []) => {
        // A. Update State
        setToken(authToken);
        setUser(userData);
        setPermissions(userPermissions); 
        setIsLoggedIn(true);

        // B. Simpan ke LocalStorage (Pastikan stringify aman)
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData || null));
        localStorage.setItem('permissions', JSON.stringify(userPermissions || [])); 

        // C. Fetch Menu Sidebar
        const currentVer = userData?.menuVersion || menuVersion || 'v1.0.0';
        fetchAndSetMenu(authToken, currentVer);

        const name = userData?.full_name || "Pengguna";
        toast.success(`Selamat datang, ${name}!`); 
    };

    // 4. Fungsi Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('permissions'); 
        localStorage.removeItem('user');
        localStorage.removeItem('sidebarMenu');
        localStorage.removeItem('menuVersion');
        
        setToken(null);
        setPermissions([]); 
        setUser(null);
        setSidebarMenu([]);
        setMenuVersion(null);
        setIsLoggedIn(false);
        
        toast.info("Anda telah berhasil logout.");
    };

    return (
        <AuthContext.Provider value={{ 
            isLoggedIn, 
            token, 
            permissions, 
            user, 
            sidebarMenu, 
            login, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);