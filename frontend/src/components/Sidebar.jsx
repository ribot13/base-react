/* eslint-disable react-hooks/set-state-in-effect */
// frontend/src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { usePermission } from "../hooks/usePermission.js"; 
import * as FeatherIcons from "react-icons/fi";
import "../styles/components/sidebar.css";

// --- KOMPONEN ITEM MENU (Rekursif) ---
const MenuItemRender = ({ item, openItemId, setOpenItemId }) => {
  const { can } = usePermission(); 
  const location = useLocation();

  // 1. Sembunyikan jika show_in_menu = 0
  if (item.show_in_menu === 0 || item.show_in_menu === false) return null;

  // 2. Sembunyikan jika tidak punya permission
  if (item.required_permission && !can(item.required_permission)) return null; 

  const hasChildren = item.Children && item.Children.length > 0;
  
  // LOGIC ACTIVE STATE
  // Active Direct: Halaman ini yang sedang dibuka (Warna Terang/Solid)
  const isActiveDirect = location.pathname === item.path;
  
  // Parent Active: Salah satu anaknya sedang dibuka (Hanya bold/warna teks beda, jangan blok warna)
  const isParentActive = hasChildren && item.Children.some((child) => location.pathname.startsWith(child.path));

  // Render Icon Aman
  const IconComponent = item.icon_name && FeatherIcons[item.icon_name]
    ? FeatherIcons[item.icon_name]
    : FeatherIcons.FiCircle;

  // --- RENDER PARENT (DROPDOWN) ---
  if (hasChildren) {
    // Cek apakah item ini sedang dibuka statenya
    const isOpen = openItemId === item.id;

    const handleToggle = (e) => {
      e.preventDefault();
      // Logic Toggle: Kalau sudah buka -> tutup (null), kalau belum -> buka (id)
      setOpenItemId(isOpen ? null : item.id);
    };

    return (
      <li className={`menu-item-wrapper ${isParentActive ? "parent-active" : ""} ${isOpen ? "open" : ""}`}>
        <a href="#" className="menu-item-link parent-link" onClick={handleToggle}>
          <div className="d-flex align-items-center">
            <span className="menu-icon"><IconComponent size={18} /></span>
            <span className="menu-title">{item.title}</span>
          </div>
          <span className="menu-arrow">
            {isOpen ? <FeatherIcons.FiChevronDown /> : <FeatherIcons.FiChevronRight />}
          </span>
        </a>
        
        {/* SUBMENU LIST */}
        <ul className={`submenu ${isOpen ? "show" : ""}`}>
          {item.Children.map((child) => (
            <MenuItemRender
              key={child.id}
              item={child}
              openItemId={openItemId}
              setOpenItemId={setOpenItemId}
            />
          ))}
        </ul>
      </li>
    );
  }

  // --- RENDER SINGLE LINK (CHILD) ---
  return (
    <li className={`menu-item-wrapper ${isActiveDirect ? "active" : ""}`}>
      <Link to={item.path || "#"} className="menu-item-link">
        <span className="menu-icon"><IconComponent size={18} /></span>
        <span className="menu-title">{item.title}</span>
      </Link>
    </li>
  );
};

// --- MAIN SIDEBAR ---
const Sidebar = ({ isOpen }) => {
  const { sidebarMenu } = useAuth();
  const location = useLocation();
  const [openItemId, setOpenItemId] = useState(null);
  const isDashboardActive = location.pathname === "/dashboard";

  // AUTO OPEN PARENT
  // Efek ini berjalan saat URL berubah, mencari menu mana yang harus dibuka otomatis
  useEffect(() => {
    if (sidebarMenu && Array.isArray(sidebarMenu)) {
      // Cari item parent yang punya anak dengan path yang sama dengan URL saat ini
      const activeParent = sidebarMenu.find(item => 
        item.Children && item.Children.some(child => location.pathname.startsWith(child.path))
      );
      if (activeParent) {
        setOpenItemId(activeParent.id);
      }
    }
  }, [location.pathname, sidebarMenu]);

  const safeMenu = Array.isArray(sidebarMenu) ? sidebarMenu : [];

  return (
    <aside className={`sidebar ${isOpen ? "is-open" : ""}`}>
      <div className="sidebar-content">
        <nav>
          <ul className="main-menu">
            {/* Dashboard Static */}
            <li className={`menu-item-wrapper ${isDashboardActive ? "active" : ""}`}>
              <Link to="/dashboard" className="menu-item-link" onClick={() => setOpenItemId(null)}>
                <span className="menu-icon"><FeatherIcons.FiHome size={18} /></span>
                <span className="menu-title">Dashboard</span>
              </Link>
            </li>

            {/* Dynamic Menu */}
            {safeMenu.map((item) => (
              <MenuItemRender
                key={item.id}
                item={item}
                openItemId={openItemId}
                setOpenItemId={setOpenItemId}
              />
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;