// src/pages/LoginPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import config from "../config.json";
import usePageTitle from "../hooks/usePageTitle.js";

// Ganti URL ini jika port backend Anda berbeda
const API_URL = "http://localhost:5001/api/auth";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

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

      // Panggil fungsi login dari Context, simpan user, permissions, dan token
      login(user, permissions, token);

      // Navigasi ke Dashboard setelah login berhasil
      navigate("/dashboard");
    } catch (err) {
      console.error("Login Gagal:", err);
      const message =
        err.response?.data?.message || "Gagal terhubung ke server.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  //set page title
  usePageTitle("Halaman Login");

  return (
    <div className="login-page-container">
      <form onSubmit={handleSubmit} className="login-form-box">
        <h2>{config.appName}</h2>
        <p className="subtitle">Masuk ke Sistem Administrasi</p>

        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <button type="submit" disabled={isLoading} className="login-button">
          {isLoading ? "Memproses..." : "LOGIN"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
