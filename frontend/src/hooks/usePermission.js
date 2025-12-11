// frontend/src/hooks/usePermission.js
import { useAuth } from "../context/AuthContext";

export const usePermission = () => {
  // 1. Ambil data dengan safety check (antisipasi jika Context belum siap)
  const authContext = useAuth();
  
  // Jika context null (jarang terjadi tapi mungkin), berikan default
  const user = authContext?.user || null;
  const permissions = authContext?.permissions || [];

  /**
   * Cek apakah user punya izin tertentu
   */
  const can = (requiredPermission) => {
    // Safety 1: Jika user belum login/data user kosong, tolak.
    if (!user) return false;

    // Safety 2: Superadmin Bypass (Level 99 atau role string)
    // Pastikan role di-lowercase agar tidak case-sensitive
    const role = user.role ? user.role.toLowerCase() : '';
    if (role === 'superadmin' || user.role_level === 99) {
        return true; 
    }

    // Safety 3: Pastikan permissions adalah ARRAY sebelum di-includes
    if (!Array.isArray(permissions)) {
        console.warn("Permission data is corrupted/not an array:", permissions);
        return false;
    }

    // Cek permission
    return permissions.includes(requiredPermission);
  };

  const canAny = (permissionList) => {
    if (!user) return false;
    const role = user.role ? user.role.toLowerCase() : '';
    if (role === 'superadmin' || user.role_level === 99) return true;
    
    if (!Array.isArray(permissions)) return false;
    return permissionList.some(p => permissions.includes(p));
  };

  return { can, canAny };
};