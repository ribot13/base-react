// src/hooks/useMenuLogic.js
import { useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { APP_CONFIG } from '../config/appConfig';

export const useMenuLogic = () => {
    const location = useLocation();
    
    // 1. SAFETY: Berikan default value [] jika permissions undefined/null
    const { sidebarMenu, permissions: userPermissions = [] } = useAuth(); 

    // Helper: Mengubah Tree (Pohon) Menu menjadi Flat Array
    const flattenMenu = (nodes, parents = []) => {
        let flat = [];
        // Safety check: jika nodes null/undefined
        if (!nodes || !Array.isArray(nodes)) return flat;

        nodes.forEach(node => {
            const nodeWithParents = { ...node, parents }; 
            flat.push(nodeWithParents);
            
            if (node.Children && node.Children.length > 0) {
                flat = flat.concat(flattenMenu(node.Children, [...parents, node]));
            }
        });
        return flat;
    };

    // Helper: Cari menu item yang cocok dengan URL saat ini
    const findActiveMenuItem = () => {
        if (!sidebarMenu || sidebarMenu.length === 0) return null;
        
        const flatData = flattenMenu(sidebarMenu);
        
        const activeItem = flatData.find(item => {
            if (!item.path) return false;
            // matchPath menangani dynamic route seperti /users/:id
            return matchPath({ path: item.path, end: true }, location.pathname);
        });

        return activeItem || null;
    };

    const activeItem = findActiveMenuItem();

    // --- LOGIC UTAMA ---

    const pageTitle = activeItem ? activeItem.title : 'Dashboard';

    const breadcrumbs = activeItem 
        ? [...activeItem.parents, activeItem] 
        : [];

        useEffect(() => {
        const appName = APP_CONFIG.APP_NAME; // Bisa diganti sesuai nama aplikasi Anda
        document.title = pageTitle ? `${pageTitle} | ${appName}` : appName;
    }, [pageTitle]);

    // 3. Cek Permission (Satpam) - DENGAN SAFETY CHECK
    const checkPageAccess = () => {
        // A. Jika item tidak ditemukan di database menu, anggap halaman umum (return true)
        // Atau return false jika Anda ingin strict mode (semua halaman wajib ada di menu)
        if (!activeItem) return true; 
        
        // B. Jika menu ini tidak butuh permission khusus, izinkan
        if (!activeItem.required_permission) return true; 

        // C. SAFETY CHECK KRISIAL (Penyebab Error Sebelumnya)
        // Pastikan userPermissions ada dan berupa Array
        if (!userPermissions || !Array.isArray(userPermissions)) {
            console.warn("Warning: User permissions not loaded or invalid.");
            return false; // Blokir akses jika data permission rusak
        }
        
        // D. Cek permission
        return userPermissions.includes(activeItem.required_permission);
    };

    return {
        pageTitle,
        breadcrumbs,
        hasAccess: checkPageAccess(),
        activeItem
    };
};