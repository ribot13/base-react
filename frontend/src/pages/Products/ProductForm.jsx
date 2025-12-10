/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiSave,
  FiArrowLeft,
  FiPlus,
  FiTrash,
  FiUpload,
  FiX,
  FiCheckCircle,
  FiRefreshCw, // Icon untuk tab Variasi/Stok
  FiBox,       // Icon untuk tab History
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import {
  createProduct,
  fetchProductById,
  updateProduct,
  //saveProductVariations, // Opsional jika mau save terpisah, tapi kita pakai logic gabungan
} from "../../services/product.service";
import {
  uploadImage,
  deleteImageFromServer,
} from "../../services/upload.service";
import {
  fetchCategories,
} from "../../services/product.category.service";

// IMPORT KOMPONEN TAB LAINNYA
import ProductVariationForm from "./components/ProductVariationForm";
import StockHistoryTab from "./components/StockHistoryTab";

import { APP_CONFIG } from "../../config/appConfig";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploadedFilesSession, setUploadedFilesSession] = useState([]);

  // --- STATE TAB NAVIGATION ---
  const [activeTab, setActiveTab] = useState("info"); // 'info', 'variation', 'stock'

  // State Utama Data Produk
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    description: "",
    visibility: "public",
    base_price: 0,
    sales_price: 0,
    max_price: 0,
    sku: "",
    stock_current: 0,
    stock_minimum: 0,
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    volumetric_weight: 0,
    is_preorder: false,
    po_process_time: 0,
    po_dp_requirement: "none",
    po_dp_type: "fixed",
    po_dp_value: 0,
    slug: "",
    seo_title: "",
    seo_description: "",
    images: [], // { image_path, is_main }
    wholesales: [], // { min_qty, price }
  });

  // State Data Variasi
  const [variationData, setVariationData] = useState({
    groups: [],   // Data Grup (Warna, Ukuran)
    variants: []  // Data SKU Akhir
  });

  // Load Data Awal
  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadProductData();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories(token);
      setCategories(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat kategori");
    }
  };

  const loadProductData = async () => {
    setLoading(true);
    try {
      const data = await fetchProductById(token, id);
      
      // Mapping data produk ke form
      setFormData({
        name: data.name,
        category_id: data.category_id || "",
        description: data.description || "",
        visibility: data.visibility,
        base_price: Number(data.base_price),
        sales_price: Number(data.sales_price),
        max_price: Number(data.max_price),
        sku: data.Stock?.sku || "",
        stock_current: data.Stock?.stock_current || 0,
        stock_minimum: data.Stock?.stock_minimum || 0,
        weight: data.weight,
        length: data.length,
        width: data.width,
        height: data.height,
        volumetric_weight: data.volumetric_weight,
        is_preorder: data.is_preorder,
        po_process_time: data.po_process_time,
        po_dp_requirement: data.po_dp_requirement,
        po_dp_type: data.po_dp_type,
        po_dp_value: data.po_dp_value,
        slug: data.slug,
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        images: data.Images || [],
        wholesales: data.Wholesales || [],
      });

      // Mapping data variasi untuk ProductVariationForm
      // Backend mengirim 'VariationGroups' dan 'Variants'
      if (data.VariationGroups || data.Variants) {
          setVariationData({
             groups: data.VariationGroups || [],
             variants: data.Variants || []
          });
      }

    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data produk");
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS FORM UTAMA ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- LOGIC IMAGE UPLOAD ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const toastId = toast.loading("Mengupload gambar...");
    try {
      const newImages = [...formData.images];
      for (const file of files) {
        const response = await uploadImage(token, file);
        newImages.push({ image_path: response.url, is_main: newImages.length === 0 });
        
        // Simpan path session utk cleanup jika batal simpan (opsional)
        setUploadedFilesSession((prev) => [...prev, response.url]);
      }
      setFormData((prev) => ({ ...prev, images: newImages }));
      toast.dismiss(toastId);
      toast.success("Gambar berhasil diupload");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message);
    }
  };

  const handleRemoveImage = async (index) => {
    const imageToRemove = formData.images[index];
    
    // Hapus dari state visual dulu
    const newImages = formData.images.filter((_, i) => i !== index);
    
    // Jika main image dihapus, set yg pertama jadi main
    if (imageToRemove.is_main && newImages.length > 0) {
      newImages[0].is_main = true;
    }
    setFormData((prev) => ({ ...prev, images: newImages }));

    // Request hapus file fisik di server (cleanup)
    try {
        await deleteImageFromServer(token, imageToRemove.image_path);
    } catch (err) {
        console.error("Gagal hapus file fisik:", err);
    }
  };

  const setMainImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      is_main: i === index,
    }));
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  // --- LOGIC WHOLESALE ---
  const addWholesale = () => {
    setFormData((prev) => ({
      ...prev,
      wholesales: [...prev.wholesales, { min_qty: 0, price: 0 }],
    }));
  };
  const removeWholesale = (index) => {
    const newWs = formData.wholesales.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, wholesales: newWs }));
  };
  const updateWholesale = (index, field, value) => {
    const newWs = [...formData.wholesales];
    newWs[index][field] = value;
    setFormData((prev) => ({ ...prev, wholesales: newWs }));
  };

  // --- SUBMIT HANDLER (UTAMA) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. GABUNGKAN PAYLOAD: Data Produk + Data Variasi
      // Note: Di ProductVariationForm kita terima 'groups' dan 'variants' di state 'variationData'
      // Tapi controller kita (yg baru) mengharapkan key: 'variationGroups' dan 'variants'
      const payload = {
        ...formData,
        variationGroups: variationData.variationGroups || variationData.groups, // Handle beda penamaan state
        variants: variationData.variants
      };
      
      //console.log("FINAL PAYLOAD:", payload); // Debugging

      let productId = id;

      if (isEdit) {
        // --- UPDATE ---
        await updateProduct(token, id, payload);
        toast.success("Produk berhasil diperbarui!");
      } else {
        // --- CREATE ---
        await createProduct(token, payload);
        toast.success("Produk berhasil dibuat!");
      }
      navigate("/admin/products");

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Gagal menyimpan produk");
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk URL gambar
  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/150";
    if (path.startsWith("http")) return path;
    const baseUrl = APP_CONFIG.API_BASE_URL.replace("/api", "");
    return `${baseUrl}${path}`;
  };

  return (
    <div className="container-fluid p-0">
      
      {/* --- HEADER HALAMAN --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-secondary me-3"
            onClick={() => navigate("/admin/products")}
          >
            <FiArrowLeft />
          </button>
          <h4 className="fw-bold m-0">
            {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
          </h4>
        </div>
        <div className="d-flex gap-2">
           {/* Tombol Simpan Hanya Muncul di Tab Info atau Variasi */}
           {activeTab !== 'stock' && (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                <FiSave className="me-2" />
                {loading ? "Menyimpan..." : "Simpan Produk"}
              </button>
           )}
        </div>
      </div>

      {/* --- NAVIGASI TAB --- */}
      <div className="mb-4 border-bottom">
          <ul className="nav nav-tabs border-0">
             <li className="nav-item">
                <button 
                   className={`nav-link ${activeTab === 'info' ? 'active fw-bold border-bottom-0' : ''}`}
                   onClick={() => setActiveTab('info')}
                >
                   <FiCheckCircle className="me-2"/> Informasi Produk
                </button>
             </li>
             <li className="nav-item">
                <button 
                   className={`nav-link ${activeTab === 'variation' ? 'active fw-bold border-bottom-0' : ''}`}
                   onClick={() => setActiveTab('variation')}
                >
                   <FiRefreshCw className="me-2"/> Variasi & Pilihan
                </button>
             </li>
             {/* Tab Riwayat Stok hanya muncul saat EDIT MODE */}
             {isEdit && (
                 <li className="nav-item">
                    <button 
                       className={`nav-link ${activeTab === 'stock' ? 'active fw-bold border-bottom-0' : ''}`}
                       onClick={() => setActiveTab('stock')}
                    >
                       <FiBox className="me-2"/> Riwayat Stok
                    </button>
                 </li>
             )}
          </ul>
      </div>

      {/* ================================================================== */}
      {/* TAB CONTENT 1: INFORMASI PRODUK (FORM UTAMA)                       */}
      {/* ================================================================== */}
      <div className={activeTab === 'info' ? 'd-block' : 'd-none'}>
        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* KOLOM KIRI (Info Utama) */}
            <div className="col-lg-8">
              {/* Card Informasi Dasar */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                  <h6 className="m-0 fw-bold">Informasi Dasar</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Nama Produk</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Contoh: Kemeja Flanel Kotak"
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Kategori</label>
                      <select
                        className="form-select"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                      >
                        <option value="">-- Pilih Kategori --</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Visibilitas</label>
                      <select
                        className="form-select"
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleChange}
                      >
                        <option value="public">Publik</option>
                        <option value="hidden">Tersembunyi</option>
                        <option value="link_only">Hanya Link</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Deskripsi</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Card Media (Gambar) */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                  <h6 className="m-0 fw-bold">Media Produk</h6>
                  <label className="btn btn-sm btn-outline-primary">
                    <FiUpload className="me-1" /> Upload Gambar
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="d-none"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <div className="card-body">
                  <div className="row g-2">
                    {formData.images.map((img, index) => (
                      <div className="col-6 col-md-3" key={index}>
                        <div className={`position-relative border rounded overflow-hidden ${img.is_main ? 'border-primary border-2' : ''}`} style={{ height: "120px" }}>
                          <img
                            src={getImageUrl(img.image_path)}
                            alt={`Upload ${index}`}
                            className="w-100 h-100 object-fit-cover"
                          />
                          <button
                            type="button"
                            className="btn btn-xs btn-danger position-absolute top-0 end-0 m-1"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <FiX />
                          </button>
                          {!img.is_main && (
                            <button
                              type="button"
                              className="btn btn-xs btn-light position-absolute bottom-0 start-0 m-1 opacity-75"
                              onClick={() => setMainImage(index)}
                              title="Jadikan Utama"
                            >
                              <FiCheckCircle />
                            </button>
                          )}
                          {img.is_main && (
                            <span className="badge bg-primary position-absolute bottom-0 start-0 m-1">Utama</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {formData.images.length === 0 && (
                      <div className="col-12 text-center text-muted py-4 border rounded bg-light">
                        Belum ada gambar yang diupload.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Harga Grosir */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                  <h6 className="m-0 fw-bold">Harga Grosir</h6>
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={addWholesale}>
                    <FiPlus /> Tambah
                  </button>
                </div>
                <div className="card-body">
                  {formData.wholesales.length === 0 ? (
                    <p className="text-muted small m-0">Tidak ada harga grosir diatur.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-borderless align-middle m-0">
                        <thead>
                          <tr className="text-muted small">
                            <th>Min. Qty</th>
                            <th>Harga Satuan</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.wholesales.map((ws, idx) => (
                            <tr key={idx}>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={ws.min_qty}
                                  onChange={(e) => updateWholesale(idx, "min_qty", e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={ws.price}
                                  onChange={(e) => updateWholesale(idx, "price", e.target.value)}
                                />
                              </td>
                              <td>
                                <button type="button" className="btn btn-sm text-danger" onClick={() => removeWholesale(idx)}>
                                  <FiTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* KOLOM KANAN (Harga, Stok, Pengiriman, SEO) */}
            <div className="col-lg-4">
              {/* Card Harga & Stok */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                  <h6 className="m-0 fw-bold">Harga & Stok (Utama)</h6>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <label className="form-label small">SKU (Kode Stok)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Harga Jual (Rp)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      name="sales_price"
                      value={formData.sales_price}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="row mb-2">
                    <div className="col-6">
                      <label className="form-label small">Harga Coret</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        name="base_price"
                        value={formData.base_price}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Modal (HPP)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        name="max_price"
                        value={formData.max_price}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  {/* Stok hanya bisa diedit di tab ini jika BUKAN mode edit dengan variasi */}
                  {/* Kalau mode edit, stok diatur lewat Tab Stok / Opname */}
                  <div className="row mb-2">
                    <div className="col-6">
                      <label className="form-label small">Stok Saat Ini</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        name="stock_current"
                        value={formData.stock_current}
                        onChange={handleChange}
                        disabled={isEdit} // Disable saat edit agar pakai Stock Opname
                        title={isEdit ? "Gunakan Tab Riwayat Stok untuk ubah stok" : ""}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Min. Stok</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        name="stock_minimum"
                        value={formData.stock_minimum}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  {isEdit && <small className="text-muted fst-italic" style={{fontSize: '10px'}}>*Gunakan Tab 'Riwayat Stok' untuk penyesuaian stok.</small>}
                </div>
              </div>

              {/* Card Pengiriman */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                  <h6 className="m-0 fw-bold">Pengiriman</h6>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <label className="form-label small">Berat (gram)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-4">
                      <label className="form-label small">P (cm)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        name="length"
                        value={formData.length}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small">L (cm)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        name="width"
                        value={formData.width}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small">T (cm)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card SEO */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                  <h6 className="m-0 fw-bold">SEO (Metadata)</h6>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <label className="form-label small">Judul Halaman</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      name="seo_title"
                      value={formData.seo_title}
                      onChange={handleChange}
                      placeholder="Default: Nama Produk"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Slug (URL)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="Auto-generated"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Meta Deskripsi</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      name="seo_description"
                      value={formData.seo_description}
                      onChange={handleChange}
                      placeholder="Default: Deskripsi Produk"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ================================================================== */}
      {/* TAB CONTENT 2: VARIASI & PILIHAN                                   */}
      {/* ================================================================== */}
      <div className={activeTab === 'variation' ? 'd-block' : 'd-none'}>
         <div className="card border-0 shadow-sm">
            <div className="card-body">
               <div className="alert alert-info py-2 small">
                  <FiCheckCircle className="me-2"/>
                  Atur variasi seperti warna dan ukuran di sini. Kombinasi SKU akan digenerate otomatis.
               </div>
               
               {/* Komponen Form Variasi */}
               <ProductVariationForm 
                  initialData={variationData} // Data dari backend (groups & variants)
                  onVariationsChange={(newData) => setVariationData(newData)} // Update state saat diedit
                  parentPrice={formData.sales_price}
                  parentSku={formData.sku}
               />
            </div>
         </div>
      </div>

      {/* ================================================================== */}
      {/* TAB CONTENT 3: RIWAYAT STOK (HANYA EDIT MODE)                      */}
      {/* ================================================================== */}
      {isEdit && (
         <div className={activeTab === 'stock' ? 'd-block' : 'd-none'}>
             <StockHistoryTab 
                 productId={id} 
                 variants={variationData.variants || []} // Kirim data varian untuk dropdown opname
                 onStockChange={() => loadProductData()} // Refresh data jika stok berubah
             />
         </div>
      )}

    </div>
  );
};

export default ProductForm;