// src/pages/LoginPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiLogIn, FiAlertCircle } from "react-icons/fi"; // Icon tambahan

// Import Context & Config
import { useAuth } from "../../context/AuthContext";
import { APP_CONFIG } from "../../config/appConfig"; // Gunakan config pusat
import usePageTitle from "../../hooks/usePageTitle";

// Import Assets & Styles
import Logo from "../../assets/logo.svg"; 
import "../../styles/LoginPage.css";

// URL API diambil dari config
const API_URL = `${APP_CONFIG.API_BASE_URL}/auth`;

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Set judul tab browser
  usePageTitle(`Login - ${APP_CONFIG.APP_TITLE}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      const { token, user, permissions } = response.data;

      // Simpan sesi ke Context
      login(user, permissions, token);

      // Redirect ke dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login Gagal:", err);
      // Pesan error yang lebih user-friendly
      const message =
        err.response?.data?.message || "Koneksi ke server gagal. Coba lagi nanti.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        
        {/* --- HEADER: LOGO & JUDUL --- */}
        <div className="login-header">
          <img src={Logo} alt="Logo Aplikasi" className="app-logo" />
          <h1 className="app-title">{APP_CONFIG.APP_TITLE}</h1>
          <p className="app-subtitle">Silakan masuk untuk melanjutkan</p>
        </div>

        {/* --- ERROR ALERT --- */}
        {error && (
            <div className="alert-error">
                <FiAlertCircle size={20} style={{ minWidth: '20px' }} />
                <span>{error}</span>
            </div>
        )}

        {/* --- LOGIN FORM --- */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              className="input-field"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
            <FiUser className="input-icon" />
          </div>

          <div className="input-group">
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <FiLock className="input-icon" />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-login" 
            disabled={isLoading}
          >
            {isLoading ? (
                "Memproses..."
            ) : (
                <>
                    <FiLogIn /> MASUK
                </>
            )}
          </button>
        </form>

        {/* --- FOOTER: COPYRIGHT & VERSION --- */}
        <div className="login-footer">
            &copy; {new Date().getFullYear()} {APP_CONFIG.APP_NAME}. <br/>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                Versi {APP_CONFIG.VERSION}
            </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;