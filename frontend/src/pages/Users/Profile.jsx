/* eslint-disable no-unused-vars */
// frontend/src/pages/Users/Profile.jsx
import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiCalendar, FiLock, FiSave } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import {
  fetchProfile,
  updateProfile,
  changePassword,
} from "../../services/userService";

const Profile = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  // State untuk Data Pribadi
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    birthday: "",
    role: "" 
  });

  // State untuk Ganti Password
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Load Data Profil
  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchProfile(token);
      
      // Mengisi form dengan data dari API
      setProfileData({
        full_name: data.full_name || "",
        email: data.email || "",
        // Validasi format tanggal (cegah error jika null atau format beda)
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

  // Handle Input Change (Data Pribadi)
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // Handle Input Change (Password)
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Submit Data Pribadi
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(token, {
        full_name: profileData.full_name,
        email: profileData.email,
        birthday: profileData.birthday
      });
      toast.success("Profil berhasil diperbarui!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Submit Password
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
      toast.success("Password berhasil diubah!");
      // Reset form password
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading Profile...</div>;

  return (
    <div className="container-fluid p-0">
      <h4 className="fw-bold mb-4 border-bottom pb-3">Pengaturan Profil</h4>

      <div className="row">
        {/* KOLOM KIRI: Data Diri */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white fw-bold d-flex align-items-center">
              <FiUser className="me-2" /> Data Pribadi
            </div>
            <form onSubmit={handleProfileSubmit} className="card-body">
              
              <div className="mb-3">
                <label className="form-label small fw-bold">Nama Lengkap</label>
                <input
                  type="text"
                  className="form-control"
                  name="full_name"
                  value={profileData.full_name} // Binding ke state
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={profileData.email} // Binding ke state
                  onChange={handleProfileChange}
                  required
                />
                {profileData.role && <small className="text-muted d-block mt-1">Role: <span className="badge bg-secondary">{profileData.role}</span></small>}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Tanggal Lahir</label>
                <input
                  type="date"
                  className="form-control"
                  name="birthday"
                  value={profileData.birthday} // Binding ke state
                  onChange={handleProfileChange}
                />
              </div>

              <button type="submit" className="btn btn-primary mt-2">
                <FiSave className="me-2" /> Simpan Profil
              </button>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: Ubah Password */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold d-flex align-items-center">
               <FiLock className="me-2" /> Ubah Password
            </div>
            <form onSubmit={handlePasswordSubmit} className="card-body">
              
              <div className="mb-3">
                <label className="form-label small fw-bold">Password Lama</label>
                <input
                  type="password"
                  className="form-control"
                  name="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Password Baru (Min 6 Karakter)</label>
                <input
                  type="password"
                  className="form-control"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  className="form-control"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-warning mt-2 text-dark">
                <FiLock className="me-2" /> Ubah Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;