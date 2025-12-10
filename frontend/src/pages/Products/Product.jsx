/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus, FiEdit, FiTrash2, FiEyeOff, FiLink, FiAlertCircle,
  FiChevronDown, FiChevronUp, FiBox,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { fetchProducts, deleteProduct } from "../../services/product.service";
import { APP_CONFIG } from "../../config/appConfig";

// Helper URL Gambar
const getImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/150?text=No+Img";
  if (path.startsWith("http")) return path;
  const baseUrl = APP_CONFIG.API_BASE_URL.replace("/api", "");
  return `${baseUrl}${path}`;
};

// Helper Format Rupiah
const formatRp = (num) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, }).format(num);

const ProductIndex = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts(token);
      setProducts(data);
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Hapus produk ini?")) {
      try {
        await deleteProduct(token, id);
        toast.success("Produk dihapus");
        loadData();
      } catch (err) { toast.error(err.message); }
    }
  };

  const toggleRow = (id) => {
    if (expandedRows.includes(id)) { setExpandedRows(expandedRows.filter((rowId) => rowId !== id)); } 
    else { setExpandedRows([...expandedRows, id]); }
  };

  const getProductDisplay = (p) => {
    const hasVariants = p.Variants && p.Variants.length > 0;
    if (hasVariants) {
      const prices = p.Variants.map((v) => Number(v.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const totalStock = p.Variants.reduce((a, b) => a + Number(b.stock), 0);
      return {
        isVariant: true,
        priceDisplay: minPrice === maxPrice ? formatRp(minPrice) : `${formatRp(minPrice)} - ${formatRp(maxPrice)}`,
        stockDisplay: totalStock,
        skuDisplay: p.Stock?.sku ? `${p.Stock.sku} (Varian)` : "Multi-SKU",
        stockStatus: totalStock <= 0 ? "Habis" : totalStock,
        isOutOfStock: totalStock === 0,
      };
    } else {
      const currentStock = p.Stock?.stock_current || 0;
      return {
        isVariant: false,
        priceDisplay: formatRp(p.sales_price),
        stockDisplay: currentStock,
        skuDisplay: p.Stock?.sku || "-",
        stockStatus: currentStock <= 0 ? "Habis" : currentStock,
        isOutOfStock: currentStock === 0,
      };
    }
  };

  // --- FITUR BARU: RENDER VISUAL VARIANT ---
  const renderVariantCombination = (product, combinationJson) => {
    if (!combinationJson) return "Varian";
    
    return Object.entries(combinationJson).map(([groupName, optionName], idx) => {
      // Cari metadata opsi ini di struktur VariationGroups produk
      let metaType = 'text';
      let metaValue = '';

      if (product.VariationGroups) {
        const group = product.VariationGroups.find(g => g.name === groupName);
        if (group && group.Options) {
            const option = group.Options.find(o => o.name === optionName);
            if (option) {
                metaType = option.meta_type;
                metaValue = option.meta_value;
            }
        }
      }

      return (
        <span key={idx} className="me-3 d-inline-flex align-items-center">
          <small className="text-muted me-1">{groupName}:</small>
          
          {/* Render Thumbnail Warna/Gambar */}
          {metaType === 'color' && metaValue && (
            <span 
              className="d-inline-block rounded-circle border me-1" 
              style={{width: 14, height: 14, backgroundColor: metaValue}}
              title={optionName}
            ></span>
          )}
          {metaType === 'image' && metaValue && (
             <img 
                src={getImageUrl(metaValue)} 
                alt={optionName}
                className="rounded me-1 border"
                style={{width: 16, height: 16, objectFit: 'cover'}}
             />
          )}

          <span className="fw-bold text-dark">{optionName}</span>
          {idx < Object.entries(combinationJson).length - 1 && <span className="mx-2 text-muted">/</span>}
        </span>
      );
    });
  };

  return (
    <div className="container-fluid p-0">
      <div className="card-panel">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <h4 className="fw-bold">Daftar Produk</h4>
          <button className="btn btn-primary" onClick={() => navigate("/admin/products/create")}>
            <FiPlus className="me-2" /> Tambah Produk
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: "5%" }}>Img</th>
                  <th>Nama Produk</th>
                  <th>SKU</th>
                  <th>Harga</th>
                  <th className="text-center">Stok</th>
                  <th className="text-center">Status</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? ( <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr> ) : products.length === 0 ? ( <tr><td colSpan="7" className="text-center py-4">Belum ada data produk.</td></tr> ) : (
                  products.map((p) => {
                    const display = getProductDisplay(p);
                    const isExpanded = expandedRows.includes(p.id);
                    return (
                      <React.Fragment key={p.id}>
                        <tr className={display.isOutOfStock ? "table-danger" : ""}>
                          <td>
                            <div style={{ width: 40, height: 40, background: "#eee", borderRadius: 4, overflow: "hidden", }} >
                              {p.Images && p.Images.length > 0 ? ( <img src={getImageUrl(p.Images[0]?.image_path)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", }} onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Error"; }} /> ) : ( <div className="d-flex align-items-center justify-content-center h-100 text-muted small"> Img </div> )}
                            </div>
                          </td>
                          <td>
                            <div className="fw-bold d-flex align-items-center">
                              {p.name}
                              {display.isOutOfStock && ( <span className="text-danger ms-2" title="Stok Habis"> <FiAlertCircle /> </span> )}
                            </div>
                            <small className="text-muted"> {p.Category?.name || "Uncategorized"} </small>
                          </td>
                          <td>{display.skuDisplay}</td>
                          <td className="text-primary fw-bold"> {display.priceDisplay} </td>
                          <td className="text-center">
                            {display.isOutOfStock ? ( <span className="badge bg-danger">Habis</span> ) : ( <span className="fw-bold text-dark"> {display.stockDisplay} </span> )}
                          </td>
                          <td className="text-center">
                            {p.visibility === "hidden" && ( <span className="badge bg-secondary"> <FiEyeOff /> Hidden </span> )}
                            {p.visibility === "link_only" && ( <span className="badge bg-info"> <FiLink /> Link Only </span> )}
                            {p.visibility === "public" && ( <span className="badge bg-success">Public</span> )}
                          </td>
                          <td className="text-end" style={{ minWidth: "140px" }}>
                            {display.isVariant && (
                              <button className={`btn btn-sm btn-light me-1 ${ isExpanded ? "btn-secondary" : "btn-outline-secondary" }`} onClick={() => toggleRow(p.id)} title="Lihat Variasi" >
                                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                              </button>
                            )}
                            <button className="btn btn-sm btn-light text-primary me-1" onClick={() => navigate(`/admin/products/edit/${p.id}`) } title="Edit" > <FiEdit /> </button>
                            <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(p.id)} title="Hapus" > <FiTrash2 /> </button>
                          </td>
                        </tr>

                        {/* BARIS ANAK (DETAIL VARIASI) */}
                        {isExpanded && display.isVariant && (
                          <tr className="bg-light">
                            <td colSpan="7" className="p-3">
                              <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white fw-bold small text-secondary d-flex align-items-center">
                                  <FiBox className="me-2" /> Detail Variasi:{" "} {p.name}
                                </div>
                                <div className="table-responsive">
                                  <table className="table table-sm table-borderless mb-0 small align-middle">
                                    <thead className="text-muted border-bottom">
                                      <tr>
                                        <th className="ps-4">Varian</th>
                                        <th>SKU</th>
                                        <th>Harga</th>
                                        <th>Stok</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {p.Variants.map((v) => (
                                          <tr key={v.id}>
                                            {/* PANGGIL FUNGSI RENDER VISUAL DI SINI */}
                                            <td className="ps-4">
                                                {renderVariantCombination(p, v.combination_json)}
                                            </td>
                                            <td className="text-muted"> {v.sku} </td>
                                            <td>{formatRp(v.price)}</td>
                                            <td> {Number(v.stock) === 0 ? ( <span className="text-danger fw-bold"> Habis </span> ) : ( `${v.stock} pcs` )} </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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