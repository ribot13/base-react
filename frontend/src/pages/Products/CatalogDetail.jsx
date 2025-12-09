import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiPlus, FiBox } from 'react-icons/fi';
import { toast } from 'react-toastify';
// 1. IMPORT REACT-SELECT
import Select from 'react-select'; 
import { useAuth } from '../../context/AuthContext';
import { fetchCatalogById, updateCatalog } from '../../services/catalog.service';
import { fetchProducts } from '../../services/product.service';

const CatalogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [catalog, setCatalog] = useState(null);
    const [currentProducts, setCurrentProducts] = useState([]);
    const [allMasterProducts, setAllMasterProducts] = useState([]);
    // 2. STATE UNTUK SELECTED OPTION (Object, bukan string ID lagi)
    const [selectedOption, setSelectedOption] = useState(null); 
    const [loading, setLoading] = useState(true);

    // ... (useEffect Init tetap SAMA) ...
    // ... (Gunakan kode useEffect yang sudah benar dari diskusi sebelumnya) ...
    useEffect(() => {
        const init = async () => {
            try {
                const catalogData = await fetchCatalogById(token, id);
                setCatalog(catalogData);
                setCurrentProducts(catalogData.Products || []);

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


    // 3. LOGIKA DATA UNTUK REACT-SELECT
    // Filter produk yang belum ada di tabel
    const availableProducts = allMasterProducts.filter(
        master => !currentProducts.find(curr => curr.id === master.id)
    );

    // Format data menjadi { value, label } agar dimengerti React-Select
    const selectOptions = availableProducts.map(p => ({
        value: p.id,
        label: `${p.name} (Stok: ${p.Stock.stock_current})`, // Tampilan teks di dropdown
        originalData: p // Simpan data asli untuk kemudahan akses
    }));


    // 4. LOGIKA TAMBAH PRODUK (Disesuaikan)
    const handleAddProduct = async () => {
        if (!selectedOption) return;

        // Ambil object produk dari data asli yang kita simpan di option
        const productToAdd = selectedOption.originalData;
        
        // Update State Lokal
        const newCurrentList = [...currentProducts, productToAdd];
        setCurrentProducts(newCurrentList);
        setSelectedOption(null); // Reset selectbox jadi kosong

        // Simpan ke Backend
        await saveChangesToBackend(newCurrentList);
    };

    // ... (handleRemoveProduct tetap SAMA) ...
    const handleRemoveProduct = async (productIdToRemove) => {
        if(!window.confirm("Hapus produk ini dari katalog?")) return;
        const newCurrentList = currentProducts.filter(p => p.id !== productIdToRemove);
        setCurrentProducts(newCurrentList);
        await saveChangesToBackend(newCurrentList);
    };

    // ... (saveChangesToBackend tetap SAMA) ...
    const saveChangesToBackend = async (updatedProductList) => {
        try {
            const payload = {
                name: catalog.name,
                description: catalog.description,
                status: catalog.status,
                productIds: updatedProductList.map(p => p.id)
            };
            await updateCatalog(token, id, payload);
            toast.success("Data katalog diperbarui");
        } catch (error) {
            toast.error("Gagal menyimpan perubahan: " + error.message);
        }
    };

    if (loading || !catalog) return <div className="p-5 text-center">Memuat detail katalog...</div>;

    return (
        <div className="container-fluid p-0">
            {/* ... (Header dan Info Deskripsi tetap SAMA) ... */}
            <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                <button className="btn btn-outline-secondary btn-sm me-3" onClick={() => navigate('/admin/products/catalogs')}>
                    <FiArrowLeft /> Kembali
                </button>
                <div>
                    <h4 className="m-0 fw-bold">{catalog.name}</h4>
                    <small className="text-muted">Status: <span className="badge bg-info">{catalog.status}</span></small>
                </div>
            </div>

            <div className="card mb-4 shadow-sm">
                <div className="card-body bg-light">
                    <h6 className="fw-bold text-secondary">Deskripsi Katalog</h6>
                    <p className="mb-0 text-dark">{catalog.description || "Tidak ada deskripsi."}</p>
                </div>
            </div>

            {/* Area Tabel Produk */}
            <div className="card shadow-sm">
                {/* ... (Header Tabel & Body Tabel tetap SAMA) ... */}
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
                                <th>Kategori</th>
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
                                        <td className="ps-4">{index + 1}.</td>
                                        <td className="fw-bold">{prod.name}</td>
                                        <td>Rp {prod.sales_price?.toLocaleString('id-ID') || 0}</td>
                                        <td>{prod.Category?.name || '-'}</td>
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

                {/* Footer: Area Tambah Produk dengan REACT-SELECT */}
                <div className="card-footer bg-light p-3 border-top">
                    <label className="form-label fw-bold small text-muted">Tambahkan Produk ke Katalog Ini:</label>
                    <div className="d-flex gap-2 align-items-center">
                        
                        {/* 5. GANTI SELECT HTML BIASA DENGAN COMPONENT REACT-SELECT */}
                        <div style={{ flexGrow: 1 }}>
                            <Select
                                options={selectOptions} // Data opsi yang sudah diformat
                                value={selectedOption}  // State yang dipilih
                                onChange={setSelectedOption} // Handler saat memilih
                                placeholder="Ketik nama produk untuk mencari..."
                                isClearable // Bisa dihapus silang
                                noOptionsMessage={() => "Produk tidak ditemukan atau sudah ditambahkan"}
                            />
                        </div>

                        <button 
                            className="btn btn-primary px-4 d-flex align-items-center"
                            onClick={handleAddProduct}
                            disabled={!selectedOption}
                        >
                            <FiPlus className="me-2" /> Tambah
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatalogDetail;