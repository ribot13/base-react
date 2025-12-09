// frontend/src/services/catalog.service.js
import { APP_CONFIG } from '../config/appConfig';

const API_URL = `${APP_CONFIG.API_BASE_URL}/catalogs`; // Endpoint baru: /api/catalogs

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Terjadi kesalahan API');
    }
    return response.json();
};

// GET ALL
export const fetchCatalogs = async (token) => {
    const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(response);
};

// GET ONE
export const fetchCatalogById = async (token, id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(response);
};

// CREATE
export const createCatalog = async (token, data) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

// UPDATE
export const updateCatalog = async (token, id, data) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

// DELETE
export const deleteCatalog = async (token, id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(response);
};