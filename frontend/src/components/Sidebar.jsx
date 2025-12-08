import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
// Pastikan Anda sudah membuat dan mengimpor hook ini
import { useAccessControl } from "../hooks/useAccessControl.js";
import * as FeatherIcons from "react-icons/fi";
// Import styling sidebar
import "../styles/components/sidebar.css";

// ----------------------------------------------------
// KOMPONEN REKURSIF UNTUK ITEM MENU
// ----------------------------------------------------
const MenuItemRender = ({ item, openItemId, setOpenItemId }) => {
  const { canAccess } = useAccessControl();
  const location = useLocation();
  // [LOGIKA BARU] - Sembunyikan item jika show_in_menu = 0 (false)
  if (item.show_in_menu === 0 || item.show_in_menu === false) {
    return null;
  }

  // Cek Izin: Jika izin dibutuhkan dan user tidak memiliki, jangan render
  if (item.required_permission && !canAccess(item.required_permission)) {
    return null;
  }

  const hasChildren = item.Children && item.Children.length > 0;

  // Tentukan apakah salah satu anak aktif (agar menu terbuka saat navigasi)
  const isParentActive =
    hasChildren &&
    item.Children.some((child) => location.pathname.startsWith(child.path));

  // State Buka/Tutup ditentukan oleh state terpusat di Parent
  const isOpen = openItemId === item.id || isParentActive;

  // Tentukan apakah item saat ini yang aktif
  const isExactMatch = item.path === location.pathname;

  // Cek apakah user berada di sub-halaman (edit/create/detail) milik item ini
  // Pastikan item.path ada isinya untuk menghindari error pada item parent
  const isSubPage = item.path && (
    location.pathname.startsWith(`${item.path}/create`) ||
    location.pathname.startsWith(`${item.path}/add`) ||
    location.pathname.startsWith(`${item.path}/edit`) ||
    location.pathname.startsWith(`${item.path}/detail`)
  );

  // Gabungkan logika: Aktif jika path SAMA PERSIS atau berada di SUB-HALAMAN yang diizinkan
  const isCurrentPath = isExactMatch || isSubPage;

  // Ambil Ikon (default ke FiCircle jika icon_name tidak valid/tidak ada)
  const IconComponent = FeatherIcons[item.icon_name] || FeatherIcons.FiCircle;

  // Handler untuk toggle submenu
  const handleToggle = () => {
    // Jika menu sedang terbuka ATAU sudah aktif (sebagai parent), tutup (null). Jika tidak, buka (item.id).
    setOpenItemId(isOpen && !isParentActive ? null : item.id);
  };

  // Tentukan class untuk wrapper (li)
  const wrapperClass = `menu-item-wrapper ${isCurrentPath ? "active" : ""}`;

  // Tentukan ikon toggler (FiChevronDown/FiChevronRight)
  const TogglerIcon = isOpen
    ? FeatherIcons.FiChevronDown
    : FeatherIcons.FiChevronRight;

  // 1. Item yang memiliki Children (Parent Menu)
  if (hasChildren) {
    return (
      <li className={wrapperClass}>
        {/* Menggunakan tombol karena ini adalah aksi toggle, bukan navigasi */}
        <button onClick={handleToggle} className="menu-item-link">
          <span className="menu-icon">
            <IconComponent size={20} />
          </span>
          <span className="menu-title">{item.title}</span>
          {/* Toggler hanya muncul jika ada children */}
          <span className={`menu-toggler ${isOpen ? "rotated" : ""}`}>
            <TogglerIcon size={16} />
          </span>
        </button>

        {/* Submenu List */}
        <ul
          className="submenu"
          style={{
            maxHeight: isOpen ? "500px" : "0",
          }}
        >
          {item.Children.map((child) => (
            // REKURSIF: Render children
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

  // 2. Item Tunggal (Leaf Node)
  return (
    <li className={wrapperClass}>
      <Link
        to={item.path}
        className="menu-item-link" // Gunakan class yang sama agar style konsisten
        onClick={() => setOpenItemId(null)}
      >
        <span className="menu-icon">
          <IconComponent size={20} />
        </span>
        <span className="menu-title">{item.title}</span>
      </Link>
    </li>
  );
};

// ----------------------------------------------------
// KOMPONEN UTAMA SIDEBAR
// ----------------------------------------------------
// 🎯 KRITIS: SIDEBAR HARUS MENERIMA PROP 'isOpen'
const Sidebar = ({ isOpen }) => {
  const { sidebarMenu } = useAuth();
  const location = useLocation();

  // State terpusat untuk mengontrol submenu yang terbuka
  const [openItemId, setOpenItemId] = useState(null);

  const isDashboardActive = location.pathname === "/dashboard";

  return (
    <aside className={`sidebar ${isOpen ? "is-open" : ""}`}>
      <nav>
        <ul className="main-menu">
          {/* ITEM DASHBOARD (HARDCODED) */}
          <li
            className={
              isDashboardActive
                ? "menu-item-wrapper active"
                : "menu-item-wrapper"
            }
          >
            <Link
              to="/dashboard"
              className="menu-item-link"
              onClick={() => setOpenItemId(null)}
            >
              <span className="menu-icon">
                <FeatherIcons.FiHome size={20} />
              </span>
              <span className="menu-title">Dashboard</span>
            </Link>
          </li>

          {/* RENDER SISA MENU DINAMIS */}
          {sidebarMenu.map((item) => (
            // Panggil komponen rekursif untuk menu level 1
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
