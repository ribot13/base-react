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
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

import LoginPage from "./pages/LoginPage.jsx";
import MainLayout from "./layouts/MainLayout.jsx"; 
//Dashboard";
import DashboardPage from "./pages/Dashboard";
//Pengaturan Sistem
//Adminisrtasi Menu
import MenuAdmin from './pages/MenuAdministrasi';
//Administrasi User
import UserAdminPage from "./pages/Users";
import UserFormPage from "./pages/Users/form.jsx";

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
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<DashboardPage />} />

                  {/* Administrasi Menu. */}
                  <Route path="/admin/menu" element={<MenuAdmin />} />
                  {/* Manajemen User */}
                  <Route path="/admin/users" element={<UserAdminPage />} />
                  <Route path="/admin/users/:id" element={<UserFormPage />} />
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
        autoClose={3000}
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
