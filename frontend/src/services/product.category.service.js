// frontend/src/services/product.category.service.js
import { APP_CONFIG } from '../config/appConfig';

const API_URL = `${APP_CONFIG.API_BASE_URL}/products/category`;

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Terjadi kesalahan API');
    }
    return response.json();
};

export const fetchCategories = async (token) => {
    const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const fetchCategoryById = async (token, id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const createCategory = async (token, data) => {
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

export const updateCategory = async (token, id, data) => {
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

export const deleteCategory = async (token, id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const updateCategoryOrder = async (token, data) => {
    const response = await fetch(`${API_URL}/order`, { // Memanggil endpoint PUT /api/product-categories/order
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};