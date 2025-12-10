import { APP_CONFIG } from '../config/appConfig';

const API_URL = `${APP_CONFIG.API_BASE_URL}/products`;

export const getProductVariations = async (token, productId) => {
    const res = await fetch(`${API_URL}/${productId}/variations`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Gagal mengambil data variasi");
    return res.json();
};

export const saveProductVariations = async (token, productId, data) => {
    const res = await fetch(`${API_URL}/${productId}/variations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Gagal menyimpan variasi");
    return res.json();
};