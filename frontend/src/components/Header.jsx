// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiUser,
  FiSettings,
  FiMenu,
  FiChevronDown,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

import Logo from "../assets/logo.svg";
import "../styles/components/header.css";

// eslint-disable-next-line no-unused-vars
const Header = ({ onSidebarToggle, isSidebarOpen }) => {
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="app-header">
      {/* Bagian Kiri: Tombol Sidebar & Logo */}
      <div className="header-left">
        <button
          className="sidebar-toggle-btn"
          onClick={onSidebarToggle} // 👈 Gunakan nama prop yang benar
          aria-label="Toggle Sidebar"
        >
          <FiMenu size={22} />
        </button>

        <Link to="/dashboard" className="brand-link">
          <img src={Logo} alt="App Logo" className="header-logo-img" />
          <span className="brand-name">
            MR<span style={{ color: "var(--secondary-color)" }}>W</span>
          </span>
        </Link>
      </div>

      {/* Bagian Kanan: Profil User */}
      <div className="header-right">
        <div className="user-profile-wrapper" ref={dropdownRef}>
          <div
            className="user-profile-trigger"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${
                user?.full_name || "User"
              }&background=0D8ABC&color=fff`}
              alt="Profile"
              className="user-avatar"
            />
            <div className="user-info-text">
              <span className="user-name">{user?.full_name || "Pengguna"}</span>
              <small className="user-role">
                {user?.activeRole?.name || "Role"}
              </small>
            </div>
            <FiChevronDown
              className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
            />
          </div>

          {isDropdownOpen && (
            <div className="user-dropdown-menu"> 
              <div className="dropdown-header">
                <strong>{user?.full_name}</strong>
                <span>@{user?.username}</span>
              </div>
              <ul>
                <li>
                  <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
                    <FiUser /> Profile Saya
                  </Link>
                </li>
                <li>
                  <Link to="/settings" onClick={() => setIsDropdownOpen(false)}>
                    <FiSettings /> Pengaturan
                  </Link>
                </li>
                <li className="divider"></li>
                <li>
                  <button onClick={handleLogout} className="logout-btn">
                    <FiLogOut style={{ color: 'var(--error-color)' }} /> Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
