import { APP_CONFIG } from '../config/appConfig';

const API_URL = `${APP_CONFIG.API_BASE_URL}/products`;

const handleResponse = async (res) => {
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error API');
    }
    return res.json();
};

export const fetchProducts = async (token) => {
    const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
    return handleResponse(res);
};

export const fetchProductById = async (token, id) => {
    const res = await fetch(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    return handleResponse(res);
};

export const createProduct = async (token, data) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const updateProduct = async (token, id, data) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    // Gunakan helper handleResponse yang sudah ada
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error API');
    }
    return res.json();
};

export const deleteProduct = async (token, id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(res);
};

export const fetchCatalogProducts = async (token) => {
    // API endpoint ini harus mengembalikan minimal: [{id: 1, name: 'Produk A'}, {id: 2, name: 'Produk B'}]
    // Gunakan endpoint findAll Products Anda
    const response = await fetch(`${API_URL}`, { 
        headers: { Authorization: `Bearer ${token}` } 
    });
    // Gunakan handler yang sama seperti di product.category.service.js
    return response.json(); 
};

// TAMBAHAN BARU: Simpan Variasi
export const saveProductVariations = async (token, productId, data) => {
    const res = await fetch(`${API_URL}/${productId}/variations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

// TAMBAHAN BARU: Ambil Variasi (untuk Edit Mode)
export const fetchProductVariations = async (token, productId) => {
    const res = await fetch(`${API_URL}/${productId}/variations`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(res);
};

export const getStockHistory = async (token, productId) => {
    const response = await fetch(`${API_URL}/${productId}/stock-history`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Gagal mengambil riwayat stok");
    return await response.json();
};

export const adjustStock = async (token, productId, data) => {
    const response = await fetch(`${API_URL}/${productId}/adjust-stock`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Gagal menyesuaikan stok");
    return result;
};