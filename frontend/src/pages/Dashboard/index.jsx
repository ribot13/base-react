/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle.js';
import { FiUser, FiShield, FiDatabase, FiInfo } from 'react-icons/fi';

const DashboardPage = () => {
  // 1. Set Judul Halaman
  usePageTitle('Dashboard');

  // 2. State untuk menampung data localStorage
  const [storageData, setStorageData] = useState({
    user: null,
    permissions: [],
    token: null
  });

  // 3. Ambil data dari LocalStorage saat komponen di-mount
  useEffect(() => {
    try {
      // Ambil raw string dari localStorage
      const userStr = localStorage.getItem('user');
      const permStr = localStorage.getItem('permissions');
      const tokenStr = localStorage.getItem('token');

      // Parse JSON
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      const parsedPerms = permStr ? JSON.parse(permStr) : [];

      setStorageData({
        user: parsedUser,
        permissions: parsedPerms,
        token: tokenStr
      });
    } catch (error) {
      console.error("Gagal membaca LocalStorage:", error);
    }
  }, []);

  const { user, permissions } = storageData;

  return (
    <div className="dashboard-container">
      {/* --- Konten Dashboard Sebenarnya (Placeholder) --- */}
      <div className="card-panel" style={{ marginBottom: '20px' }}>
        <h3>Selamat Datang, {user?.full_name || 'User'}!</h3>
        <p>Ini adalah halaman Dashboard utama aplikasi.</p>
      </div>

      {/* --- AREA DEBUG: INFO LOCALSTORAGE --- */}
      <div className="card-panel" style={{ border: '1px dashed var(--primary-color)', backgroundColor: '#f8fbff' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)', marginTop: 0 }}>
          <FiDatabase /> Debug Info: LocalStorage Data
        </h4>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
            <FiInfo style={{ marginRight: '5px' }} />
            Informasi di bawah ini diambil langsung dari browser (Client Side Storage) untuk keperluan pengembangan.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* 1. INFORMASI USER */}
          <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <FiUser /> User Profile
            </h5>
            {user ? (
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '8px' }}><strong>ID:</strong> {user.id}</li>
                <li style={{ marginBottom: '8px' }}><strong>Nama:</strong> {user.full_name}</li>
                <li style={{ marginBottom: '8px' }}><strong>Username:</strong> {user.username}</li>
                <li style={{ marginBottom: '8px' }}><strong>Email:</strong> {user.email || '-'}</li>
                <li style={{ marginBottom: '8px' }}>
                    <strong>Active Role:</strong>{' '}
                    <span className="badge badge-neutral" style={{ backgroundColor: 'var(--primary-color)', color: '#fff' }}>
                        {user.role || 'No Role'} (Level : {user.role_level || '0'} )
                    </span>
                </li>
              </ul>
            ) : (
                <p style={{ color: 'red' }}>Data User tidak ditemukan di LocalStorage.</p>
            )}
          </div>

          {/* 2. INFORMASI PERMISSION */}
          <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <FiShield /> Permissions ({permissions.length})
            </h5>
            
            {permissions.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxHeight: '200px', overflowY: 'auto' }}>
                    {permissions.map((perm, index) => (
                        <span key={index} style={{ 
                            fontSize: '0.75rem', 
                            padding: '3px 8px', 
                            backgroundColor: '#e2e8f0', 
                            borderRadius: '4px',
                            fontFamily: 'monospace'
                        }}>
                            {perm}
                        </span>
                    ))}
                </div>
            ) : (
                <p style={{ color: '#999', fontStyle: 'italic' }}>Tidak ada permission khusus.</p>
            )}
          </div>

        </div>

        {/* 3. RAW JSON (Opsional - untuk melihat struktur asli) */}
        <details style={{ marginTop: '15px', cursor: 'pointer' }}>
            <summary style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lihat Raw JSON</summary>
            <pre style={{ 
                background: '#333', 
                color: '#0f0', 
                padding: '15px', 
                borderRadius: '6px', 
                fontSize: '0.75rem', 
                overflowX: 'auto',
                marginTop: '10px'
            }}>
{JSON.stringify(storageData, null, 2)}
            </pre>
        </details>
      </div>
    </div>
  );
};

export default DashboardPage;