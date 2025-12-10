import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getStockHistory, adjustStock } from '../../../services/product.service';
import { useAuth } from '../../../context/AuthContext';

const StockHistoryTab = ({ productId, variants, onStockChange }) => {
    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State untuk Form Opname
    const [selectedVariant, setSelectedVariant] = useState("");
    const [actualStock, setActualStock] = useState("");
    const [note, setNote] = useState("");
    const [adjusting, setAdjusting] = useState(false);

    // Load History
    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await getStockHistory(token, productId);
            setHistory(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    // Handle Submit Opname
    const handleAdjustment = async (e) => {
        e.preventDefault();
        if (actualStock === "") return;

        if (!window.confirm("Apakah Anda yakin stok fisik sudah benar? Data stok akan ditimpa.")) return;

        setAdjusting(true);
        try {
            await adjustStock(token, productId, {
                variant_id: selectedVariant || null,
                actual_stock: Number(actualStock),
                note: note
            });
            
            toast.success("Stok berhasil dikoreksi!");
            setActualStock("");
            setNote("");
            loadHistory(); // Refresh tabel history
            if (onStockChange) onStockChange(); // Refresh data induk di parent
        } catch (err) {
            toast.error(err.message);
        } finally {
            setAdjusting(false);
        }
    };

    // Helper Format Tanggal
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="mt-4">
            {/* --- BAGIAN 1: FORM STOCK OPNAME --- */}
            <div className="card border-warning shadow-sm mb-4">
                <div className="card-header bg-warning bg-opacity-10 text-dark fw-bold">
                    <FiRefreshCw className="me-2"/> Stock Opname (Koreksi Stok)
                </div>
                <div className="card-body">
                    <form onSubmit={handleAdjustment} className="row g-3 align-items-end">
                        
                        {/* Pilih Varian (Jika ada) */}
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Pilih Varian / Produk</label>
                            <select 
                                className="form-select" 
                                value={selectedVariant} 
                                onChange={(e) => setSelectedVariant(e.target.value)}
                            >
                                {variants && variants.length > 0 ? (
                                    <>
                                        <option value="" disabled>-- Pilih Varian --</option>
                                        {variants.map(v => (
                                            <option key={v.id} value={v.id}>
                                                {v.sku} - {v.combination_json ? Object.values(v.combination_json).join('/') : 'Varian'} (Stok: {v.stock})
                                            </option>
                                        ))}
                                    </>
                                ) : (
                                    <option value="">Produk Utama (Tanpa Varian)</option>
                                )}
                            </select>
                        </div>

                        {/* Input Stok Fisik */}
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Stok Fisik (Actual)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                placeholder="0" 
                                value={actualStock}
                                onChange={(e) => setActualStock(e.target.value)}
                                min="0" required 
                            />
                        </div>

                        {/* Catatan */}
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Catatan</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Contoh: Selisih hitung, Rusak" 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        {/* Tombol Submit */}
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-primary w-100" disabled={adjusting}>
                                {adjusting ? "Processing..." : "Update Stok"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- BAGIAN 2: TABEL RIWAYAT --- */}
            <h6 className="fw-bold mb-3">Riwayat Pergerakan Stok</h6>
            <div className="table-responsive">
                <table className="table table-bordered table-hover small align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Tanggal</th>
                            <th>Item (SKU)</th>
                            <th>Tipe</th>
                            <th>Ref</th>
                            <th className="text-end">Masuk/Keluar</th>
                            <th className="text-end">Saldo Akhir</th>
                            <th>Catatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-3">Loading history...</td></tr>
                        ) : history.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-3">Belum ada riwayat stok.</td></tr>
                        ) : (
                            history.map(item => (
                                <tr key={item.id}>
                                    <td>{formatDate(item.createdAt)}</td>
                                    <td>
                                        {item.Variant ? (
                                            <span className="badge bg-light text-dark border">
                                                {item.Variant.sku}
                                            </span>
                                        ) : (
                                            <span className="badge bg-secondary">Produk Utama</span>
                                        )}
                                    </td>
                                    <td>
                                        {item.type === 'in' && <span className="badge bg-success">Masuk</span>}
                                        {item.type === 'out' && <span className="badge bg-danger">Keluar</span>}
                                        {item.type === 'adjustment' && <span className="badge bg-warning text-dark">Opname</span>}
                                    </td>
                                    <td>{item.reference_type} <small className="text-muted">#{item.reference_id || '-'}</small></td>
                                    
                                    <td className={`text-end fw-bold ${item.qty_change > 0 ? 'text-success' : 'text-danger'}`}>
                                        {item.qty_change > 0 ? `+${item.qty_change}` : item.qty_change}
                                    </td>
                                    
                                    <td className="text-end fw-bold">{item.balance_after}</td>
                                    <td className="text-muted fst-italic">{item.description || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockHistoryTab;