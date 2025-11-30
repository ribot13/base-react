// src/hooks/useAccessControl.js
import { useAuth } from '../context/AuthContext.jsx'; 

export const useAccessControl = () => {
    const { permissions, isLoggedIn } = useAuth(); 

    const canAccess = (requiredPermission) => {
        // 1. Jika tidak ada izin yang dibutuhkan (misalnya Dashboard), selalu True
        if (!requiredPermission) {
            return true;
        }

        // 2. Jika user belum login, pasti False
        if (!isLoggedIn) {
            return false;
        }
        
        // 👇 PERBAIKAN KRITIS DI SINI (Sebelum memanggil .includes())
        // Memastikan permissions adalah array yang valid. Jika tidak, anggap tidak ada akses.
        if (!permissions || !Array.isArray(permissions)) {
            // Ini akan menangani kasus di mana permissions masih undefined/null saat render pertama
            return false;
        }
        // 👆 PERBAIKAN KRITIS SELESAI
        
        // 3. Cek apakah izin ada di daftar permissions user
        // Line ini sekarang aman karena permissions sudah dipastikan Array.
        return permissions.includes(requiredPermission); // <-- LINE 22 (atau sekitar sini)
    };

    return { canAccess };
};