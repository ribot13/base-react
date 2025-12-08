/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEyeOff, FiLink, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { fetchProducts, deleteProduct } from '../../services/product.service';

const ProductIndex = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchProducts(token);
            setProducts(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Hapus produk ini?')) {
            try {
                await deleteProduct(token, id);
                toast.success('Produk dihapus');
                loadData();
            } catch (err) {
                toast.error(err.message);
            }
        }
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold">Daftar Produk</h4>
                <button className="btn btn-primary" onClick={() => navigate('/admin/products/create')}>
                    <FiPlus className="me-2" /> Tambah Produk
                </button>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th style={{width: '5%'}}>Img</th>
                                    <th>Nama Produk</th>
                                    <th>SKU</th>
                                    <th>Harga</th>
                                    <th className="text-center">Stok</th>
                                    <th className="text-center">Status</th>
                                    <th className="text-end">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                                ) : products.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-4">Belum ada data produk.</td></tr>
                                ) : (
                                    products.map(p => {
                                        // Ambil stok aman (default 0 jika null)
                                        const currentStock = p.Stock?.stock_current || 0;
                                        const isOutOfStock = currentStock === 0;

                                        return (
                                            <tr key={p.id} className={isOutOfStock ? "table-danger" : ""}>
                                                <td>
                                                    <div style={{width: 40, height: 40, background: '#eee', borderRadius: 4, overflow: 'hidden'}}>
                                                        {/* Tampilkan gambar utama jika ada */}
                                                        {p.Images && p.Images.length > 0 ? (
                                                            <img 
                                                                src={p.Images[0].image_path} 
                                                                alt={p.name}
                                                                style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                                            />
                                                        ) : (
                                                            <div className="d-flex align-items-center justify-content-center h-100 text-muted small">Img</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="fw-bold d-flex align-items-center">
                                                        {p.name}
                                                        {/* Tanda Peringatan di samping nama jika kosong */}
                                                        {isOutOfStock && (
                                                            <span className="text-danger ms-2" title="Stok Habis">
                                                                <FiAlertCircle />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <small className="text-muted">{p.Category?.name || 'Uncategorized'}</small>
                                                </td>
                                                <td>{p.Stock?.sku || '-'}</td>
                                                <td>Rp {parseInt(p.price_sell).toLocaleString('id-ID')}</td>
                                                
                                                {/* Kolom Stok dengan Badge */}
                                                <td className="text-center">
                                                    {isOutOfStock ? (
                                                        <span className="badge bg-danger">Habis</span>
                                                    ) : (
                                                        <span className={`fw-bold ${currentStock <= (p.Stock?.stock_minimum || 0) ? 'text-warning' : 'text-dark'}`}>
                                                            {currentStock}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="text-center">
                                                    {p.visibility === 'hidden' && <span className="badge bg-secondary"><FiEyeOff/> Hidden</span>}
                                                    {p.visibility === 'link_only' && <span className="badge bg-info"><FiLink/> Link Only</span>}
                                                    {p.visibility === 'public' && <span className="badge bg-success">Public</span>}
                                                </td>
                                                <td className="text-end">
                                                    <button className="btn btn-sm btn-light text-primary me-1" onClick={() => navigate(`/admin/products/edit/${p.id}`)} title="Edit">
                                                        <FiEdit/>
                                                    </button>
                                                    <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(p.id)} title="Hapus">
                                                        <FiTrash2/>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductIndex;