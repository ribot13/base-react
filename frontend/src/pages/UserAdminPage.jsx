/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react"; // 👈 Tambahkan useCallback
import { useNavigate } from "react-router-dom";
import { FiUsers, FiEdit2, FiTrash2, FiPlus, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useAccessControl } from "../hooks/useAccessControl";
import { fetchUsers, fetchRoles, deleteUser } from "../services/userService";

import "../styles/pages/admin-page.css";

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
  // 2. DATA FETCHING (Dibuat STABIL dengan useCallback)
  // ----------------------------------------------------

  // 🎯 PERBAIKAN 1: Gunakan useCallback untuk menstabilkan fungsi ini.
  // Fungsi ini hanya akan dibuat ulang jika token berubah.
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Ambil data users dan roles secara paralel
      const [usersData, rolesData] = await Promise.all([
        fetchUsers(token),
        fetchRoles(token),
      ]);

      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      // Error handling yang lebih baik
      const errorMessage =
        error.message ||
        "Gagal memuat data pengguna. Cek koneksi backend atau izin akses.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]); // 👈 loadData hanya bergantung pada token

  // 🎯 PERBAIKAN 2: Sesuaikan dependency array
  useEffect(() => {
    if (canManageUsers && token) {
      // Jika ada izin & token, panggil fungsi stabil
      loadData();
    } else if (!canManageUsers && !loading) {
      // Menghindari toast saat render awal jika tidak punya izin
      toast.error("Anda tidak memiliki izin untuk mengakses halaman ini.");
    } else {
      // Pastikan loading berhenti jika tidak ada token/izin
      setLoading(false);
    }
  }, [loadData, canManageUsers, token]); // 👈 Gunakan loadData, canManageUsers, dan token sebagai dependensi
  // Catatan: loading tidak dimasukkan sebagai dependency untuk mencegah loop
  // jika setLoading(false) di block 'else'

  // ----------------------------------------------------
  // 3. HANDLER CRUD
  // ----------------------------------------------------

  const handleAdd = () => {
    navigate("/admin/users/new");
  };

  const handleEdit = (user) => {
    navigate(`/admin/users/${user.id}`);
  };

  const handleDelete = async (targetUser) => {
    
  };

  // ----------------------------------------------------
  // 4. LOGIKA LEVEL ROLE (Frontend Check)
  // ----------------------------------------------------
  const isDeleteDisabled = (targetUser) => {
    // 1. Constraint 1: User tidak dapat menghapus diri sendiri
    if (targetUser.id === loggedInUserId) {
      return true;
    }

    // 2. Constraint 2: Level Penghapus HARUS lebih tinggi dari Level Target
    if (loggedInUserLevel <= targetUser.highestRoleLevel) {
      return true;
    }

    return false;
  };

  if (!canManageUsers && !loading) {
    return (
      <div className="page-container">
        <p>Akses Ditolak: Anda tidak memiliki izin untuk mengelola pengguna.</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // 5. RENDER UTAMA
  // ----------------------------------------------------

  return (
    <div className="admin-page-container">
      <h1 className="page-title">
        <FiUsers /> Manajemen Pengguna
      </h1>

      <div className="toolbar" style={{marginBottom:'10px',textAlign:'right'}}>
        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={!canManageUsers}
        >
          <FiPlus size={18} /> Tambah Pengguna
        </button>
      </div>

      <div className="admin-table-wrapper card-panel">
        {loading ? (
          <div className="loading-state">
            <FiLoader size={30} className="spinner" /> Memuat data...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Lengkap</th>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.full_name}</td>
                  <td>{u.username}</td>
                  <td>{u.email || "N/A"}</td>
                  <td>
                    {/* FIX: Optional Chaining untuk mencegah error 'map' pada undefined */}
                    {u.Roles?.map((r) => r.name).join(", ") || "N/A"}
                  </td>
                  <td>
                    <span
                      className={`status-tag ${
                        u.is_active ? "active" : "inactive"
                      }`}
                    >
                      {u.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {/* Tombol Edit */}
                      <button
                        className="btn btn-icon btn-edit"
                        onClick={() => handleEdit(u)}
                        disabled={!canManageUsers}
                        title="Edit Pengguna"
                      >
                        <FiEdit2 size={16} />
                      </button>

                      {/* Tombol Delete */}
                      <button
                        className="btn btn-icon btn-delete"
                        onClick={() => handleDelete(u)}
                        disabled={isDeleteDisabled(u) || !canManageUsers}
                        title={
                          isDeleteDisabled(u)
                            ? "Akses ditolak (Level sama/lebih tinggi atau Akun Anda)"
                            : "Hapus Pengguna"
                        }
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserAdminPage;
