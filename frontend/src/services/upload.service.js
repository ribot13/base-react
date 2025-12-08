import { APP_CONFIG } from "../config/appConfig";

export const uploadImage = async (token, file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
            // Jangan set Content-Type manual untuk FormData, browser akan mengaturnya
        },
        body: formData
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Gagal upload gambar');
    }
    return response.json(); // Mengembalikan { url: '...' }
};

export const deleteImageFromServer = async (token, imageUrl) => {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/upload`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl })
    });

    if (!response.ok) {
        console.error("Gagal menghapus gambar di server");
        // Kita tidak throw error agar tidak memblokir flow user
    }
    return true;
};