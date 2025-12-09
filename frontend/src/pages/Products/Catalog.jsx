/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// ./src/pages/Products/Catalog.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
// Asumsi file ini sudah ada (atau perlu dibuat) dan berisi fungsi API CRUD
import { fetchCatalogs, deleteCatalog } from "../../services/catalog.service"; 

const CatalogList = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [catalogs, setCatalogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadCatalogs = async () => {
        setLoading(true);
        try {
            // Memanggil API GET ALL CATALOGS
            const data = await fetchCatalogs(token); 
            setCatalogs(data);
        } catch (error) {
            toast.error("Gagal memuat daftar katalog.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCatalogs();
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus katalog ini? Tindakan ini tidak dapat dibatalkan.")) {
            return;
        }
        try {
            await deleteCatalog(token, id); // Memanggil API DELETE
            toast.success("Katalog berhasil dihapus.");
            loadCatalogs(); // Muat ulang daftar
        } catch (error) {
            toast.error(error.message || "Gagal menghapus katalog.");
        }
    };

    if (loading) {
        return <div className="text-center p-5">Memuat data...</div>;
    }

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h4 className="m-0 fw-bold">Daftar Katalog Produk</h4>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/admin/products/catalogs/create")}
                >
                    <FiPlus className="me-2" /> Buat Katalog Baru
                </button>
            </div>

            <div className="card-panel">
                <table className="table table-striped table-hover small">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama Katalog</th>
                            <th>Deskripsi</th>
                            <th>Status</th>
                            <th>Jml Produk</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {catalogs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">Belum ada katalog yang dibuat.</td>
                            </tr>
                        ) : (
                            catalogs.map((catalog) => (
                                <tr key={catalog.id}>
                                    <td>{catalog.id}</td>
                                    <td>{catalog.name}</td>
                                    {/* Tampilkan 50 karakter pertama deskripsi */}
                                    <td>{catalog.description ? catalog.description.substring(0, 50) + '...' : '-'}</td> 
                                    <td>
                                        <span className={`badge ${catalog.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                            {catalog.status.toUpperCase()}
                                        </span>
                                    </td>
                                    {/* product_count diambil dari fungsi aggregate di Controller backend */}
                                    <td>{catalog.product_count || 0}</td> 
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-warning me-2"
                                            onClick={() => navigate(`/admin/products/catalogs/edit/${catalog.id}`)}
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(catalog.id)}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CatalogList;