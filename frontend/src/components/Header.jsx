// src/components/Header.jsx
import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
// 🎯 Import file konfigurasi yang sudah ada
import { APP_CONFIG } from "../config/appConfig.js";

import {
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiSettings,
  FiMenu,
} from "react-icons/fi";
import "../styles/components/header.css";
// Import logo.svg (pastikan path ini sesuai)
import logo from "../../public/logo.svg";

// 🎯 Pastikan Header menerima fungsi toggle dari MainLayout
const Header = ({ onSidebarToggle }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const closeTimerRef = useRef(null);

  // Asumsi data user
  const userName = user ? user.full_name : "Admin";
  // Ambil huruf pertama untuk Avatar
  const userInitials = userName.charAt(0).toUpperCase();

  // Handlers untuk mouse events (untuk Hover)
  const handleMouseEnter = () => {
    // Bersihkan timer penutupan yang mungkin sedang berjalan
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    // Buka Dropdown secara instan
    setIsDropdownOpen(true);
  };

  // 2. Handler untuk Mouse Leave (Tutup setelah delay 300ms)
  const handleMouseLeave = () => {
    // Bersihkan timer lama jika ada
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    // 🎯 KRITIS: Atur timer baru untuk menutup dropdown setelah 300ms
    closeTimerRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
      closeTimerRef.current = null;
    }, 300);
  };

  // 3. Handler Klik (selalu menutup dropdown instan)
  const handleLogout = () => {
    // Hapus timer jika ada
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsDropdownOpen(false);
    logout();
  };

  const handleEditProfile = () => {
    // Hapus timer jika ada
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  return (
    <header className="main-header">
      {/* KIRI: Tombol Toggle dan Logo/Nama Aplikasi */}
      <div className="header-left-area">
        {/* 🎯 Tombol Toggle Sidebar (Hanya terlihat di mobile/tablet) */}
        <button
          className="sidebar-toggle-button"
          onClick={onSidebarToggle}
          aria-label="Toggle Sidebar"
        >
          <FiMenu size={20} />
        </button>
        <div className="app-title-display">
          <Link to="/dashboard" className="app-logo-link">
            {/* Asumsi: logo diimpor sebagai 'logo' */}
            <img src={logo} alt="Logo" className="app-logo" />
          </Link>
          <span className="app-name">{APP_CONFIG.APP_TITLE}</span>
        </div>
      </div>

      {/* KANAN: Dropdown Profil User */}
      <div
        className="user-profile-dropdown-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Tombol Toggle Profil */}
        <button
          className="user-profile-toggle"
          // Tambahkan onClick agar dropdown tetap bisa diakses di perangkat sentuh
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {/* Avatar Initial */}
          <div className="user-avatar">{userInitials}</div>
          <span className="user-display-name">{user.username}</span>
          <FiChevronDown
            size={16}
            className={`dropdown-icon ${isDropdownOpen ? "rotated" : ""}`}
          />
        </button>

        {/* Menu Dropdown */}
        {isDropdownOpen && (
          <div className="dropdown-menu">
            {/* Info User (Opsional, bisa dihapus jika tidak perlu) */}
            <div className="dropdown-user-info">
              <p className="user-info-name">{userName}</p>
              <p className="user-info-email">
                {user?.email || "user@example.com"}
              </p>
            </div>
            <div className="dropdown-divider"></div>

            {/* 1. Link Edit Profil */}
            <button onClick={handleEditProfile} className="dropdown-item">
              <FiSettings size={16} style={{ marginRight: "10px" }} />
              Edit Profil
            </button>

            {/* 2. Link Logout */}
            <button onClick={handleLogout} className="dropdown-item logout">
              <FiLogOut size={16} style={{ marginRight: "10px" }} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
