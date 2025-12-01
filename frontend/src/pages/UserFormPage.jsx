import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiLoader, FiCheck, FiX } from 'react-icons/fi';
import { 
    fetchUserById, 
    fetchRoles, 
    createUser, 
    updateUser 
} from '../services/userService'; // Pastikan semua fungsi ini sudah diexport

// 🎯 KUNCI FIX: Definisikan Struktur State Awal dengan Default Value
const initialFormState = {
    username: '',
    full_name: '',
    email: '',
    password: '', // Termasuk untuk mode Tambah
    role_id: '',  // Sesuai dengan kolom id_role di tabel
    is_active: true // Sesuai dengan kolom active di tabel
};

const UserFormPage = () => {
    const { token } = useAuth();
    const { id } = useParams(); 
    const navigate = useNavigate();

    const isEditMode = id !== 'new'; 
    const [formData, setFormData] = useState(initialFormState); 
    const [availableRoles, setAvailableRoles] = useState([]);
    const [loading, setLoading] = useState(isEditMode); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handler Perubahan Input
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // 1. Load Data (User dan Roles)
    useEffect(() => {
        const loadFormData = async () => {
            setLoading(true);
            try {
                // 1a. Ambil data Roles
                const rolesData = await fetchRoles(token);
                setAvailableRoles(rolesData);

                let initialData = initialFormState;
                
                // 1b. Jika mode Edit, ambil data User
                if (isEditMode) {
                    const userData = await fetchUserById(token, id);
                    
                    // Gabungkan data dari API dengan state default untuk menghindari 'undefined'
                    initialData = { 
                        ...initialFormState, 
                        ...userData 
                    }; 
                    
                    // Hapus password dari state di mode edit, agar tidak di-update kecuali diisi
                    delete initialData.password; 
                } else if (rolesData.length > 0) {
                    // Set default role_id jika mode Tambah dan roles sudah dimuat
                    initialData.role_id = rolesData[0].id;
                }
                
                setFormData(initialData); 

            } catch (error) {
                toast.error(error.message || "Gagal memuat data form. Kembali ke daftar.");
                navigate('/admin/users');
            } finally {
                setLoading(false);
            }
        };
        loadFormData();
    }, [token, id, isEditMode, navigate]); 

    // 2. Handler Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Filter data yang tidak perlu dikirim (misalnya, password kosong saat edit)
        const dataToSend = { ...formData };

        if (isEditMode && !dataToSend.password) {
            delete dataToSend.password;
        }

        try {
            if (isEditMode) {
                await updateUser(token, id, dataToSend);
                toast.success("Pengguna berhasil diperbarui!");
            } else {
                // Tambah mode: Password wajib ada di state/formData
                if (!dataToSend.password) {
                     toast.error("Password wajib diisi untuk pengguna baru.");
                     setIsSubmitting(false);
                     return;
                }
                await createUser(token, dataToSend);
                toast.success("Pengguna baru berhasil ditambahkan!");
            }
            // Redirect kembali ke halaman admin setelah sukses
            navigate('/admin/users'); 

        } catch (error) {
            console.error("Kesalahan Submit:", error);
            toast.error(error.message || "Gagal menyimpan data pengguna.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container flex-center">
                <FiLoader size={30} className="spinner" />
                <p>Memuat Form...</p>
            </div>
        );
    }

    // 3. Render Form UI
    return (
        <div className="page-container user-form-page">
            <h1 className="page-title">{isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h1>
            <div className="card-panel">
                <form onSubmit={handleSubmit} className="user-form">
                    
                    {/* Input 1: Username */}
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input 
                            type="text" 
                            id="username"
                            name="username"
                            value={formData.username || ''} // Fallback ke '' untuk keamanan
                            onChange={handleChange} 
                            required 
                            disabled={isEditMode} // Username biasanya tidak bisa diedit
                        />
                        {isEditMode && <p className="help-text">Username tidak dapat diubah setelah dibuat.</p>}
                    </div>

                    {/* Input 2: Full Name */}
                    <div className="form-group">
                        <label htmlFor="full_name">Nama Lengkap</label>
                        <input 
                            type="text" 
                            id="full_name"
                            name="full_name"
                            value={formData.full_name || ''}
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    {/* Input 3: Email */}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    {/* Input 4: Password (Hanya wajib di mode Tambah) */}
                    <div className="form-group">
                        <label htmlFor="password">Password {isEditMode ? "(Kosongkan jika tidak ingin diubah)" : "*"}</label>
                        <input 
                            type="password" 
                            id="password"
                            name="password"
                            // Nilai harus selalu string kosong agar tidak ada controlled/uncontrolled warning
                            value={formData.password || ''} 
                            onChange={handleChange} 
                            required={!isEditMode} 
                        />
                    </div>

                    {/* Input 5: Role (SELECT id_role) */}
                    <div className="form-group">
                        <label htmlFor="role_id">Role Pengguna</label>
                        <select 
                            id="role_id" 
                            name="role_id"
                            value={formData.role_id || ''}
                            onChange={handleChange}
                            required
                            disabled={!availableRoles.length}
                        >
                            <option value="" disabled>Pilih Role</option>
                            {availableRoles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.role_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Input 6: Status Aktif (Checkbox is_active) */}
                    <div className="form-group checkbox-group">
                        <input 
                            type="checkbox" 
                            id="is_active"
                            name="is_active"
                            checked={!!formData.is_active} // Gunakan !! untuk memastikan boolean
                            onChange={handleChange} 
                        />
                        <label htmlFor="is_active" className="checkbox-label">
                            {formData.is_active ? 
                                <><FiCheck className="status-icon active" /> Aktif</> : 
                                <><FiX className="status-icon inactive" /> Nonaktif</>
                            }
                        </label>
                    </div>


                    {/* Tombol Aksi */}
                    <div className="form-actions mt-30">
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isSubmitting || loading}
                        >
                            {isSubmitting ? (
                                <><FiLoader className="spinner" /> Memproses...</>
                            ) : (
                                isEditMode ? 'Simpan Perubahan' : 'Buat Pengguna'
                            )}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/admin/users')} 
                            className="btn btn-secondary"
                            disabled={isSubmitting}
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormPage;