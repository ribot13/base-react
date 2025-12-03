// src/pages/MenuAdministrasi/index.jsx
/* eslint-disable no-unused-vars */
import { APP_CONFIG } from '../../config/appConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

    // --- HELPER: RENDER ICON ---
    const renderIcon = (iconName) => {
        const IconComponent = FiIcons[iconName];
        if (IconComponent) return <IconComponent size={18} />;
        return <FiIcons.FiCircle size={18} />;
    };

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
        // Scroll ke atas agar user sadar form terbuka
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const parentOptions = menuItems.filter(item => !item.path && item.parent_id === null);

    return (
        <div className="container-fluid p-0">
            <div className="card-panel">
                
                {/* --- 1. HEADER UTAMA & TOMBOL TAMBAH --- */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
                    <button 
                        className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'} btn-sm`} 
                        onClick={() => {
                            setShowForm(!showForm);
                            if(showForm) setFormData(initialFormState);
                        }}
                    >
                        {showForm ? (
                            <><FiIcons.FiX className="me-2" /> Tutup Form</>
                        ) : (
                            <><FiIcons.FiPlus className="me-2" /> Tambah Menu</>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                {/* --- 2. FORM INPUT --- */}
                {showForm && (
                    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #e9ecef' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
                            {formData.id ? `Edit Menu` : 'Buat Menu Baru'}
                        </h4>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6" style={{ marginBottom: '15px' }}>
                                    <div className="form-group mb-3">
                                        <label className="form-label fw-bold">Judul Label</label>
                                        <input 
                                            type="text" className="form-control" name="title" 
                                            value={formData.title} onChange={handleChange} required 
                                            placeholder="Contoh: Dashboard"
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="form-label fw-bold">Path URL</label>
                                        <input 
                                            type="text" className="form-control" name="path" 
                                            value={formData.path || ''} onChange={handleChange} 
                                            placeholder="/dashboard (Kosongkan jika Folder)" 
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="form-label fw-bold">Icon Name</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input 
                                                type="text" className="form-control" name="icon_name" 
                                                value={formData.icon_name} onChange={handleChange} 
                                                placeholder="Contoh: FiUser"
                                                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                                            />
                                            <span style={{ padding: '8px', background: 'white', border: '1px solid #ced4da', borderRadius: '4px' }}>
                                                {renderIcon(formData.icon_name)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label className="form-label fw-bold">Izin Akses (Permission)</label>
                                        <input 
                                            type="text" className="form-control" name="required_permission" 
                                            value={formData.required_permission || ''} onChange={handleChange} 
                                            placeholder="Contoh: view-users" 
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="form-label fw-bold">Parent Menu</label>
                                        <select 
                                            className="form-control" name="parent_id" 
                                            value={formData.parent_id || ''} onChange={handleChange}
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                                        >
                                            <option value="">-- Root (Menu Utama) --</option>
                                            {parentOptions.map(item => (
                                                <option key={item.id} value={item.id}>{item.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                                        <div>
                                            <label className="form-label fw-bold d-block">Urutan</label>
                                            <input 
                                                type="number" className="form-control" style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                                                name="order_index" value={formData.order_index} onChange={handleChange} 
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '30px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                                                <input 
                                                    type="checkbox" name="is_active" 
                                                    checked={formData.is_active} onChange={handleChange} 
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                <span className="fw-bold">Aktifkan?</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button 
                                    type="button" className="btn btn-secondary" 
                                    onClick={() => { setFormData(initialFormState); setShowForm(false); }}
                                >
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <FiIcons.FiSave className="me-2" /> Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* --- 3. SUB-HEADER (TOTAL & REFRESH) --- */}
                {/* Kita pindahkan ini KELUAR dari table-responsive agar tidak terpotong & styles lebih jelas */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '15px',
                    paddingBottom: '15px',
                    borderBottom: '1px solid #e9ecef'
                }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
                        Total Menu: <span style={{ color: '#2563eb' }}>{menuItems.length}</span>
                    </div>
                    
                    <button 
                        onClick={fetchMenus} 
                        className="btn btn-sm btn-outline-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        title="Refresh Data"
                    >
                        <FiIcons.FiRefreshCw /> Refresh
                    </button>
                </div>

                {/* --- 4. TABEL DATA --- */}
                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Label</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Path</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Permission</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Urutan</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                            <FiIcons.FiLoader className="spin" /> Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : menuItems.length > 0 ? (
                                menuItems.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ 
                                                    width: '32px', height: '32px', background: '#e0e7ff', 
                                                    borderRadius: '6px', display: 'flex', alignItems: 'center', 
                                                    justifyContent: 'center', color: '#3730a3' 
                                                }}>
                                                    {renderIcon(item.icon_name)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#1f2937' }}>{item.title}</div>
                                                    <small style={{ color: '#6b7280', fontSize: '0.85em' }}>{item.icon_name}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {item.path ? (
                                                <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: '#d63384' }}>
                                                    {item.path}
                                                </code>
                                            ) : (
                                                <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>Folder Group</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {item.required_permission && (
                                                <span style={{ fontSize: '11px', background: '#fffbeb', color: '#b45309', padding: '4px 8px', borderRadius: '12px', border: '1px solid #fcd34d' }}>
                                                    {item.required_permission}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>{item.order_index}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span style={{ 
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                                                background: item.is_active ? '#dcfce7' : '#fee2e2',
                                                color: item.is_active ? '#166534' : '#991b1b'
                                            }}>
                                                {item.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                <button 
                                                    className="btn-icon-sm" onClick={() => handleEdit(item)} 
                                                    style={{ background: 'white', border: '1px solid #d1d5db', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: '#4b5563' }}
                                                    title="Edit"
                                                >
                                                    <FiIcons.FiEdit size={16} />
                                                </button>
                                                <button 
                                                    className="btn-icon-sm" onClick={() => handleDelete(item.id)}
                                                    style={{ background: 'white', border: '1px solid #d1d5db', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: '#ef4444' }} 
                                                    title="Hapus"
                                                >
                                                    <FiIcons.FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
                                        Belum ada data menu. Silakan tambah menu baru.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MenuAdmin;