/* eslint-disable react-hooks/exhaustive-deps */
 
// frontend/src/pages/Users/Profile.jsx
import React, { useState, useEffect } from "react";
import { FiUser, FiLock, FiSave } from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import { useAuth } from "../../context/AuthContext";
import {
  fetchProfile,
  updateProfile,
  changePassword,
} from "../../services/userService";

const Profile = () => {
  const { token, logout } = useAuth(); // 2. Ambil fungsi logout
  const navigate = useNavigate(); // 3. Inisialisasi navigate
  const [loading, setLoading] = useState(true);

  // State Data Diri
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    birthday: "",
    role: ""
  });

  // State Password
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Load Data
  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchProfile(token);
      setProfileData({
        full_name: data.full_name || "",
        email: data.email || "",
        birthday: data.birthday ? (data.birthday.includes("T") ? data.birthday.split("T")[0] : data.birthday) : "",
        role: data.role || "User"
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Gagal memuat profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadProfile();
  }, [token]);

  // Handle Input Change
  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  // --- LOGIC 1: UPDATE PROFIL & REDIRECT ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(token, {
        full_name: profileData.full_name,
        email: profileData.email,
        birthday: profileData.birthday
      });
      
      toast.success("Profil berhasil diperbarui! Mengalihkan...");
      
      // Beri jeda 1.5 detik agar user baca notif, lalu pindah ke Dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 300);

    } catch (error) {
      toast.error(error.message);
    }
  };

  // --- LOGIC 2: GANTI PASSWORD & LOGOUT ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      return toast.error("Konfirmasi password tidak cocok.");
    }
    
    try {
      await changePassword(token, {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });

      toast.success("Password berhasil diubah! Silakan login ulang.");
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });

      // Beri jeda 1.5 detik, lalu Logout
      setTimeout(() => {
        logout(); // Logout akan otomatis mengarahkan ke halaman Login (jika pakai ProtectedRoute)
      }, 300);

    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading Profile...</div>;

  return (
    <div className="container-fluid p-0">
      <h4 className="fw-bold mb-4 border-bottom pb-3">Pengaturan Profil</h4>

      <div className="row">
        {/* Update Data Diri */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white fw-bold d-flex align-items-center">
              <FiUser className="me-2" /> Data Pribadi
            </div>
            <form onSubmit={handleProfileSubmit} className="card-body">
              <div className="mb-3">
                <label className="form-label small fw-bold">Nama Lengkap</label>
                <input type="text" className="form-control" name="full_name" value={profileData.full_name} onChange={handleProfileChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Email</label>
                <input type="email" className="form-control" name="email" value={profileData.email} onChange={handleProfileChange} required />
                {profileData.role && <small className="text-muted d-block mt-1">Role: <span className="badge bg-secondary">{profileData.role}</span></small>}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Tanggal Lahir</label>
                <input type="date" className="form-control" name="birthday" value={profileData.birthday} onChange={handleProfileChange} />
              </div>

              <button type="submit" className="btn btn-primary mt-2">
                <FiSave className="me-2" /> Simpan & Kembali
              </button>
            </form>
          </div>
        </div>

        {/* Ubah Password */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold d-flex align-items-center">
               <FiLock className="me-2" /> Ubah Password
            </div>
            <form onSubmit={handlePasswordSubmit} className="card-body">
              <div className="mb-3">
                <label className="form-label small fw-bold">Password Lama</label>
                <input type="password" className="form-control" name="old_password" value={passwordData.old_password} onChange={handlePasswordChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Password Baru (Min 6 Karakter)</label>
                <input type="password" className="form-control" name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} required minLength="6" />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Konfirmasi Password Baru</label>
                <input type="password" className="form-control" name="confirm_password" value={passwordData.confirm_password} onChange={handlePasswordChange} required />
              </div>

              <button type="submit" className="btn btn-warning mt-2 text-dark">
                <FiLock className="me-2" /> Ubah Password & Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;