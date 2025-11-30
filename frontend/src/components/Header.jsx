// src/components/Header.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import config from "../config.json";

import { FiChevronDown, FiUser } from 'react-icons/fi';
import '../styles/header.css';

const Header = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Asumsi kita punya state user data di AuthContext
  const userName = user ? user.full_name : "Admin";
  const userRole = user ? user.role : "";

  // Handlers untuk mouse events
    const handleMouseEnter = () => setIsDropdownOpen(true);
    const handleMouseLeave = () => setIsDropdownOpen(false);

    // Fungsi untuk Logout (sekaligus menutup dropdown)
    const handleLogout = () => {
        setIsDropdownOpen(false);
        logout(); 
    };

    // Fungsi untuk navigasi ke Edit Profil (sekaligus menutup dropdown)
    const handleEditProfile = () => {
        setIsDropdownOpen(false);
        navigate('/profile'); 
    };

  return (
    <header className="main-header">
            <div className="app-title-display">
                <span className="app-name">{config.appName}</span>
            </div>
            
            {/* 🎯 AREA DROPDOWN PROFIL - Diberi event Mouse Enter/Leave */}
            <div 
                className="user-profile-dropdown-container"
                onMouseEnter={handleMouseEnter} // 👈 Buka saat mouse masuk
                onMouseLeave={handleMouseLeave} // 👈 Tutup saat mouse keluar
            >
                <button 
                    className="user-profile-toggle"
                    // Tombol ini hanya sebagai tampilan, tidak perlu onClick untuk toggle
                >
                    <FiUser size={18} style={{ marginRight: '8px' }} />
                    <span className="user-display-name">Halo, {userName}</span>
                    {userRole && <span className="user-role-tag">({userRole.toUpperCase()})</span>} 
                    <FiChevronDown 
                        size={16} 
                        className={`dropdown-icon ${isDropdownOpen ? 'rotated' : ''}`}
                    />
                </button>

                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        {/* 1. Link Edit Profil */}
                        <button onClick={handleEditProfile} className="dropdown-item">
                            Edit Profil
                        </button>
                        
                        {/* 2. Link Logout */}
                        <button onClick={handleLogout} className="dropdown-item logout">
                            Logout
                        </button>
                    </div>
                )}
            </div>
            {/* AKHIR AREA DROPDOWN PROFIL */}
        </header>
  );
};

export default Header;
