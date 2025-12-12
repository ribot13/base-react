// src/pages/Users/index.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react"; 
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiPlus, FiLoader, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { fetchUsers, fetchRoles, deleteUser } from "../../services/userService";
import { usePermission } from "../../hooks/usePermission";

const UserAdminPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const {can}=usePermission();

  // 1. STATE MANAGEMENT
  const [users, setUsers] = useState([]);
  const [, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loggedInUserLevel = user?.highestRoleLevel || 0;
  const loggedInUserId = user?.id;

  //permission
  const canView = can('user.view')
  const canCreate = can('user.create')
  const canEdit = can('user.edit')
  const canDelete = can('user.delete')

  // 2. DATA FETCHING
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        fetchUsers(token),
        fetchRoles(token),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      const errorMessage = error.message || "Gagal memuat data pengguna.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (canView && token) {
      loadData();
    } else if (!canView && !loading) {
      toast.error("Anda tidak memiliki izin untuk mengakses halaman ini.");
    } else {
      setLoading(false);
    }
  }, [loadData, canView, token]);

  // 3. TITLE BROWSER OTOMATIS
  useEffect(() => {
    document.title = "Manajemen Pengguna | MRW ERP";
  }, []);

  // 4. HANDLER CRUD
  const handleAdd = () => {
    navigate("/admin/users/new"); // Pastikan route ini sesuai dengan App.jsx Anda
  };

  const handleEdit = (user) => {
    navigate(`/admin/users/${user.id}`);
  };

  const handleDelete = async (targetUser) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus user "${targetUser.username}"?`)) {
      try {
        await deleteUser(token, targetUser.id);
        toast.success("Pengguna berhasil dihapus.");
        loadData(); // Reload data
      } catch (error) {
        toast.error("Gagal menghapus pengguna: " + error.message);
      }
    }
  };

  // 5. LOGIKA VALIDASI DELETE
  const isDeleteDisabled = (targetUser) => {
    // Tidak bisa hapus diri sendiri
    if (targetUser.id === loggedInUserId) return true;
    // Level Penghapus HARUS lebih tinggi dari Level Target
    if (loggedInUserLevel <= targetUser.highestRoleLevel) return true;
    return false;
  };

  if (!canView && !loading) {
    return (
      <div className="container-fluid p-0">
         <div className="card-panel text-center py-5">
            <h3 className="text-danger">Akses Ditolak</h3>
            <p className="text-muted">Anda tidak memiliki izin untuk mengelola pengguna.</p>
        </div>
      </div>
    );
  }

  // 6. RENDER UTAMA
  return (
    <div className="container-fluid p-0">
      <div className="card-panel">
        
        {/* --- A. HEADER TOMBOL TAMBAH (KANAN) --- */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
            <button
            className="btn btn-primary btn-sm"
            onClick={handleAdd}
            disabled={!canCreate}
            >
            <FiPlus className="me-2" /> Tambah Pengguna
            </button>
        </div>

        {/* --- B. SUB-HEADER (TOTAL & REFRESH) --- */}
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '15px',
            paddingBottom: '15px',
            borderBottom: '1px solid #e9ecef'
        }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
                Total Pengguna: <span style={{ color: '#2563eb' }}>{users.length}</span>
            </div>
            
            <button 
                className="btn btn-sm btn-outline-primary" 
                onClick={loadData} 
                title="Refresh Data"
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
                <FiRefreshCw /> Refresh
            </button>
        </div>

        {/* --- C. TABEL DATA --- */}
        <div className="table-responsive">
            {loading ? (
                <div className="text-center py-5">
                    <FiLoader className="spin-animation mb-2" size={30} color="#2563eb" />
                    <p className="text-muted">Memuat data pengguna...</p>
                </div>
            ) : (
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Nama Lengkap</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Username</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Roles</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '12px', color: '#666' }}>#{u.id}</td>
                                <td style={{ padding: '12px', fontWeight: 600, color: '#1f2937' }}>{u.full_name}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', color: '#4b5563' }}>
                                        @{u.username}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                {u.Roles && u.Roles.length > 0 ? (
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {u.Roles.map((r, idx) => (
                                            <span key={idx} style={{ fontSize: '11px', background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '10px', border: '1px solid #c7d2fe' }}>
                                                {r.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>-</span>
                                )}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                <span style={{ 
                                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                                    background: u.is_active ? '#dcfce7' : '#fee2e2',
                                    color: u.is_active ? '#166534' : '#991b1b'
                                }}>
                                    {u.is_active ? "Aktif" : "Nonaktif"}
                                </span>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                    <button
                                        className="btn-icon-sm"
                                        style={{ background: 'white', border: '1px solid #d1d5db', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: '#4b5563' }}
                                        onClick={() => handleEdit(u)}
                                        disabled={!canEdit}
                                        title="Edit Pengguna"
                                    >
                                    <FiEdit size={16} />
                                    </button>

                                    <button
                                        className="btn-icon-sm"
                                        style={{ 
                                            background: 'white', 
                                            border: '1px solid #d1d5db', 
                                            padding: '6px', 
                                            borderRadius: '4px', 
                                            cursor: isDeleteDisabled(u) ? 'not-allowed' : 'pointer', 
                                            color: isDeleteDisabled(u) ? '#9ca3af' : '#ef4444',
                                            opacity: isDeleteDisabled(u) ? 0.6 : 1
                                        }}
                                        onClick={() => handleDelete(u)}
                                        disabled={isDeleteDisabled(u) || !canDelete}
                                        title={isDeleteDisabled(u) ? "Akses Dibatasi" : "Hapus Pengguna"}
                                    >
                                    <FiTrash2 size={16} />
                                    </button>
                                </div>
                                </td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                    Tidak ada data pengguna yang ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserAdminPage;