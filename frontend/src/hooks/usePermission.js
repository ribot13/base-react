// frontend/src/hooks/usePermission.js
import { useAuth } from "../context/AuthContext";

export const usePermission = () => {
  const authContext = useAuth();
  
  // Safety check: cegah crash jika context belum siap
  const user = authContext?.user || null;
  const permissions = authContext?.permissions || [];

  /**
   * Cek apakah user punya izin tertentu
   * @param {string} requiredPermission - Nama permission yang dibutuhkan (misal: 'user.view')
   */
  const can = (requiredPermission) => {
    // 1. Jika tidak login, tolak
    if (!user) return false;

    // 2. SUPERADMIN BYPASS (Berdasarkan Role)
    // Jika role user adalah superadmin, selalu izinkan
    if (user.role === 'superadmin' || user.role_level === 99) {
        return true; 
    }

    // 3. WILDCARD BYPASS (Berdasarkan Permission '*')
    // Jika user punya permission '*', anggap dia dewa (boleh semua)
    if (Array.isArray(permissions) && permissions.includes('*')) {
        return true;
    }

    // 4. Validasi Array Normal
    if (!Array.isArray(permissions)) {
        return false;
    }

    // 5. Cek Spesifik
    // Apakah permission yang diminta ada di daftar permission user?
    return permissions.includes(requiredPermission);
  };

  /**
   * Cek apakah user punya SALAH SATU dari permission yang diminta
   * @param {Array} permissionList - Contoh: ['user.create', 'user.edit']
   */
  const canAny = (permissionList) => {
    if (!user) return false;
    if (user.role === 'superadmin' || user.role_level === 99) return true;
    if (Array.isArray(permissions) && permissions.includes('*')) return true; // 👈 Handle Wildcard di sini juga
    
    if (!Array.isArray(permissions)) return false;
    
    // Cek apakah ada irisan data
    return permissionList.some(p => permissions.includes(p));
  };

  return { can, canAny };
};