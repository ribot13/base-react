// src/layouts/MainLayout.jsx
import React from 'react';
import Sidebar from '../components/Sidebar.jsx'; 
import Header from '../components/Header.jsx';
import '../styles/main.css';

const MainLayout = ({ children }) => {
    return (
        <div className="app-wrapper">
            {/* Sidebar selalu tampil */}
            <Sidebar /> 

            <div className="main-content-area">
                {/* Header selalu tampil */}
                <Header /> 
                
                {/* Konten spesifik halaman (Dashboard, Member, Pinjaman) */}
                <main className="content-wrapper">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;