import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; 
// Asumsi Anda sudah membuat dan mengimpor hook ini
import { useAccessControl } from '../hooks/useAccessControl.js'; 
import * as FeatherIcons from 'react-icons/fi';
// Import styling sidebar
import '../styles/sidebar.css'; 


// ----------------------------------------------------
// KOMPONEN REKURSIF UNTUK ITEM MENU
// ----------------------------------------------------
const MenuItemRender = ({ item, openItemId, setOpenItemId }) => {
    const { canAccess } = useAccessControl();
    const location = useLocation();
    
    const hasChildren = item.Children && item.Children.length > 0;
    
    // Tentukan apakah salah satu anak aktif (agar menu terbuka saat navigasi)
    const isParentActive = hasChildren && item.Children.some(
        (child) => location.pathname.startsWith(child.path)
    );

    // State Buka/Tutup ditentukan oleh state terpusat di Parent
    const isOpen = openItemId === item.id || isParentActive; 
    
    // Cek Izin: (Logic filtering yang sudah Anda perbaiki)
    if (item.required_permission && !canAccess(item.required_permission)) {
        return null;
    }

    // Ambil Ikon
    const IconComponent = FeatherIcons[item.icon_name] || FeatherIcons.FiCircle;
    
    // Tentukan apakah item saat ini yang aktif
    const isCurrentPath = item.path && location.pathname.startsWith(item.path);

    // Handler untuk toggle
    const handleToggle = (e) => {
        e.preventDefault();
        // Jika sedang terbuka, tutup (set null). Jika tertutup, buka (set item.id).
        setOpenItemId(isOpen ? null : item.id);
    };

    // KASUS 1: ITEM ADALAH PARENT/FOLDER
    if (hasChildren && !item.path) {
        
        return (
            <li className={`menu-parent-item ${isOpen ? 'open' : ''} ${isParentActive ? 'active' : ''}`}>
                
                {/* Gunakan tag 'a' dengan onClick untuk toggle */}
                <a onClick={handleToggle} className="menu-parent-toggle" href="#">
                    <span className="menu-icon"><IconComponent size={20} /></span>
                    <span className="menu-title">{item.title}</span>
                    <FeatherIcons.FiChevronDown 
                        className={`submenu-toggle-icon ${isOpen ? 'rotated' : ''}`}
                    />
                </a>
                
                {/* Submenu UL */}
                {isOpen && (
                    <ul className="submenu-list">
                        {item.Children.map((child) => (
                            // Rekursi untuk anak, meneruskan state dan handler
                            <MenuItemRender 
                                key={child.id} 
                                item={child} 
                                openItemId={openItemId} 
                                setOpenItemId={setOpenItemId} 
                            />
                        ))}
                    </ul>
                )}
            </li>
        );
    }
    
    // KASUS 2: ITEM ADALAH LINK
    if (item.path) {
        return (
            <li className={isCurrentPath ? 'active' : ''}>
                <Link to={item.path}>
                    <span className="menu-icon"><IconComponent size={20} /></span> 
                    <span className="menu-title">{item.title}</span>
                </Link>
            </li>
        );
    }
    
    return null;
};


// ----------------------------------------------------
// KOMPONEN UTAMA SIDEBAR
// ----------------------------------------------------
const Sidebar = () => {
    const { sidebarMenu } = useAuth();
    const location = useLocation();

    // 🎯 State terpusat untuk mengontrol submenu yang terbuka
    const [openItemId, setOpenItemId] = useState(null); 

    const isDashboardActive = location.pathname === '/dashboard';

    return (
        <aside className="sidebar">
            <nav>
                <ul className="main-menu">
                    
                    {/* ITEM DASHBOARD */}
                    <li className={isDashboardActive ? 'active' : ''}>
                        <Link to="/dashboard" onClick={() => setOpenItemId(null)}>
                            <span className="menu-icon"><FeatherIcons.FiHome size={20} /></span> 
                            <span className="menu-title">Dashboard</span>
                        </Link>
                    </li>
                    
                    {/* RENDER SISA MENU DINAMIS */}
                    {sidebarMenu.map((item) => (
                        <MenuItemRender 
                            key={item.id} 
                            item={item} 
                            openItemId={openItemId} 
                            setOpenItemId={setOpenItemId} 
                        />
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;