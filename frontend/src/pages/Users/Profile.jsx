 
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
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    birthday: "", // Format 'YYYY-MM-DD'
  });
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchProfile(token);
      setProfileData({
        full_name: data.full_name || "",
        email: data.email || "",
        // Format tanggal dari database (YYYY-MM-DD HH:MM:SS) ke input date (YYYY-MM-DD)
        birthday: data.birthday ? data.birthday.split("T")[0] : "",
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    birthday: "",
  });
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await fetchProfile(token);

        // ⭐ PERBAIKAN KRITIS DI SINI:
        // Pastikan Anda memanggil setFormData dengan data yang benar.
        setFormData({
          name: data.name || "",
          email: data.email || "",
          // Tambahkan field lain yang dibutuhkan
        });
      } catch (error) {
        toast.error(error.message || "Gagal memuat data profil.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadProfile();
    }
  }, [token]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        full_name: profileData.full_name,
        birthday: profileData.birthday,
        email: profileData.email,
      };
      await updateProfile(token, dataToSend);
      toast.success("Profil berhasil disimpan!");
      // Opsional: perbarui data user di AuthContext
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      return toast.error("Password baru dan konfirmasi harus sama.");
    }
    if (passwordData.new_password.length < 6) {
      return toast.error("Password minimal 6 karakter.");
    }

    try {
      await changePassword(token, {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      toast.success("Password berhasil diubah!");
      // Reset form password
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading Profile...</div>;
  }

  return (
    <div className="container-fluid p-0">
      <h4 className="fw-bold mb-4 border-bottom pb-3">Pengaturan Profil</h4>

      <div className="row">
        {/* KOLOM KIRI: Update Data Diri */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white fw-bold d-flex align-items-center">
              <FiUser className="me-2" /> Data Pribadi
            </div>
            <form onSubmit={handleProfileSubmit} className="card-body">
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  <FiUser className="me-1" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  <FiMail className="me-1" /> Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                />
                <small className="text-muted">Role: {profileData.role}</small>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  <FiCalendar className="me-1" /> Tanggal Lahir
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="birthday"
                  value={profileData.birthday}
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
                <label className="form-label small fw-bold">
                  Password Lama
                </label>
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
                <label className="form-label small fw-bold">
                  Password Baru (Min 6 Karakter)
                </label>
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
                <label className="form-label small fw-bold">
                  Konfirmasi Password Baru
                </label>
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
