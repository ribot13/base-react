// src/services/userService.js
import { APP_CONFIG } from '../config/appConfig';

const API_BASE_URL = APP_CONFIG.API_BASE_URL;
const ITEMS_PER_PAGE = APP_CONFIG.ITEMS_PER_PAGE;

/**
 * Mengambil daftar pengguna dari API dengan paginasi.
 * @param {string} token - Token autentikasi JWT.
 * @param {number} page - Halaman yang diminta (default 1).
 * @param {number} limit - Jumlah item per halaman (default ITEMS_PER_PAGE dari config).
 * @returns {Promise<object>} Objek berisi data, totalItems, totalPages, dll.
 */
export const fetchUsers = async (token, page = 1, limit = ITEMS_PER_PAGE) => {
    try {
        // Menggunakan limit dan page dari request (sesuai permintaan sebelumnya)
        const url = `${API_BASE_URL}/users?page=${page}&limit=${limit}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            // Melemparkan error jika respons tidak OK (misal: 403 Forbidden)
            const error = data.message || 'Gagal memuat data pengguna.';
            throw new Error(error);
        }

        // Mengembalikan struktur data yang diharapkan dari backend
        return data; // { data: [], totalItems, totalPages, currentPage, itemsPerPage }

    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

// ⚠️ TODO: Tambahkan fungsi createUser, updateUser, dan deleteUser di sini
// ...