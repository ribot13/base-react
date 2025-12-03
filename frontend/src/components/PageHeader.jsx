// src/components/PageHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import { useMenuLogic } from '../hooks/useMenuLogic';
import '../styles/components/page-header.css'; 

const PageHeader = () => {
    const { pageTitle, breadcrumbs } = useMenuLogic();

    return (
        <div className="page-header-container">
            {/* Judul Halaman */}
            <h1 className="page-title">{pageTitle}</h1>
            
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    
                    {/* 1. ITEM DASHBOARD (Selalu Pertama) */}
                    <li className="breadcrumb-item">
                        <Link to="/dashboard">
                            <FiHome size={14} style={{ marginRight: '5px', marginBottom: '2px' }} />
                            Dashboard
                        </Link>
                        {/* Selalu tampilkan separator jika ada breadcrumb lanjutan */}
                        {breadcrumbs.length > 0 && (
                            <FiChevronRight className="breadcrumb-separator" size={14} />
                        )}
                    </li>

                    {/* 2. ITEM DINAMIS (Looping dari Database) */}
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        // Cek apakah ini folder (tanpa path) atau dynamic route (:id)
                        const isTextOnly = !crumb.path || (crumb.path && crumb.path.includes(':'));

                        return (
                            <li key={crumb.id || index} className={`breadcrumb-item ${isLast ? 'active' : ''}`}>
                                
                                {/* A. RENDER KONTEN (Link atau Teks) */}
                                {isLast || isTextOnly ? (
                                    // Render sebagai Teks (Jika item terakhir ATAU tidak punya link)
                                    <span className={isLast ? "current-page" : ""}>
                                        {crumb.title}
                                    </span>
                                ) : (
                                    // Render sebagai Link
                                    <Link to={crumb.path}>
                                        {crumb.title}
                                    </Link>
                                )}

                                {/* B. RENDER SEPARATOR (Panah >) */}
                                {/* Munculkan panah HANYA jika ini BUKAN item terakhir */}
                                {!isLast && (
                                    <FiChevronRight className="breadcrumb-separator" size={14} />
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
};

export default PageHeader;