 
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react"; 
import { useNavigate } from "react-router-dom";
import { FiUsers, FiEdit, FiTrash2, FiPlus, FiLoader, FiRefreshCw, FiUserCheck, FiUserX } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useAccessControl } from "../../hooks/useAccessControl";
import { fetchUsers, fetchRoles, deleteUser } from "../../services/userService";

const UserAdminPage = () => {
  const { token, user } = useAuth();
  const { canAccess } = useAccessControl();
  const navigate = useNavigate();

  // 1. STATE MANAGEMENT
  const [users, setUsers] = useState([]);
  const [, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loggedInUserLevel = user?.highestRoleLevel || 0;
  const loggedInUserId = user?.id;

  const REQUIRED_PERMISSION = "manage-users";
  const canManageUsers = canAccess(REQUIRED_PERMISSION);

  // ----------------------------------------------------
  // 2. DATA FETCHING
  // ----------------------------------------------------
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
    if (canManageUsers && token) {
      loadData();
    } else if (!canManageUsers && !loading) {
      toast.error("Anda tidak memiliki izin untuk mengakses halaman ini.");
    } else {
      setLoading(false);
    }
  }, [loadData, canManageUsers, token]);

  // ----------------------------------------------------
  // 3. HANDLER CRUD
  // ----------------------------------------------------

  const handleAdd = () => {
    navigate("/admin/users/new");
  };

  const handleEdit = (user) => {
    navigate(`/admin/users/${user.id}`);
  };

  // Logic Hapus User
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

  // ----------------------------------------------------
  // 4. LOGIKA LEVEL ROLE (Frontend Check)
  // ----------------------------------------------------
  const isDeleteDisabled = (targetUser) => {
    // 1. Constraint: Tidak bisa hapus diri sendiri
    if (targetUser.id === loggedInUserId) return true;
    // 2. Constraint: Level Penghapus HARUS lebih tinggi dari Level Target
    if (loggedInUserLevel <= targetUser.highestRoleLevel) return true;
    
    return false;
  };

  if (!canManageUsers && !loading) {
    return (
      <div className="admin-page-container">
        <div className="card-panel" style={{ textAlign: 'center', color: 'var(--error-color)' }}>
            <h3>Akses Ditolak</h3>
            <p>Anda tidak memiliki izin untuk mengelola pengguna.</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 5. RENDER UTAMA
  // ----------------------------------------------------

  return (
    <div className="admin-page-container">
      {/* --- HEADER --- */}
      <div className="page-header justify-content-end">
        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={!canManageUsers}
        >
          <FiPlus size={18} /> Tambah Pengguna
        </button>
      </div>

      {/* --- CONTENT CARD --- */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
             <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Daftar Pengguna ({users.length})</h3>
             <button className="btn btn-secondary btn-icon-sm" onClick={loadData} title="Refresh Data">
                <FiRefreshCw />
             </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <FiLoader className="spin-animation" size={30} />
            <p style={{ marginTop: '10px' }}>Memuat data pengguna...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th width="5%">ID</th>
                  <th>Nama Lengkap</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                    users.map((u) => (
                    <tr key={u.id}>
                        <td>{u.id}</td>
                        <td style={{ fontWeight: 500 }}>{u.full_name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>@{u.username}</td>
                        <td>{u.email || "-"}</td>
                        <td>
                        {u.Roles && u.Roles.length > 0 ? (
                            u.Roles.map((r, idx) => (
                                <span key={idx} className="badge badge-neutral" style={{ marginRight: '5px' }}>
                                    {r.name}
                                </span>
                            ))
                        ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No Role</span>
                        )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${u.is_active ? "badge-success" : "badge-danger"}`}>
                            {u.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                            <button
                                className="btn btn-secondary btn-icon-sm"
                                onClick={() => handleEdit(u)}
                                disabled={!canManageUsers}
                                title="Edit Pengguna"
                            >
                            <FiEdit size={16} />
                            </button>

                            <button
                                className="btn btn-danger btn-icon-sm"
                                onClick={() => handleDelete(u)}
                                disabled={isDeleteDisabled(u) || !canManageUsers}
                                title={
                                    isDeleteDisabled(u)
                                    ? "Tidak dapat menghapus (Level setara/lebih tinggi atau akun sendiri)"
                                    : "Hapus Pengguna"
                                }
                            >
                            <FiTrash2 size={16} />
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                            Tidak ada data pengguna.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAdminPage;