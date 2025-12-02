/* eslint-disable no-unused-vars */
// src/pages/MenuAdmin.jsx
import { APP_CONFIG } from '../../config/appConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 👇 1. IMPORT SEMUA ICON DARI FI AGAR BISA DIPANGGIL DINAMIS
import * as FiIcons from 'react-icons/fi'; 

const API_URL = `${APP_CONFIG.API_BASE_URL}/menu`;

const MenuAdmin = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    
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

    // --- HELPER: RENDER ICON DARI STRING ---
    // Fungsi ini mengubah string "FiHome" menjadi komponen <FiHome />
    const renderIcon = (iconName) => {
        // Ambil komponen dari library FiIcons berdasarkan namanya
        const IconComponent = FiIcons[iconName];
        
        // Jika ditemukan, render. Jika tidak, pakai default FiCircle
        if (IconComponent) {
            return <IconComponent size={18} />;
        }
        return <FiIcons.FiCircle size={18} />;
    };

    // --- FETCH DATA ---
    const fetchMenus = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMenuItems(response.data);
            setError(null);
        } catch (err) {
            setError('Gagal mengambil data menu.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // Validasi sederhana: Cek apakah icon valid
            if (!FiIcons[formData.icon_name]) {
                alert(`Nama icon "${formData.icon_name}" tidak ditemukan di library Feather Icons (Fi)!`);
                return;
            }

            if (formData.id) {
                await axios.put(`${API_URL}/${formData.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(API_URL, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            setFormData(initialFormState);
            setShowForm(false);
            fetchMenus();
        } catch (err) {
            alert('Gagal menyimpan menu.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus menu ini?')) {
            try {
                await axios.delete(`${API_URL}/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchMenus();
            } catch (err) {
                alert('Gagal menghapus menu.');
            }
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const parentOptions = menuItems.filter(item => !item.path && item.parent_id === null);

    return (
        <div className="admin-page-container">
            {/* --- HEADER --- */}
            <div className="page-header">
                <h2 className="page-title">
                    <FiIcons.FiMenu size={24} /> Administrasi Menu
                </h2>
                <button 
                    className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`} 
                    onClick={() => {
                        setShowForm(!showForm);
                        if(showForm) setFormData(initialFormState);
                    }}
                >
                    {showForm ? <><FiIcons.FiX /> Tutup Form</> : <><FiIcons.FiPlus /> Tambah Menu</>}
                </button>
            </div>

            {error && (
                <div className="card-panel" style={{ borderLeft: '4px solid var(--error-color)', padding: '15px' }}>
                    <p style={{ color: 'var(--error-color)', margin: 0 }}>{error}</p>
                </div>
            )}

            {/* --- FORM --- */}
            {showForm && (
                <div className="card-panel">
                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem' }}>
                        {formData.id ? `Edit Menu` : 'Buat Item Menu Baru'}
                    </h3>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {/* Kolom Kiri */}
                            <div>
                                <div className="form-group">
                                    <label className="form-label">Judul Label</label>
                                    <input 
                                        type="text" className="form-control" name="title" 
                                        value={formData.title} onChange={handleChange} required 
                                        placeholder="Contoh: Dashboard"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Path URL</label>
                                    <input 
                                        type="text" className="form-control" name="path" 
                                        value={formData.path || ''} onChange={handleChange} 
                                        placeholder="/dashboard (Kosongkan jika Folder)" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Icon Name (Preview: {renderIcon(formData.icon_name)})
                                    </label>
                                    <input 
                                        type="text" className="form-control" name="icon_name" 
                                        value={formData.icon_name} onChange={handleChange} 
                                        placeholder="Contoh: FiUser"
                                    />
                                    <small style={{color: 'var(--text-muted)'}}>
                                        Gunakan nama dari library Feather Icons (react-icons/fi).
                                    </small>
                                </div>
                            </div>

                            {/* Kolom Kanan */}
                            <div>
                                <div className="form-group">
                                    <label className="form-label">Izin Diperlukan</label>
                                    <input 
                                        type="text" className="form-control" name="required_permission" 
                                        value={formData.required_permission || ''} onChange={handleChange} 
                                        placeholder="Contoh: view-users" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Parent Menu</label>
                                    <select 
                                        className="form-control" name="parent_id" 
                                        value={formData.parent_id || ''} onChange={handleChange}
                                    >
                                        <option value="">-- Root (Menu Utama) --</option>
                                        {parentOptions.map(item => (
                                            <option key={item.id} value={item.id}>{item.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '30px' }}>
                                    <div>
                                        <label className="form-label">Urutan</label>
                                        <input 
                                            type="number" className="form-control" style={{ width: '80px' }}
                                            name="order_index" value={formData.order_index} onChange={handleChange} 
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input 
                                            type="checkbox" id="chkActive" name="is_active" 
                                            checked={formData.is_active} onChange={handleChange} 
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <label htmlFor="chkActive" style={{ cursor: 'pointer' }}>Aktifkan?</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn btn-primary">
                                <FiIcons.FiSave /> Simpan
                            </button>
                            <button 
                                type="button" className="btn btn-secondary" 
                                onClick={() => { setFormData(initialFormState); setShowForm(false); }}
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- TABLE --- */}
            <div className="card-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Daftar Menu ({menuItems.length})</h3>
                    <button className="btn btn-secondary btn-icon-sm" onClick={fetchMenus} title="Refresh Data">
                        <FiIcons.FiRefreshCw />
                    </button>
                </div>

                {isLoading ? (
                    <p>Memuat data...</p>
                ) : (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th width="5%">#</th>
                                    <th width="25%">Label & Icon</th>
                                    <th>Path / URL</th>
                                    <th>Izin Akses</th>
                                    <th>Parent ID</th>
                                    <th width="10%" style={{ textAlign: 'center' }}>Urutan</th>
                                    <th width="10%" style={{ textAlign: 'center' }}>Status</th>
                                    <th width="10%" style={{ textAlign: 'center' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {menuItems.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        {/* 👇 DISINI KITA RENDER ICON SECARA VISUAL */}
                                        <td style={{ fontWeight: 500 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ 
                                                    color: 'var(--primary-color)', 
                                                    display: 'flex', alignItems: 'center', 
                                                    background: '#f0f4ff', padding: '6px', borderRadius: '6px' 
                                                }}>
                                                    {renderIcon(item.icon_name)}
                                                </div>
                                                <div>
                                                    <div>{item.title}</div>
                                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.icon_name}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: item.path ? 'inherit' : 'var(--text-muted)', fontStyle: item.path ? 'normal' : 'italic' }}>
                                            {item.path || 'Folder Group'}
                                        </td>
                                        <td>
                                            {item.required_permission ? (
                                                <span className="badge badge-neutral">{item.required_permission}</span>
                                            ) : '-'}
                                        </td>
                                        <td>{item.parent_id || '-'}</td>
                                        <td style={{ textAlign: 'center' }}>{item.order_index}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                {item.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                                <button className="btn btn-secondary btn-icon-sm" onClick={() => handleEdit(item)} title="Edit">
                                                    <FiIcons.FiEdit />
                                                </button>
                                                <button className="btn btn-danger btn-icon-sm" onClick={() => handleDelete(item.id)} title="Hapus">
                                                    <FiIcons.FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuAdmin;