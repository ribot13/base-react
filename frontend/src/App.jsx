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
import Profile from "./pages/Users/Profile.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import DashboardPage from "./pages/Dashboard";
import MenuAdmin from "./pages/MenuAdministrasi";
import UserAdminPage from "./pages/Users";
import UserFormPage from "./pages/Users/form.jsx";
import ProductCategoryIndex from "./pages/Products/category.jsx";
import ProductCategoryForm from "./pages/Products/CategoryForm.jsx";
import ProductIndex from "./pages/Products/Product.jsx";
import ProductForm from "./pages/Products/ProductForm.jsx";
import CatalogIndex from "./pages/Products/Catalog.jsx";
import CatalogForm from "./pages/Products/CatalogForm.jsx";
import CatalogDetail from "./pages/Products/CatalogDetail.jsx";
import StockManagement from "./pages/Products/StockManagement.jsx";

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
            {/* Profile Page */}
            <Route path="/profile" element={<Profile />} />
            {/* Halaman Produk */}
            <Route
              path="admin/products"
              element={<ProductIndex />}
            />
            <Route
              path="admin/products/create"
              element={<ProductForm />}
            />
            <Route
              path="admin/products/edit/:id"
              element={<ProductForm />}
            />

            <Route
              path="admin/products/category"
              element={<ProductCategoryIndex />}
            />
            <Route
              path="admin/products/category/create"
              element={<ProductCategoryForm />}
            />
            <Route
              path="admin/products/category/edit/:id"
              element={<ProductCategoryForm />}
            />

            <Route
              path="admin/products/catalogs"
              element={<CatalogIndex />}
            />
            <Route
              path="admin/products/catalogs/create"
              element={<CatalogForm />}
            />
            <Route
              path="admin/products/catalogs/edit/:id"
              element={<CatalogForm />}
            />
            <Route path="/admin/products/catalogs/:id" element={<CatalogDetail />} />

            <Route path="/admin/products/stock-management" element={<StockManagement />} />

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

      <ToastContainer position="top-right" autoClose={5000} theme="colored" />
    </Router>
  </AuthProvider>
);

export default App;
