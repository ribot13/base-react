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
  FiCircle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import {
  createProduct,
  fetchProductById,
  updateProduct,
  saveProductVariations,
  fetchProductVariations,
} from "../../services/product.service";
import {
  uploadImage,
  deleteImageFromServer,
} from "../../services/upload.service";
import {
  fetchCategories,
  fetchCategoryById,
} from "../../services/product.category.service";
import ProductVariationForm from "./components/ProductVariationForm";

import { APP_CONFIG } from "../../config/appConfig";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploadedFilesSession, setUploadedFilesSession] = useState([]);

  // State Utama
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
    wholesales: [], // Array [{min_qty, price}]
    images: [],
  });

  const [variationData, setVariationData] = useState({
    variationGroups: [],
    variants: [],
  });
  // State untuk data awal variasi (Edit Mode)
  const [initialVariationData, setInitialVariationData] = useState(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // 1. Ambil Data Kategori (untuk dropdown)
        const cats = await fetchCategories(token);
        setCategories(cats);

        // 2. Jika Mode Edit, Ambil Detail Produk
        if (isEdit) {
          const data = await fetchProductById(token, id);

          // 3. Masukkan data ke Form (Mapping Data)
          setFormData({
            name: data.name,
            category_id: data.category_id || "",
            description: data.description || "",
            visibility: data.visibility,

            // Harga
            // Pastikan dikonversi ke angka agar tidak error di input type="number"
            base_price: parseFloat(data.base_price) || 0,
            sales_price: parseFloat(data.sales_price) || 0,
            max_price: parseFloat(data.max_price) || 0,

            // Inventaris (Diambil dari relasi Stock)
            sku: data.Stock?.sku || "",
            stock_current: data.Stock?.stock_current || 0,
            stock_minimum: data.Stock?.stock_minimum || 0,

            // Dimensi
            weight: data.weight || 0,
            length: data.length || 0,
            width: data.width || 0,
            height: data.height || 0,
            volumetric_weight: data.volumetric_weight || 0,

            // Preorder
            is_preorder: data.is_preorder,
            po_process_time: data.po_process_time || 0,
            po_dp_requirement: data.po_dp_requirement || "none",
            po_dp_type: data.po_dp_type || "fixed",
            po_dp_value: parseFloat(data.po_dp_value) || 0,

            // SEO
            slug: data.slug || "",
            seo_title: data.seo_title || "",
            seo_description: data.seo_description || "",

            // Array (Grosir & Gambar)
            // Pastikan Wholesales dan Images ada di include controller backend
            wholesales: data.Wholesales || [],
            images: data.Images || [],
          });

          try {
            const varData = await fetchProductVariations(token, id);
            if (varData && varData.groups.length > 0) {
              setInitialVariationData(varData);
            }
          } catch (err) {
            console.log("Belum ada variasi atau gagal load variasi", err);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data produk: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, token, isEdit]);

  useEffect(() => {
    const loadCategoryDefaults = async () => {
      // Jalankan hanya jika category_id terpilih
      if (formData.category_id) {
        try {
          // Ambil data detail kategori berdasarkan ID
          const categoryData = await fetchCategoryById(
            token,
            formData.category_id
          );

          setFormData((prev) => ({
            ...prev,
            // AUTO FILL HARGA (Jika harga di form masih 0, gunakan default kategori)
            description:
              prev.description === ""
                ? categoryData.description
                : prev.description,
            base_price:
              Number(prev.base_price) === 0
                ? categoryData.default_base_price
                : prev.base_price,
            sales_price:
              Number(prev.sales_price) === 0
                ? categoryData.default_sales_price
                : prev.sales_price,
            max_price:
              Number(prev.max_price) === 0
                ? categoryData.default_max_price
                : prev.max_price,

            // AUTO FILL DIMENSI
            length:
              Number(prev.length) === 0
                ? categoryData.default_length
                : prev.length,
            width:
              Number(prev.width) === 0
                ? categoryData.default_width
                : prev.width,
            height:
              Number(prev.height) === 0
                ? categoryData.default_height
                : prev.height,
            weight:
              Number(prev.weight) === 0
                ? categoryData.default_weight
                : prev.weight,

            // Berat Volumetrik (Langsung ambil atau hitung ulang)
            volumetric_weight:
              Number(prev.volumetric_weight) === 0
                ? categoryData.default_volumetric_weight
                : prev.volumetric_weight,
          }));

          // Opsional: Beri notifikasi kecil (Toast)
          // toast.info("Harga dan Dimensi disesuaikan dengan kategori");
        } catch (error) {
          console.error("Gagal memuat default kategori", error);
        }
      }
    };

    loadCategoryDefaults();
  }, [formData.category_id, token]);

  // Handler yang dikirim ke child component
  const handleVariationsChange = (data) => {
    setVariationData(data);
  };

  // 1. Handle File Selection & Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // ... validasi size ...

    try {
      const res = await uploadImage(token, file);

      // Catat URL ini sebagai file baru session ini
      setUploadedFilesSession((prev) => [...prev, res.url]);

      const newImage = {
        image_path: res.url,
        is_main: formData.images.length === 0,
      };
      setFormData((prev) => ({ ...prev, images: [...prev.images, newImage] }));
      toast.success("Gambar terupload");
    } catch (error) {
      toast.error(error.message);
    } finally {
      e.target.value = null;
    }
  };

  // 2. Hapus Gambar
  const removeImage = async (index) => {
    const imageToDelete = formData.images[index];

    // Hapus dari state UI dulu agar responsif
    setFormData((prev) => {
      const newImages = [...prev.images];
      const wasMain = newImages[index].is_main;
      newImages.splice(index, 1);
      if (wasMain && newImages.length > 0) newImages[0].is_main = true;
      return { ...prev, images: newImages };
    });

    // Panggil API Hapus di background
    await deleteImageFromServer(token, imageToDelete.image_path);

    // Hapus juga dari tracking session jika ada
    setUploadedFilesSession((prev) =>
      prev.filter((url) => url !== imageToDelete.image_path)
    );
  };

  // 3. Set Gambar Utama
  const setMainImage = (index) => {
    setFormData((prev) => {
      const newImages = prev.images.map((img, i) => ({
        ...img,
        is_main: i === index, // Hanya index yang dipilih yang true
      }));
      return { ...prev, images: newImages };
    });
  };

  const handleCancel = async () => {
    if (uploadedFilesSession.length > 0) {
      const toastId = toast.loading("Membersihkan data...");
      // Hapus semua file baru secara paralel
      await Promise.all(
        uploadedFilesSession.map((url) => deleteImageFromServer(token, url))
      );
      toast.dismiss(toastId);
    }
    navigate("/admin/products");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  // Auto Volumetric
  useEffect(() => {
    const vol = (formData.length * formData.width * formData.height) / 6000;
    setFormData((prev) => ({ ...prev, volumetric_weight: Math.ceil(vol) }));
  }, [formData.length, formData.width, formData.height]);

  // Handle Wholesale Dynamic Fields
  const addWholesale = () =>
    setFormData((prev) => ({
      ...prev,
      wholesales: [...prev.wholesales, { min_qty: 1, price: 0 }],
    }));
  const removeWholesale = (idx) => {
    const newArr = [...formData.wholesales];
    newArr.splice(idx, 1);
    setFormData((prev) => ({ ...prev, wholesales: newArr }));
  };
  const changeWholesale = (idx, field, val) => {
    const newArr = [...formData.wholesales];
    newArr[idx][field] = val;
    setFormData((prev) => ({ ...prev, wholesales: newArr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Variation Data State:", variationData);
      // GABUNGKAN DATA: Form Data + Variation Data
      const payload = {
        ...formData, // Data produk, harga, gambar, dll
        variationGroups: variationData.variationGroups, // Data Group Variasi
        variants: variationData.variants // Data SKU Variasi
      };

      console.log("FINAL PAYLOAD:", payload);

      if (isEdit) {
        // --- MODE EDIT (Update) ---
        // Untuk update, logic-nya mungkin masih terpisah atau mau digabung juga terserah backend update-nya.
        // Asumsi saat ini kita hanya memperbaiki CREATE dulu.
        await updateProduct(token, id, payload); 
        
        // Jika mode edit, variasi mungkin perlu disimpan terpisah atau backend updateProduct juga harus diupdate.
        // Agar aman untuk EDIT, kita tetap panggil saveProductVariations terpisah jika backend update belum support transaction gabungan.
        if (variationData.variants && variationData.variants.length > 0) {
             await saveProductVariations(token, id, variationData);
        }

        toast.success("Produk berhasil diperbarui!");
      } else {
        // --- MODE BARU (CREATE) - SUDAH MENGGUNAKAN TRANSACTION ---
        // Kita kirim payload yang sudah berisi variasi.
        // Backend 'createProduct' yang baru akan menangani semuanya.
        await createProduct(token, payload);
        
        toast.success("Produk dan Variasi berhasil dibuat!");
      }

      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container-fluid p-0 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleCancel}
        >
          <FiArrowLeft /> Kembali
        </button>
        <h4 className="fw-bold m-0">
          {isEdit ? "Edit Produk" : "Produk Baru"}
        </h4>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <FiSave className="me-2" /> Simpan
        </button>
      </div>

      <div className="row g-4">
        {/* KOLOM KIRI: Info Utama */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Informasi Dasar</h6>
              <div className="mb-3">
                <label className="form-label">Nama Produk</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Deskripsi</label>
                <textarea
                  className="form-control"
                  rows="4"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          {/* --- AREA UPLOAD GAMBAR --- */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Gambar Produk</h6>

              {/* Tombol Upload */}
              <div className="mb-3">
                <label
                  className="btn btn-outline-primary w-100 p-3 border-dashed"
                  style={{ borderStyle: "dashed" }}
                >
                  <FiUpload size={24} className="mb-2 d-block mx-auto" />
                  <span>Klik untuk Upload Gambar</span>
                  <input
                    type="file"
                    className="d-none"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                  />
                </label>
                <small className="text-muted d-block text-center mt-2">
                  Maksimal 2MB. Format: JPG, PNG.
                </small>
              </div>

              {/* List Preview Gambar */}
              <div className="row g-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="col-4 col-md-3">
                    <div
                      className="position-relative border rounded overflow-hidden"
                      style={{ aspectRatio: "1/1" }}
                    >
                      {/* Gambar */}
                      <img
                        // Jika img.image_path path relatif (/uploads/...), tambahkan BASE URL
                        // Jika path absolut (http...), biarkan
                        src={
                          img.image_path.startsWith("http")
                            ? img.image_path
                            : `${APP_CONFIG.API_BASE_URL.replace("/api", "")}${
                                img.image_path
                              }`
                        }
                        alt={`Preview ${idx}`}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />

                      {/* Tombol Hapus (Pojok Kanan Atas) */}
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0 d-flex align-items-center justify-content-center"
                        style={{ width: 20, height: 20, borderRadius: "50%" }}
                        onClick={() => removeImage(idx)}
                      >
                        <FiX size={12} />
                      </button>

                      {/* Tombol Set Main (Bagian Bawah) */}
                      <button
                        type="button"
                        className={`btn btn-sm w-100 position-absolute bottom-0 start-0 rounded-0 ${
                          img.is_main ? "btn-success" : "btn-light opacity-75"
                        }`}
                        style={{ fontSize: "10px" }}
                        onClick={() => setMainImage(idx)}
                      >
                        {img.is_main ? (
                          <>
                            <FiCheckCircle className="me-1" /> Utama
                          </>
                        ) : (
                          <>
                            <FiCircle className="me-1" /> Jadikan Utama
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
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
                  <input
                    type="number"
                    className="form-control"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Harga Jual</label>
                  <input
                    type="number"
                    className="form-control"
                    name="sales_price"
                    value={formData.sales_price}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Harga Coret</label>
                  <input
                    type="number"
                    className="form-control"
                    name="max_price"
                    value={formData.max_price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label className="form-label fw-bold">Harga Grosir</label>
              {formData.wholesales.map((w, idx) => (
                <div key={idx} className="input-group mb-2">
                  <span className="input-group-text">Min Qty</span>
                  <input
                    type="number"
                    className="form-control"
                    value={w.min_qty}
                    onChange={(e) =>
                      changeWholesale(idx, "min_qty", e.target.value)
                    }
                  />
                  <span className="input-group-text">Harga</span>
                  <input
                    type="number"
                    className="form-control"
                    value={w.price}
                    onChange={(e) =>
                      changeWholesale(idx, "price", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeWholesale(idx)}
                  >
                    <FiTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-outline-primary mt-1"
                onClick={addWholesale}
              >
                <FiPlus /> Tambah Grosir
              </button>
            </div>
          </div>

          {/* Inventaris */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Inventaris</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    className="form-control"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Stok Saat Ini</label>
                  <input
                    type="number"
                    className="form-control"
                    name="stock_current"
                    value={formData.stock_current}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Stok Minimal</label>
                  <input
                    type="number"
                    className="form-control"
                    name="stock_minimum"
                    value={formData.stock_minimum}
                    onChange={handleChange}
                  />
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
                  <input
                    type="number"
                    className="form-control"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label">Panjang (cm)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label">Lebar (cm)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label">Tinggi (cm)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12">
                  <small className="text-muted">
                    Berat Volumetrik (Otomatis): {formData.volumetric_weight}{" "}
                    gram
                  </small>
                </div>
              </div>
            </div>
          </div>
          {/* Variasi */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="col-12">
                <ProductVariationForm
                  onVariationsChange={handleVariationsChange}
                  initialData={initialVariationData}
                  // --- PERBAIKAN 2: KIRIM DATA UNTUK VALIDASI ---
                  parentPrice={formData.sales_price} // Harga Jual
                  parentSku={formData.sku} // SKU Induk
                />
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
                <select
                  className="form-select"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                >
                  <option value="public">Public (Publik)</option>
                  <option value="hidden">Hidden (Sembunyi)</option>
                  <option value="link_only">Link Only</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Kategori</label>
                <select
                  className="form-select"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                >
                  <option value="">-- Uncategorized --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Preorder</h6>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="is_preorder"
                  checked={formData.is_preorder}
                  onChange={handleChange}
                />
                <label className="form-check-label">Aktifkan Preorder</label>
              </div>
              {formData.is_preorder && (
                <>
                  <div className="mb-2">
                    <label className="form-label small">
                      Waktu Proses (Hari)
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      name="po_process_time"
                      value={formData.po_process_time}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Kewajiban DP</label>
                    <select
                      className="form-select form-select-sm"
                      name="po_dp_requirement"
                      value={formData.po_dp_requirement}
                      onChange={handleChange}
                    >
                      <option value="none">Tidak Ada DP</option>
                      <option value="optional">Opsional</option>
                      <option value="mandatory">Wajib</option>
                    </select>
                  </div>
                  {formData.po_dp_requirement !== "none" && (
                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label small">Tipe DP</label>
                        <select
                          className="form-select form-select-sm"
                          name="po_dp_type"
                          value={formData.po_dp_type}
                          onChange={handleChange}
                        >
                          <option value="fixed">Nominal</option>
                          <option value="percentage">Persen</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label small">Nilai</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          name="po_dp_value"
                          value={formData.po_dp_value}
                          onChange={handleChange}
                        />
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
  );
};

export default ProductForm;
