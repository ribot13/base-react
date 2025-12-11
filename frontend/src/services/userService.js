// src/services/userService.js
import { APP_CONFIG } from '../config/appConfig'; // Asumsikan Anda memiliki ini
const API_BASE_URL = APP_CONFIG.API_BASE_URL;

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        // Melemparkan error untuk ditangkap di try/catch
        throw new Error(errorData.message || `API Error: ${response.statusText}`); 
    }
    return response.json();
};



/**
 * Mengambil daftar semua pengguna
 */
export const fetchUsers = async (token) => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return handleResponse(response);
};
/**
 * Mengambil  pengguna by id
 */
export const fetchUserById = async (token, userId) => {
    const url = `${API_BASE_URL}/admin/users/${userId}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        // Tangani error seperti 404 atau 403
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal memuat pengguna ID ${userId}.`);
    }

    const data = await response.json();
    return data; 
};

/**
 * Mengambil daftar semua role (digunakan di UserAdminPage)
 */
export const fetchRoles = async (token) => {
    // URL yang sebelumnya 404, sekarang harus berfungsi setelah Anda 
    // menambahkan routes/role.routes.js di backend.
    const response = await fetch(`${API_BASE_URL}/roles`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return handleResponse(response);
};

/**
 * Membuat pengguna baru
 */
export const createUser = async (token, userData) => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

/**
 * Memperbarui pengguna yang sudah ada
 */
export const updateUser = async (token, userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

/**
 * Menghapus pengguna
 */
export const deleteUser = async (token, userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse(response);
};

// 1. Fetch Profile
export const fetchProfile = async (token) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/profile`, { 
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal mengambil data profil');
    }

    return response.json(); // <--- PENTING: Harus di-return sebagai JSON
};

// 2. Update Profile
export const updateProfile = async (token, data) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Gagal memperbarui profil.");
    return result;
};

// 3. Change Password
export const changePassword = async (token, data) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/profile/change-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Gagal mengubah password.");
    return result;
};