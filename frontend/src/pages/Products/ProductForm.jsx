/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft, FiPlus, FiTrash } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { createProduct, fetchProductById } from '../../services/product.service';
import { fetchCategories } from '../../services/product.category.service';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    
    // State Utama
    const [formData, setFormData] = useState({
        name: '', category_id: '', description: '', visibility: 'public',
        price_modal: 0, price_sell: 0, price_strike: 0,
        sku: '', stock_current: 0, stock_minimum: 0,
        weight: 0, length: 0, width: 0, height: 0, volumetric_weight: 0,
        is_preorder: false, po_process_time: 0, po_dp_requirement: 'none', po_dp_type: 'fixed', po_dp_value: 0,
        slug: '', seo_title: '', seo_description: '',
        wholesales: [], // Array [{min_qty, price}]
        images: [] 
    });

    useEffect(() => {
        const init = async () => {
            const cats = await fetchCategories(token);
            setCategories(cats);
            if (isEdit) {
                // Logic fetch detail product & populate formData here
            }
        };
        init();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    // Auto Volumetric
    useEffect(() => {
        const vol = (formData.length * formData.width * formData.height) / 6000;
        setFormData(prev => ({ ...prev, volumetric_weight: Math.ceil(vol) }));
    }, [formData.length, formData.width, formData.height]);

    // Handle Wholesale Dynamic Fields
    const addWholesale = () => setFormData(prev => ({ ...prev, wholesales: [...prev.wholesales, { min_qty: 1, price: 0 }] }));
    const removeWholesale = (idx) => {
        const newArr = [...formData.wholesales];
        newArr.splice(idx, 1);
        setFormData(prev => ({ ...prev, wholesales: newArr }));
    };
    const changeWholesale = (idx, field, val) => {
        const newArr = [...formData.wholesales];
        newArr[idx][field] = val;
        setFormData(prev => ({ ...prev, wholesales: newArr }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createProduct(token, formData);
            toast.success('Produk disimpan!');
            navigate('/admin/products');
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="container-fluid p-0 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}><FiArrowLeft/> Kembali</button>
                <h4 className="fw-bold m-0">{isEdit ? 'Edit Produk' : 'Produk Baru'}</h4>
                <button type="submit" className="btn btn-primary" disabled={loading}><FiSave className="me-2"/> Simpan</button>
            </div>

            <div className="row g-4">
                {/* KOLOM KIRI: Info Utama */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Informasi Dasar</h6>
                            <div className="mb-3">
                                <label className="form-label">Nama Produk</label>
                                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Deskripsi</label>
                                <textarea className="form-control" rows="4" name="description" value={formData.description} onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Harga & Grosir */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Harga</h6>
                            <div className="row g-3 mb-3">
                                <div className="col-md-4">
                                    <label className="form-label">Harga Modal</label>
                                    <input type="number" className="form-control" name="price_modal" value={formData.price_modal} onChange={handleChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Harga Jual</label>
                                    <input type="number" className="form-control" name="price_sell" value={formData.price_sell} onChange={handleChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Harga Coret</label>
                                    <input type="number" className="form-control" name="price_strike" value={formData.price_strike} onChange={handleChange} />
                                </div>
                            </div>
                            
                            <label className="form-label fw-bold">Harga Grosir</label>
                            {formData.wholesales.map((w, idx) => (
                                <div key={idx} className="input-group mb-2">
                                    <span className="input-group-text">Min Qty</span>
                                    <input type="number" className="form-control" value={w.min_qty} onChange={(e) => changeWholesale(idx, 'min_qty', e.target.value)} />
                                    <span className="input-group-text">Harga</span>
                                    <input type="number" className="form-control" value={w.price} onChange={(e) => changeWholesale(idx, 'price', e.target.value)} />
                                    <button type="button" className="btn btn-outline-danger" onClick={() => removeWholesale(idx)}><FiTrash/></button>
                                </div>
                            ))}
                            <button type="button" className="btn btn-sm btn-outline-primary mt-1" onClick={addWholesale}><FiPlus/> Tambah Grosir</button>
                        </div>
                    </div>

                    {/* Inventaris */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Inventaris</h6>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label">SKU</label>
                                    <input type="text" className="form-control" name="sku" value={formData.sku} onChange={handleChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Stok Saat Ini</label>
                                    <input type="number" className="form-control" name="stock_current" value={formData.stock_current} onChange={handleChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Stok Minimal</label>
                                    <input type="number" className="form-control" name="stock_minimum" value={formData.stock_minimum} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pengiriman */}
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Pengiriman (Dimensi)</h6>
                            <div className="row g-3">
                                <div className="col-6 col-md-3">
                                    <label className="form-label">Berat (gram)</label>
                                    <input type="number" className="form-control" name="weight" value={formData.weight} onChange={handleChange} />
                                </div>
                                <div className="col-6 col-md-3">
                                    <label className="form-label">Panjang (cm)</label>
                                    <input type="number" className="form-control" name="length" value={formData.length} onChange={handleChange} />
                                </div>
                                <div className="col-6 col-md-3">
                                    <label className="form-label">Lebar (cm)</label>
                                    <input type="number" className="form-control" name="width" value={formData.width} onChange={handleChange} />
                                </div>
                                <div className="col-6 col-md-3">
                                    <label className="form-label">Tinggi (cm)</label>
                                    <input type="number" className="form-control" name="height" value={formData.height} onChange={handleChange} />
                                </div>
                                <div className="col-12">
                                    <small className="text-muted">Berat Volumetrik (Otomatis): {formData.volumetric_weight} gram</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KOLOM KANAN: Status, Kategori, SEO */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Organisasi</h6>
                            <div className="mb-3">
                                <label className="form-label">Status Visibilitas</label>
                                <select className="form-select" name="visibility" value={formData.visibility} onChange={handleChange}>
                                    <option value="public">Public (Publik)</option>
                                    <option value="hidden">Hidden (Sembunyi)</option>
                                    <option value="link_only">Link Only</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Kategori</label>
                                <select className="form-select" name="category_id" value={formData.category_id} onChange={handleChange}>
                                    <option value="">-- Uncategorized --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Preorder</h6>
                            <div className="form-check form-switch mb-3">
                                <input className="form-check-input" type="checkbox" name="is_preorder" checked={formData.is_preorder} onChange={handleChange} />
                                <label className="form-check-label">Aktifkan Preorder</label>
                            </div>
                            {formData.is_preorder && (
                                <>
                                    <div className="mb-2">
                                        <label className="form-label small">Waktu Proses (Hari)</label>
                                        <input type="number" className="form-control form-control-sm" name="po_process_time" value={formData.po_process_time} onChange={handleChange} />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small">Kewajiban DP</label>
                                        <select className="form-select form-select-sm" name="po_dp_requirement" value={formData.po_dp_requirement} onChange={handleChange}>
                                            <option value="none">Tidak Ada DP</option>
                                            <option value="optional">Opsional</option>
                                            <option value="mandatory">Wajib</option>
                                        </select>
                                    </div>
                                    {formData.po_dp_requirement !== 'none' && (
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <label className="form-label small">Tipe DP</label>
                                                <select className="form-select form-select-sm" name="po_dp_type" value={formData.po_dp_type} onChange={handleChange}>
                                                    <option value="fixed">Nominal</option>
                                                    <option value="percentage">Persen</option>
                                                </select>
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small">Nilai</label>
                                                <input type="number" className="form-control form-control-sm" name="po_dp_value" value={formData.po_dp_value} onChange={handleChange} />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">SEO (Metadata)</h6>
                            <div className="mb-2">
                                <label className="form-label small">Judul Halaman</label>
                                <input type="text" className="form-control form-control-sm" name="seo_title" value={formData.seo_title} onChange={handleChange} placeholder="Default: Nama Produk" />
                            </div>
                            <div className="mb-2">
                                <label className="form-label small">Slug (URL)</label>
                                <input type="text" className="form-control form-control-sm" name="slug" value={formData.slug} onChange={handleChange} placeholder="Auto-generated" />
                            </div>
                            <div className="mb-2">
                                <label className="form-label small">Meta Deskripsi</label>
                                <textarea className="form-control form-control-sm" rows="3" name="seo_description" value={formData.seo_description} onChange={handleChange} placeholder="Default: Deskripsi Produk"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ProductForm;