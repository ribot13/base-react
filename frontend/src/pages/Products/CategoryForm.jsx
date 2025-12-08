/* eslint-disable no-unused-vars */
// frontend/src/pages/Products/CategoryForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import {
  createCategory,
  fetchCategoryById,
  updateCategory,
  fetchCategories,
} from "../../services/product.category.service";

const ProductCategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEditMode = id && id !== "new";

  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent_id: "",
    description: "",
    visibility: "public",
    order_index: 0,
    default_base_price: 0,
    default_sales_price: 0,
    default_max_price: 0,
    default_length: 0,
    default_width: 0,
    default_height: 0,
    default_weight: 0,
    default_volumetric_weight: 0,
  });

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // Load daftar parent (semua kategori)
        const allCategories = await fetchCategories(token);
        // Filter agar saat edit tidak memilih dirinya sendiri sebagai parent
        const validParents = isEditMode
          ? allCategories.filter((c) => c.id !== parseInt(id))
          : allCategories;
        setParents(validParents);

        if (isEditMode) {
          const data = await fetchCategoryById(token, id);
          setFormData({
            name: data.name,
            slug: data.slug || "",
            parent_id: data.parent_id || "",
            description: data.description || "",
            visibility: data.visibility,
            order_index: data.order_index,
            default_base_price: data.default_base_price || 0,
            default_sales_price: data.default_sales_price || 0,
            default_max_price: data.default_max_price || 0,
            default_length: data.default_length || 0,
            default_width: data.default_width || 0,
            default_height: data.default_height || 0,
            default_weight: data.default_weight || 0,
            default_volumetric_weight: data.default_volumetric_weight || 0,
          });
        }
      } catch (error) {
        toast.error("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, token, isEditMode]);

  useEffect(() => {
    const calculateVolumetric = () => {
      // Ambil nilai dimensi, default ke 0 jika kosong/invalid
      const length = parseFloat(formData.default_length) || 0;
      const width = parseFloat(formData.default_width) || 0;
      const height = parseFloat(formData.default_height) || 0;

      // Rumus: (P x L x T) / 6000
      const volWeight = (length * width * height) / 6000;

      // Update state volumetric weight (dibulatkan 2 desimal agar rapi)
      setFormData((prev) => ({
        ...prev,
        default_volumetric_weight: volWeight.toFixed(2)
      }));
    };

    calculateVolumetric();
  }, [formData.default_length, formData.default_width, formData.default_height]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        await updateCategory(token, id, formData);
        toast.success("Kategori berhasil diperbarui");
      } else {
        await createCategory(token, formData);
        toast.success("Kategori berhasil dibuat");
      }
      navigate("/admin/products/category");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="card-panel">
        <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
          <button
            className="btn btn-outline-secondary btn-sm me-3"
            onClick={() => navigate("/admin/products/category")}
          >
            <FiArrowLeft />
          </button>
          <h4 className="m-0 fw-bold">
            {isEditMode ? "Edit Kategori" : "Buat Kategori Baru"}
          </h4>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold small">
                Nama Kategori <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small">
                Slug (Opsional)
              </label>
              <input
                type="text"
                className="form-control"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="Auto-generate jika kosong"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small">
                Induk Kategori (Parent)
              </label>
              <select
                className="form-select"
                name="parent_id"
                value={formData.parent_id}
                onChange={handleChange}
              >
                <option value="">-- Root (Tanpa Parent) --</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-bold small">Visibilitas</label>
              <select
                className="form-select"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
              >
                <option value="public">Public</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-bold small">Urutan</label>
              <input
                type="number"
                className="form-control"
                name="order_index"
                value={formData.order_index}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold small">Deskripsi</label>
              <textarea
                className="form-control"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold small">
                Harga Modal (Base)
              </label>
              <div className="input-group">
                <span className="input-group-text">Rp</span>
                <input
                  type="number"
                  className="form-control"
                  name="default_base_price"
                  value={formData.default_base_price}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold small text-primary">
                Harga Jual (Sales)
              </label>
              <div className="input-group">
                <span className="input-group-text">Rp</span>
                <input
                  type="number"
                  className="form-control"
                  name="default_sales_price"
                  value={formData.default_sales_price}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold small text-danger">
                Harga Coret (Max)
              </label>
              <div className="input-group">
                <span className="input-group-text">Rp</span>
                <input
                  type="number"
                  className="form-control"
                  name="default_max_price"
                  value={formData.default_max_price}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold small">
                Panjang
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  name="default_length"
                  value={formData.default_length}
                  onChange={handleChange}
                  min="0"
                />
                <span className="input-group-text">Cm</span>
              </div>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold small">
                Lebar
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  name="default_width"
                  value={formData.default_width}
                  onChange={handleChange}
                  min="0"
                />
                <span className="input-group-text">Cm</span>
              </div>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold small">
                Tinggi
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  name="default_height"
                  value={formData.default_height}
                  onChange={handleChange}
                  min="0"
                />
                <span className="input-group-text">Cm</span>
              </div>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold small">
                Berat
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  name="default_weight"
                  value={formData.default_weight}
                  onChange={handleChange}
                  min="0"
                />
                <span className="input-group-text">Gr</span>
              </div>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold small text-info">
                Berat Volumetrik
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control bg-light" // Tambah bg-light visual readOnly
                  name="default_volumetric_weight"
                  value={formData.default_volumetric_weight}
                  readOnly // Agar user tidak manual edit (karena otomatis)
                />
                {/* GANTI DARI Gr KE Kg SESUAI REQUEST */}
                <span className="input-group-text">Kg</span> 
              </div>
              <small className="text-muted" style={{fontSize: '10px'}}>
                (P x L x T) / 6000
              </small>
            </div>

          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/admin/products/category")}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <FiSave className="me-2" /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCategoryForm;
