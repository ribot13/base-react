/* eslint-disable no-unused-vars */
// ./src/pages/Products/CatalogForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
// Asumsikan service sudah diimport dari file catalog.service.js
import { createCatalog, fetchCatalogById, updateCatalog } from '../../services/catalog.service'; 

const CatalogForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const isEditMode = id && id !== 'new';
    
    const [loading, setLoading] = useState(false);
    
    // State sesuai kebutuhan tabel 'catalog'
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active',
        // products: [] // Logika produk akan ditambahkan di langkah berikutnya
    });

    useEffect(() => {
        const init = async () => {
            if (isEditMode) {
                setLoading(true);
                try {
                    const data = await fetchCatalogById(token, id);
                    setFormData({
                        name: data.name,
                        description: data.description || '',
                        status: data.status,
                        // products: data.Products.map(p => p.id) // jika API mengembalikan data produk
                    });
                } catch (error) {
                    toast.error("Gagal memuat data katalog");
                } finally {
                    setLoading(false);
                }
            }
        };
        init();
    }, [id, token, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode) {
                await updateCatalog(token, id, formData);
                toast.success("Katalog berhasil diperbarui");
            } else {
                await createCatalog(token, formData);
                toast.success("Katalog baru berhasil dibuat");
            }
            navigate("/admin/products/catalogs"); // Navigasi ke halaman daftar katalog
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-0">
            <div className="card-panel">
                <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                    <button
                        className="btn btn-outline-secondary btn-sm me-3"
                        onClick={() => navigate("/admin/products/catalogs")}
                    >
                        <FiArrowLeft />
                    </button>
                    <h4 className="m-0 fw-bold">
                        {isEditMode ? "Edit Katalog" : "Buat Katalog Baru"}
                    </h4>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold small">
                                Nama Katalog <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-bold small">Status Katalog</label>
                            <select
                                className="form-select"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </div>

                        <div className="col-12">
                            <label className="form-label fw-bold small">Deskripsi</label>
                            <textarea
                                className="form-control"
                                name="description"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate("/admin/products/catalogs")}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            <FiSave className="me-2" /> Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CatalogForm;