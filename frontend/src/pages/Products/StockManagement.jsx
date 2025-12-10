/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/pages/Products/StockManagement.jsx
import React, { useState, useEffect } from "react";
import { FiRefreshCw, FiSearch, FiEdit3 } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
// Asumsi fungsi ini ada di product.service atau Anda buat file service terpisah
import {
  getInventoryList,
  adjustInlineStock,
} from "../../services/product.service";

// Nama komponen disesuaikan menjadi StockManagement
const StockManagement = () => {
  const { token, user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk inline editing
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editMethod, setEditMethod] = useState("add"); // 'add', 'subtract', 'set'
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Load Data Inventaris
  const loadInventory = async (search = "") => {
    setLoading(true);
    try {
      // Mengirim parameter pencarian
      const params = search ? { search } : {};
      const data = await getInventoryList(token, params);
      setInventory(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Hanya jalankan jika token sudah ada
    if (token) {
      loadInventory();
    }
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadInventory(searchQuery);
  };

  // --- LOGIC INLINE EDITING ---
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValue("");
    setEditMethod("add");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleAdjust = async (item) => {
    if (!editValue || isNaN(Number(editValue))) {
      return toast.error("Nilai perubahan harus berupa angka.");
    }

    setIsAdjusting(true);
    const numericValue = Number(editValue);
    const currentStock = Number(item.current_stock);
    let finalStock = currentStock;

    // Hitung stok baru secara visual (hanya untuk pengecekan negatif)
    if (editMethod === "add") finalStock = currentStock + numericValue;
    if (editMethod === "subtract") finalStock = currentStock - numericValue;
    if (editMethod === "set") finalStock = numericValue;

    if (finalStock < 0) {
      setIsAdjusting(false);
      return toast.error("Stok hasil tidak boleh minus!");
    }

    // Pengecekan agar tidak update jika set value sama persis dengan current stock
    if (editMethod === "set" && finalStock === currentStock) {
      setIsAdjusting(false);
      cancelEdit();
      return toast.info("Stok tidak berubah.");
    }

    try {
      const response = await adjustInlineStock(token, {
        product_id: item.product_id,
        variant_id: item.variant_id,
        current_stock: currentStock,
        method: editMethod,
        value: numericValue,
        description: `Update dari halaman Stok Management`,
      });

      // Update state lokal dengan stok baru dari server
      setInventory((prev) =>
        prev.map((inv) =>
          inv.id === item.id
            ? { ...inv, current_stock: response.new_stock }
            : inv
        )
      );

      toast.success(
        `Stok ${item.name} berhasil diperbarui. Perubahan: ${
          response.change > 0 ? "+" : ""
        }${response.change}`
      );
      cancelEdit();
    } catch (error) {
      toast.error("Gagal update: " + error.message);
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="card-panel">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <h4 className="fw-bold">Manajemen Stok Inline</h4>
          <button
            className="btn btn-secondary"
            onClick={() => loadInventory(searchQuery)}
            disabled={loading}
          >
            <FiRefreshCw className="me-2" /> Refresh Data
          </button>
        </div>

        {/* Search & Filter */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Cari nama produk atau SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              <FiSearch />
            </button>
          </div>
        </form>

        {/* Tabel Inventaris */}
        <div className="table-responsive">
          <table className="table table-hover align-middle table-sm">
            <thead className="bg-light">
              <tr>
                <th width="5%">#</th>
                <th>Nama Produk / Varian</th>
                <th width="15%">SKU</th>
                <th width="10%" className="text-center">
                  Stok Saat Ini
                </th>
                <th width="40%">Update Stok Cepat</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : inventory.length > 0 ? (
                inventory.map((item, index) => {
                  const isEditing = editingId === item.id;
                  const isOutOfStock = item.current_stock <= 0;
                  return (
                    <tr
                      key={item.id}
                      className={isOutOfStock ? "table-danger" : ""}
                    >
                      <td>{index + 1}</td>
                      <td className={item.is_variant ? "ps-4" : "fw-bold"}>
                        {item.name}
                        {item.is_variant && (
                          <span className="small text-muted d-block fst-italic">
                            ({item.parent_name})
                          </span>
                        )}
                      </td>
                      <td>{item.sku}</td>
                      <td className="text-center fw-bold">
                        <span
                          className={`badge ${
                            isOutOfStock ? "bg-danger" : "bg-success"
                          }`}
                        >
                          {item.current_stock}
                        </span>
                      </td>

                      {/* Kolom Inline Edit */}
                      <td>
                        {isEditing ? (
                          <div className="d-flex align-items-center gap-2">
                            {/* Pilihan Metode */}
                            <select
                              className="form-select form-select-sm"
                              style={{ width: "120px" }}
                              value={editMethod}
                              onChange={(e) => setEditMethod(e.target.value)}
                              disabled={isAdjusting}
                            >
                              <option value="add">Tambah (+)</option>
                              <option value="subtract">Kurangi (-)</option>
                              <option value="set">Setel (=)</option>
                            </select>

                            {/* Input Nilai */}
                            <input
                              type="number"
                              className="form-control form-control-sm text-end"
                              style={{ width: "100px" }}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="Qty"
                              min={0}
                              disabled={isAdjusting}
                            />

                            {/* Tombol Aksi */}
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleAdjust(item)}
                              disabled={isAdjusting || !editValue}
                            >
                              {isAdjusting ? "..." : "Simpan"}
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={cancelEdit}
                              disabled={isAdjusting}
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => startEdit(item)}
                          >
                            <FiEdit3 className="me-1" /> Edit Stok
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Tidak ada data inventaris ditemukan.
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

export default StockManagement;
