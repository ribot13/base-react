// src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import PageHeader from '../components/PageHeader.jsx';
// Pastikan semua impor CSS ada dan PATH sudah BENAR
import '../styles/global.css'; 
import '../styles/theme.css'; 
import '../styles/layout.css'; 

const MainLayout = ({ children }) => {
    // State untuk mengontrol sidebar di mobile/tablet
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="main-layout-container">
            {/* 1. HEADER (Fixed di atas) */}
            {/* Header menerima toggle function untuk tombol menu mobile */}
            <Header onSidebarToggle={toggleSidebar} />
            
            <div className="content-area-wrapper">
                {/* 2. SIDEBAR (Fixed di kiri, di bawah header) */}
                {/* Sidebar menerima state open untuk responsive CSS */}
                <Sidebar isOpen={isSidebarOpen} /> 
                
                {/* 3. MAIN CONTENT (Harus punya margin kiri di desktop) */}
                <main className="main-content">
                    <PageHeader />
                    {children}
                </main>
                
                {/* 4. OVERLAY (Hanya aktif di mobile saat sidebar terbuka) */}
                {/* Overlay harus berada di bawah sidebar (z-index 998) */}
                {isSidebarOpen && (
                    <div 
                        className="mobile-overlay" 
                        onClick={toggleSidebar} 
                    />
                )}
            </div>
        </div>
    );
};

export default MainLayout;