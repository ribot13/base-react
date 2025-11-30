// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import "./config.json";
import { ToastContainer } from "react-toastify"; // 👈 Import ini
import "react-toastify/dist/ReactToastify.css"; // 👈 Import CSS

import LoginPage from "./pages/LoginPage.jsx";
import MainLayout from "./layouts/MainLayout.jsx"; // 👈 Impor Layout Utama
import DashboardPage from "./pages/DashboardPage.jsx";
//import MembersPage from './pages/MembersPage.jsx'; // Contoh komponen halaman

// Komponen Pembungkus untuk Route Terproteksi
const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  // Jika tidak login, arahkan ke halaman login
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        {/* Rute Login tidak menggunakan Layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* 🎯 Rute Terproteksi Dibungkus dalam MainLayout */}
        <Route
          path="/*" // Menggunakan rute wildcard atau base path untuk rute terproteksi
          element={
            <PrivateRoute>
              <MainLayout>
                <Routes>
                  {/* Masukkan rute yang hanya me-load konten di sini */}
                  <Route path="/dashboard" element={<DashboardPage />} />

                  {/* Tambahkan rute untuk Simpanan, Pinjaman, dll. */}

                  {/* Redirect default ke Dashboard jika sudah login */}
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  </AuthProvider>
);

export default App;
