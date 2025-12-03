// src/pages/Users/form.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { fetchUserById, createUser, updateUser, fetchRoles } from "../../services/userService";

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const isEditMode = id !== "new";

  // 1. STATE FORM
  // Kita tambahkan 'birthday' dan ubah logika role menjadi single selection
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    birthday: "", // Field baru
    role_id: "",  // Single Role (bukan array lagi di state UI)
    is_active: true
  });

  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 2. LOAD DATA
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // A. Ambil daftar Role untuk Dropdown
        const roles = await fetchRoles(token);
        setRolesList(roles);

        // B. Jika Edit Mode, ambil data User
        if (isEditMode) {
          const userData = await fetchUserById(token, id);
          
          // Helper: Format tanggal dari ISO (2023-01-01T00:00...) ke YYYY-MM-DD untuk input date
          const formattedBirthday = userData.birthday ? userData.birthday.split('T')[0] : "";

          // Helper: Ambil Role pertama (karena sekarang sistemnya 1 user = 1 role)
          const currentRoleId = userData.Roles && userData.Roles.length > 0 ? userData.Roles[0].id : "";

          setFormData({
            username: userData.username,
            email: userData.email || "",
            full_name: userData.full_name,
            password: "", 
            birthday: formattedBirthday,
            role_id: currentRoleId,
            is_active: userData.is_active,
          });
        }
      } catch (error) {
        toast.error("Gagal memuat data: " + error.message);
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id, token]);

  // 3. HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 4. HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi Manual Tambahan
      if (!formData.role_id) throw new Error("Role (Hak Akses) wajib dipilih.");
      if (!formData.birthday) throw new Error("Tanggal Lahir wajib diisi.");
      
      // Validasi Password khusus User Baru
      if (!isEditMode && !formData.password) {
        throw new Error("Password wajib diisi untuk user baru.");
      }

      // Persiapkan Payload
      // Backend kemungkinan masih menerima 'role_ids' sebagai array, 
      // jadi kita bungkus single role_id ke dalam array.
      const payload = {
        ...formData,
        role_ids: [formData.role_id] // Konversi ke Array untuk kompatibilitas backend
      };

      // Hapus password dari payload jika kosong (saat edit)
      if (isEditMode && !payload.password) delete payload.password; 
      // Hapus properti role_id single karena sudah diganti role_ids array
      delete payload.role_id; 

      if (isEditMode) {
        await updateUser(token, id, payload);
        toast.success("User berhasil diperbarui!");
      } else {
        await createUser(token, payload);
        toast.success("User berhasil dibuat!");
      }

      navigate("/admin/users");
    } catch (error) {
      toast.error("Gagal menyimpan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="card-panel">
        
        {/* HEADER */}
        <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center gap-3">
                <button 
                    onClick={() => navigate("/admin/users")} 
                    className="btn btn-outline-secondary btn-sm"
                    title="Kembali"
                >
                    <FiArrowLeft />
                </button>
                <h4 className="m-0 fw-bold text-dark">
                    {isEditMode ? `Edit Pengguna` : "Tambah Pengguna Baru"}
                </h4>
            </div>
        </div>

        {/* FORM GRID 2 KOLOM */}
        <form onSubmit={handleSubmit}>
            <div className="row g-3">
                
                {/* 1. Username */}
                <div className="col-md-6">
                    <label className="form-label fw-bold small required-label">Username <span className="text-danger">*</span></label>
                    <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={isEditMode} // Username tidak bisa diganti saat edit
                        placeholder="Contoh: user123"
                        required
                    />
                </div>

                {/* 2. Email */}
                <div className="col-md-6">
                    <label className="form-label fw-bold small">Email <span className="text-danger">*</span></label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="user@example.com"
                        required
                    />
                </div>

                {/* 3. Password */}
                <div className="col-md-6">
                    <label className="form-label fw-bold small">
                        Password 
                        {isEditMode ? <span className="text-muted fw-normal fst-italic ms-1">(Opsional jika tidak ubah)</span> : <span className="text-danger">*</span>}
                    </label>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={isEditMode ? "Biarkan kosong jika tetap" : "Masukkan password kuat"}
                        required={!isEditMode} // Wajib hanya saat tambah baru
                    />
                </div>

                {/* 4. Nama Lengkap */}
                <div className="col-md-6">
                    <label className="form-label fw-bold small">Nama Lengkap <span className="text-danger">*</span></label>
                    <input
                        type="text"
                        className="form-control"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Nama asli pengguna"
                        required
                    />
                </div>

                {/* 5. Tanggal Lahir (NEW) */}
                <div className="col-md-6">
                    <label className="form-label fw-bold small">Tanggal Lahir <span className="text-danger">*</span></label>
                    <input
                        type="date"
                        className="form-control"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* 6. Role (Single Select) */}
                <div className="col-md-6">
                    <label className="form-label fw-bold small">Role (Hak Akses) <span className="text-danger">*</span></label>
                    <select
                        className="form-select"
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- Pilih Role --</option>
                        {rolesList.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 7. Status Aktif (Switch) - Full Width atau Col-12 agar jelas */}
                <div className="col-12 mt-4">
                    <div className="p-3 bg-light border rounded d-flex align-items-center">
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="activeSwitch"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                style={{ transform: 'scale(1.2)', marginRight: '10px' }}
                            />
                            <label className="form-check-label fw-bold" htmlFor="activeSwitch">
                                Status Akun Aktif
                            </label>
                        </div>
                        <div className="ms-auto text-muted small">
                            {formData.is_active ? "User dapat login" : "User diblokir"}
                        </div>
                    </div>
                </div>

            </div>

            {/* FOOTER ACTIONS */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button
                    type="button"
                    className="btn btn-secondary px-4"
                    onClick={() => navigate("/admin/users")}
                    disabled={loading}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={loading}
                >
                    {loading ? "Menyimpan..." : (
                        <>
                            <FiSave className="me-2" /> Simpan Data
                        </>
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormPage;