 
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiSave, FiX, FiArrowLeft, FiCheckSquare, FiSquare } from 'react-icons/fi';
import api from '../../services/api'; // Menggunakan instance API langsung agar fleksibel

const UserFormPage = () => {
    const { id } = useParams(); // Jika ada ID, berarti Mode Edit
    const navigate = useNavigate();
    const isEditMode = !!id;

    // --- STATE ---
    const [isLoading, setIsLoading] = useState(false);
    const [rolesList, setRolesList] = useState([]); // Daftar semua role yang tersedia
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
        password: '', // Kosongkan saat init
        confirmPassword: '',
        is_active: true,
        roles: [] // Array of Role IDs
    });

    // --- FETCH DATA (Roles & User jika Edit) ---
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // 1. Ambil daftar Roles dulu
                const rolesRes = await api.get('/roles');
                setRolesList(rolesRes.data);

                // 2. Jika Edit Mode, ambil data User
                if (isEditMode) {
                    const userRes = await api.get(`/users/${id}`);
                    const userData = userRes.data;
                    
                    // Format data untuk form
                    setFormData({
                        username: userData.username,
                        email: userData.email || '',
                        full_name: userData.full_name || '',
                        password: '', // Jangan isi password hash dari DB!
                        confirmPassword: '',
                        is_active: userData.is_active,
                        // Map role object ke array of IDs
                        roles: userData.Roles ? userData.Roles.map(r => r.id) : [] 
                    });
                }
            } catch (error) {
                console.error("Gagal memuat data:", error);
                toast.error("Gagal memuat data formulir.");
                navigate('/admin/users');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id, isEditMode, navigate]);

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRoleToggle = (roleId) => {
        setFormData(prev => {
            const currentRoles = prev.roles;
            if (currentRoles.includes(roleId)) {
                // Hapus jika sudah ada (Toggle Off)
                return { ...prev, roles: currentRoles.filter(id => id !== roleId) };
            } else {
                // Tambah jika belum ada (Toggle On)
                return { ...prev, roles: [...currentRoles, roleId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi Password
        if (!isEditMode && !formData.password) {
            toast.error("Password wajib diisi untuk pengguna baru.");
            return;
        }
        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Konfirmasi password tidak cocok.");
            return;
        }

        try {
            setIsLoading(true);
            const payload = { ...formData };
            
            // Hapus password dari payload jika kosong (saat edit) agar tidak ter-reset
            if (isEditMode && !payload.password) {
                delete payload.password;
                delete payload.confirmPassword;
            }

            if (isEditMode) {
                await api.put(`/users/${id}`, payload);
                toast.success("Pengguna berhasil diperbarui!");
            } else {
                await api.post('/users', payload);
                toast.success("Pengguna baru berhasil dibuat!");
            }

            navigate('/admin/users');
        } catch (error) {
            console.error("Error submit:", error);
            const msg = error.response?.data?.message || "Gagal menyimpan data.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // --- RENDER ---
    return (
        <div className="admin-page-container">
            {/* 1. HEADER */}
            <div className="page-header">
                <h2 className="page-title">
                    <button 
                        className="btn btn-secondary btn-icon-sm" 
                        onClick={() => navigate('/admin/users')}
                        style={{ marginRight: '10px' }}
                    >
                        <FiArrowLeft />
                    </button>
                    {isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                </h2>
            </div>

            {/* 2. FORM CARD */}
            <div className="card-panel" style={{ maxWidth: '800px' }}>
                <form onSubmit={handleSubmit}>
                    
                    {/* Bagian A: Informasi Dasar */}
                    <h4 style={{ marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <FiUser style={{ marginRight: '8px' }} /> Informasi Akun
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Username <span style={{color:'red'}}>*</span></label>
                            <input 
                                type="text" 
                                className="form-control"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                disabled={isEditMode} // Username biasanya tidak boleh diganti sembarangan
                                placeholder="Contoh: arie.ramdhani"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nama Lengkap <span style={{color:'red'}}>*</span></label>
                            <input 
                                type="text" 
                                className="form-control"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                placeholder="Nama Lengkap User"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Alamat Email</label>
                        <input 
                            type="email" 
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="user@example.com"
                        />
                    </div>

                    {/* Bagian B: Keamanan */}
                    <div style={{ marginTop: '20px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
                        <div className="form-group">
                            <label className="form-label">
                                {isEditMode ? 'Password Baru (Opsional)' : 'Password'}
                                {isEditMode && <small style={{ fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '5px' }}>- Kosongkan jika tidak ingin mengubah</small>}
                            </label>
                            <input 
                                type="password" 
                                className="form-control"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={isEditMode ? "********" : "Masukan password kuat"}
                            />
                        </div>
                        {formData.password && (
                            <div className="form-group">
                                <label className="form-label">Konfirmasi Password</label>
                                <input 
                                    type="password" 
                                    className="form-control"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Ulangi password"
                                />
                            </div>
                        )}
                    </div>

                    {/* Bagian C: Roles & Status */}
                    <div style={{ marginTop: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        
                        {/* Pilihan Roles */}
                        <div>
                            <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Peran (Roles)</label>
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '8px', 
                                border: '1px solid var(--border-color)', 
                                padding: '15px', 
                                borderRadius: '6px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                backgroundColor: '#fff'
                            }}>
                                {rolesList.length > 0 ? rolesList.map(role => (
                                    <div 
                                        key={role.id} 
                                        onClick={() => handleRoleToggle(role.id)}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            cursor: 'pointer',
                                            padding: '5px',
                                            borderRadius: '4px',
                                            backgroundColor: formData.roles.includes(role.id) ? '#f0f9ff' : 'transparent'
                                        }}
                                    >
                                        <span style={{ 
                                            marginRight: '10px', 
                                            color: formData.roles.includes(role.id) ? 'var(--primary-color)' : '#ccc',
                                            display: 'flex', alignItems: 'center'
                                        }}>
                                            {formData.roles.includes(role.id) ? <FiCheckSquare size={20}/> : <FiSquare size={20}/>}
                                        </span>
                                        <span style={{ fontWeight: formData.roles.includes(role.id) ? '600' : '400' }}>
                                            {role.name}
                                        </span>
                                    </div>
                                )) : <p style={{ color: 'var(--text-muted)' }}>Belum ada data role.</p>}
                            </div>
                        </div>

                        {/* Status Aktif */}
                        <div>
                            <label className="form-label">Status Akun</label>
                            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label className="switch" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <span style={{ marginLeft: '10px', fontWeight: '500' }}>
                                        {formData.is_active ? 'Aktif (Bisa Login)' : 'Nonaktif (Dibekukan)'}
                                    </span>
                                </label>
                            </div>
                            <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Jika dinonaktifkan, pengguna tidak akan bisa masuk ke dalam sistem.
                            </p>
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div style={{ marginTop: '40px', display: 'flex', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            <FiSave /> {isLoading ? 'Menyimpan...' : 'Simpan Data'}
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={() => navigate('/admin/users')}
                            disabled={isLoading}
                        >
                            <FiX /> Batal
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default UserFormPage;