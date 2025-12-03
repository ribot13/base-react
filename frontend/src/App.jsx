// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet, // <--- JANGAN LUPA IMPORT INI
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

// Components & Pages
import LoginPage from "./pages/Auth";
import MainLayout from "./layouts/MainLayout.jsx"; 
import DashboardPage from "./pages/Dashboard";
import MenuAdmin from './pages/MenuAdministrasi';
import UserAdminPage from "./pages/Users";
import UserFormPage from "./pages/Users/form.jsx";

// Guard
import ProtectedRoute from "./components/ProtectedRoute.jsx"; 

// ---------------------------------------------------------
// 1. BUAT WRAPPER LAYOUT
// Ini triknya: MainLayout menerima <Outlet /> sebagai children
// sehingga router tahu di mana harus merender halaman aktif.
// ---------------------------------------------------------
const LayoutWrapper = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        {/* Rute Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* 🎯 Rute Terproteksi */}
        <Route element={<ProtectedRoute />}>
            
            {/* Gunakan Wrapper yang sudah kita buat di atas */}
            <Route element={<LayoutWrapper />}>
                
                {/* Definisi Halaman */}
                <Route path="/dashboard" element={<DashboardPage />} />
                
                {/* Halaman Admin */}
                <Route path="/admin/menu" element={<MenuAdmin />} />
                <Route path="/admin/users" element={<UserAdminPage />} />
                <Route path="/admin/users/:id" element={<UserFormPage />} />
                
                {/* Redirect default */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                
            </Route>
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<Navigate to="/dashboard" />} />

      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        theme="colored"
      />
    </Router>
  </AuthProvider>
);

export default App;