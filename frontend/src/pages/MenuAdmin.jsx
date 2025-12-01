// src/pages/MenuAdmin.jsx
import {APP_CONFIG} from '../config/appConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiPlus, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import '../styles/menuAdmin.css'; // Kita akan buat file CSS ini nanti

const API_URL = `${APP_CONFIG.API_BASE_URL}/menu`; // Sesuaikan URL backend Anda

const MenuAdmin = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    
    // State untuk Form (default: buat item baru)
    const initialFormState = {
        id: null,
        title: '',
        path: '',
        required_permission: '',
        icon_name: 'FiCircle',
        parent_id: null,
        order_index: 0,
        is_active: true,
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- FETCH DATA ---
    const fetchMenus = async () => {
        setIsLoading(true);
        try {
            // Memanggil endpoint findAll untuk data datar (CRUD)
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMenuItems(response.data);
            setError(null);
        } catch (err) {
            setError('Gagal mengambil data menu. Pastikan Anda memiliki izin.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    // --- HANDLE FORM CHANGES ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- SUBMIT FORM (CREATE / UPDATE) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                // UPDATE
                await axios.put(`${API_URL}/${formData.id}`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } else {
                // CREATE
                await axios.post(API_URL, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            }
            
            // Reset form dan refresh data
            setFormData(initialFormState);
            setShowForm(false);
            fetchMenus();
        } catch (err) {
            alert('Gagal menyimpan menu. Periksa izin atau data input.');
            console.error(err);
        }
    };

    // --- DELETE ITEM ---
    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus menu ini?')) {
            try {
                await axios.delete(`${API_URL}/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchMenus();
            } catch (err) {
                alert('Gagal menghapus menu.');
                console.error(err);
            }
        }
    };

    // --- EDIT ITEM ---
    const handleEdit = (item) => {
        setFormData(item);
        setShowForm(true);
        window.scrollTo(0, 0); // Gulir ke atas untuk melihat form
    };

    // --- RENDER ---
    if (isLoading) return <div>Memuat data menu...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    // Filter menu items untuk dropdown parent_id
    const parentOptions = menuItems.filter(item => item.path === null && item.parent_id === null);

    return (
        <div className="menu-admin-container">
            <h2>🛠️ Administrasi Menu Sidebar</h2>

            <button 
                className="btn-toggle-form" 
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? 'Tutup Form' : 'Tambah Menu Baru'} 
                {showForm ? <FiChevronUp /> : <FiPlus />}
            </button>
            
            {/* Form Tambah/Edit Menu */}
            {showForm && (
                <div className="menu-form-card">
                    <h3>{formData.id ? `Edit Menu: ${formData.title}` : 'Buat Item Menu Baru'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Judul:</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Path (URL, biarkan kosong untuk Folder):</label>
                            <input type="text" name="path" value={formData.path || ''} onChange={handleChange} placeholder="/dashboard/anggota atau kosong" />
                        </div>
                        <div className="form-group">
                            <label>Icon Name (Contoh: FiUser):</label>
                            <input type="text" name="icon_name" value={formData.icon_name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Izin Diperlukan (Contoh: read-member):</label>
                            <input type="text" name="required_permission" value={formData.required_permission || ''} onChange={handleChange} placeholder="Kosongkan jika tidak ada" />
                        </div>
                        <div className="form-group">
                            <label>Parent (Jika Submenu):</label>
                            <select name="parent_id" value={formData.parent_id || ''} onChange={handleChange}>
                                <option value="">-- Pilih Parent --</option>
                                {parentOptions.map(item => (
                                    <option key={item.id} value={item.id}>{item.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group group-inline">
                            <label>Order:</label>
                            <input type="number" name="order_index" value={formData.order_index} onChange={handleChange} required />
                            <label>Aktif:</label>
                            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">{formData.id ? 'Update Menu' : 'Simpan Menu'}</button>
                            <button type="button" className="btn-secondary" onClick={() => setFormData(initialFormState)}>Reset</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabel Daftar Menu */}
            <div className="menu-list-table">
                <h3>Daftar Menu ({menuItems.length} Item)</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Judul</th>
                            <th>Path</th>
                            <th>Parent ID</th>
                            <th>Izin</th>
                            <th>Order</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menuItems.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.title}</td>
                                <td>{item.path || <em>(Folder)</em>}</td>
                                <td>{item.parent_id || '-'}</td>
                                <td>{item.required_permission || '-'}</td>
                                <td>{item.order_index}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEdit(item)}><FiEdit /></button>
                                    <button className="btn-delete" onClick={() => handleDelete(item.id)}><FiTrash2 /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MenuAdmin;