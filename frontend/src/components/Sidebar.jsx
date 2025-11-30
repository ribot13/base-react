// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccessControl } from '../hooks/useAccessControl.js'; // Sesuaikan path

import { 
    FiHome, // Ikon Home untuk Dashboard
    FiUsers, // Ikon Users untuk Anggota
    FiDollarSign, // Ikon Uang untuk Simpanan
    FiCreditCard, // Ikon Kartu untuk Pinjaman
    FiSettings // Ikon Settings untuk Administrasi
} from 'react-icons/fi';

// Definisikan Struktur Menu dengan Izin yang Dibutuhkan
const sidebarMenu = [
    { 
        title: "Dashboard", 
        path: "/dashboard", 
        requiredPermission: null, // Tidak perlu izin khusus
        icon: <FiHome size={20} />
    },
    { 
        title: "Anggota Koperasi", 
        path: "/members", 
        requiredPermission: "read-member",
        icon: <FiUsers size={20} />
    },
    { 
        title: "Simpanan", 
        path: "/simpanan", 
        requiredPermission: "read-simpanan",
        icon: <FiDollarSign size={20} />
    },
    { 
        title: "Pinjaman", 
        path: "/pinjaman", 
        requiredPermission: "read-pinjaman",
        icon: <FiCreditCard size={20} />
    },
    { 
        title: "Administrasi Sistem", 
        path: "/admin", 
        requiredPermission: "manage-roles", // Izin untuk manajemen Role & User
        icon: <FiSettings size={20} />
    },
];


const Sidebar = () => {
    const { canAccess } = useAccessControl();
    const location = useLocation();

    // Filter Menu Berdasarkan Izin Efektif Pengguna
    const filteredMenu = sidebarMenu.filter(item => {
        // Hanya tampilkan item jika user memiliki izin yang diperlukan
        return canAccess(item.requiredPermission);
    });

    return (
        <aside className="sidebar">
            <nav>
                <ul>
                    {filteredMenu.map((item) => (
                        <li 
                            key={item.path} 
                            // Tambahkan class 'active' jika path saat ini cocok dengan path menu
                            className={location.pathname === item.path ? 'active' : ''}
                        >
                            <Link to={item.path}>
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-title">{item.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;