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