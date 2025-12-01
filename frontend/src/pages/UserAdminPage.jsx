// src/pages/UserAdminPage.jsx
import React, { useState, useEffect } from 'react';
import { 
    FiUsers, FiEdit2, FiTrash2, FiPlus, 
    FiArrowLeft, FiArrowRight 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { fetchUsers } from '../services/userService'; // Import service
import { APP_CONFIG } from '../config/appConfig';

// Import CSS khusus admin page
import '../styles/pages/admin-page.css'; 


const UserAdminPage = () => {
  const { token } = useAuth();
  
  // State Data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = APP_CONFIG.ITEMS_PER_PAGE;


  const loadUsers = async (page) => {
    setLoading(true);
    setError(null);
    try {
      // Panggil service dengan token, page, dan limit dari config
      const data = await fetchUsers(token, page, ITEMS_PER_PAGE);
      
      setUsers(data.data);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError(err.message);
      // Tampilkan error ke Toastify
      toast.error(err.message || "Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(currentPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Dipanggil saat komponen dimuat atau token berubah


  // Handler Paginasi
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadUsers(newPage); // Panggil loadUsers untuk memuat halaman baru
    }
  };


  // Handler Aksi (Placeholder)
  const handleEdit = (user) => {
    toast.info(`Membuka form edit untuk: ${user.full_name}`);
    // TODO: Implementasi Modal/Form Edit
  };

  const handleDelete = (user) => {
    if (window.confirm(`Yakin ingin menghapus pengguna ${user.full_name}?`)) {
        // TODO: Implementasi logika delete API
        toast.warning(`Menghapus user: ${user.full_name}...`);
    }
  };
  
  const handleAdd = () => {
      toast.info("Membuka form tambah user baru.");
      // TODO: Implementasi Modal/Form Tambah
  }
  
  
  // ----------------------------------------
  // Tampilan Pemuatan/Error
  // ----------------------------------------
  if (loading && users.length === 0) {
    return <div className="admin-page-container loading-state">Memuat data pengguna...</div>;
  }
  
  if (error && users.length === 0) {
    return <div className="admin-page-container error-state">Error: {error}</div>;
  }

  // ----------------------------------------
  // Render Komponen Utama
  // ----------------------------------------
  return (
    <div className="admin-page-container">
        <div className="admin-page-header">
            <h2 className="page-title">
                <FiUsers size={24} /> Manajemen Pengguna
            </h2>
            <button className="btn btn-primary" onClick={handleAdd}>
                <FiPlus size={18} style={{ marginRight: '8px' }} />
                Tambah Pengguna
            </button>
        </div>

        {/* Panel Pembungkus Tabel */}
        <div className="admin-table-wrapper card-panel">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nama Lengkap</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Peran (Role)</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.full_name}</td>
                            <td>{user.username}</td>
                            <td>{user.email || 'N/A'}</td>
                            {/* Properti 'roles' berasal dari backend controller (user.controller.js) */}
                            <td>{user.roles || 'Tidak Ada Role'}</td> 
                            <td>
                                <span className={`status-tag ${user.is_active ? 'active' : 'inactive'}`}>
                                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button 
                                        className="btn btn-icon btn-edit" 
                                        onClick={() => handleEdit(user)}
                                        title="Edit Pengguna"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button 
                                        className="btn btn-icon btn-delete" 
                                        onClick={() => handleDelete(user)}
                                        title="Hapus Pengguna"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && !loading && (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>Tidak ada data pengguna yang ditemukan.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            {/* KONTROL PAGINASI */}
            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button 
                        className="btn btn-secondary"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <FiArrowLeft size={16} /> Sebelumnya
                    </button>
                    <span>Halaman {currentPage} dari {totalPages}</span>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Selanjutnya <FiArrowRight size={16} />
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default UserAdminPage;