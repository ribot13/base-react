import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiPlus, FiBox } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
// Pastikan path service benar
import { fetchCatalogById, updateCatalog } from '../../services/catalog.service';
import { fetchCatalogProducts,fetchProducts } from '../../services/product.service'; // Service ambil semua produk

const CatalogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [catalog, setCatalog] = useState(null);
    const [currentProducts, setCurrentProducts] = useState([]); // Produk di Tabel
    const [allMasterProducts, setAllMasterProducts] = useState([]); // Semua Data Produk dari DB
    const [selectedProductId, setSelectedProductId] = useState(""); // State Selectbox
    const [loading, setLoading] = useState(true);

    // 1. Load Data Awal
    useEffect(() => {
        const init = async () => {
            try {
                // Load Catalog Detail (beserta produk di dalamnya)
                const catalogData = await fetchCatalogProducts(token, id);
                setCatalog(catalogData);
                setCurrentProducts(catalogData.Products || []);

                // Load Semua Produk (Master Data) untuk Selectbox
                const productsData = await fetchProducts(token);
                setAllMasterProducts(productsData);

            } catch (error) {
                toast.error("Gagal memuat data: " + error.message);
                navigate('/admin/products/catalogs');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id, token, navigate]);

    // 2. Helper: Hitung produk yang tersedia untuk Selectbox
    // Logic: Semua Produk - Produk yang sudah ada di tabel
    const availableOptions = allMasterProducts.filter(
        master => !currentProducts.find(curr => curr.id === master.id)
    );

    // 3. Logic: Tambah Produk ke Tabel
    const handleAddProduct = async () => {
        if (!selectedProductId) return;

        // Cari object produk berdasarkan ID yang dipilih
        const productToAdd = allMasterProducts.find(p => p.id === parseInt(selectedProductId));
        if (!productToAdd) return;

        // Update State Lokal (Tabel bertambah)
        const newCurrentList = [...currentProducts, productToAdd];
        setCurrentProducts(newCurrentList);
        setSelectedProductId(""); // Reset selectbox

        // Simpan ke Backend (Sync)
        await saveChangesToBackend(newCurrentList);
    };

    // 4. Logic: Hapus Produk dari Tabel
    const handleRemoveProduct = async (productIdToRemove) => {
        if(!window.confirm("Hapus produk ini dari katalog?")) return;

        // Filter produk (hapus dari list)
        const newCurrentList = currentProducts.filter(p => p.id !== productIdToRemove);
        setCurrentProducts(newCurrentList);

        // Simpan ke Backend (Sync)
        await saveChangesToBackend(newCurrentList);
    };

    // 5. Fungsi Simpan ke API
    // Kita menggunakan endpoint updateCatalog yang sudah kita buat sebelumnya
    // Endpoint ini menerima { productIds: [1, 2, 3] } dan melakukan sync.
    const saveChangesToBackend = async (updatedProductList) => {
        try {
            const payload = {
                name: catalog.name, // Kirim ulang data wajib
                description: catalog.description,
                status: catalog.status,
                productIds: updatedProductList.map(p => p.id) // Ambil ID-nya saja
            };
            
            await updateCatalog(token, id, payload);
            toast.success("Data katalog diperbarui");
        } catch (error) {
            toast.error("Gagal menyimpan perubahan: " + error.message);
            // Opsional: Rollback state jika error (bisa ditambahkan logic reload)
        }
    };

    if (loading || !catalog) return <div className="p-5 text-center">Memuat detail katalog...</div>;

    return (
        <div className="container-fluid p-0">
            {/* Header: Tombol Kembali & Judul */}
            <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                <button className="btn btn-outline-secondary btn-sm me-3" onClick={() => navigate('/admin/products/catalogs')}>
                    <FiArrowLeft /> Kembali
                </button>
                <div>
                    <h4 className="m-0 fw-bold">{catalog.name}</h4>
                    <small className="text-muted">Status: <span className="badge bg-info">{catalog.status}</span></small>
                </div>
            </div>

            {/* Info Deskripsi */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body bg-light">
                    <h6 className="fw-bold text-secondary">Deskripsi Katalog</h6>
                    <p className="mb-0 text-dark">{catalog.description || "Tidak ada deskripsi."}</p>
                </div>
            </div>

            {/* Area Tabel Produk */}
            <div className="card shadow-sm">
                <div className="card-header bg-white py-3">
                    <h6 className="m-0 fw-bold d-flex align-items-center">
                        <FiBox className="me-2"/> Daftar Produk dalam Katalog
                        <span className="badge bg-primary ms-2">{currentProducts.length} Item</span>
                    </h6>
                </div>
                
                <div className="card-body p-0">
                    <table className="table table-hover table-striped mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">No</th>
                                <th>Nama Produk</th>
                                <th>Harga (Base)</th>
                                <th>Kategori</th> {/* Asumsi produk punya relasi kategori */}
                                <th className="text-end pe-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        Belum ada produk di katalog ini. Silakan tambahkan di bawah.
                                    </td>
                                </tr>
                            ) : (
                                currentProducts.map((prod, index) => (
                                    <tr key={prod.id}>
                                        <td className="ps-4">{index + 1}</td>
                                        <td className="fw-bold">{prod.name}</td>
                                        <td>Rp {prod.base_price?.toLocaleString('id-ID') || 0}</td>
                                        <td>{prod.Category?.name || '-'}</td> {/* Opsional jika ada include */}
                                        <td className="text-end pe-4">
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleRemoveProduct(prod.id)}
                                                title="Hapus dari katalog"
                                            >
                                                <FiTrash2 /> Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer: Area Tambah Produk */}
                <div className="card-footer bg-light p-3 border-top">
                    <label className="form-label fw-bold small text-muted">Tambahkan Produk ke Katalog Ini:</label>
                    <div className="d-flex gap-2">
                        <select 
                            className="form-select" 
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                            <option value="">-- Pilih Produk --</option>
                            {availableOptions.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} (Stok: {p.stock || 0})
                                </option>
                            ))}
                        </select>
                        <button 
                            className="btn btn-primary px-4 d-flex align-items-center"
                            onClick={handleAddProduct}
                            disabled={!selectedProductId}
                        >
                            <FiPlus className="me-2" /> Tambah
                        </button>
                    </div>
                    <small className="text-muted fst-italic mt-1 d-block">
                        *Produk yang sudah ada di tabel tidak akan muncul di pilihan ini.
                    </small>
                </div>
            </div>
        </div>
    );
};

export default CatalogDetail;