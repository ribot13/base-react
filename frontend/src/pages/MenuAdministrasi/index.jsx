// src/pages/MenuAdministrasi/index.jsx
/* eslint-disable no-unused-vars */
import { APP_CONFIG } from "../../config/appConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import * as FiIcons from "react-icons/fi";
import Select from 'react-select'; 

const API_URL = `${APP_CONFIG.API_BASE_URL}/menu`;

// --- HELPER 1: MEMBERSIHKAN DATA FORM ---
const cleanFormData = (data) => {
  const cleaned = { ...data };
  for (const key in cleaned) {
    if (cleaned[key] === null || cleaned[key] === "") {
      if (
        key === "path" ||
        key === "required_permission" ||
        key === "parent_id"
      ) {
        cleaned[key] = null;
      } else if (
        !["title", "order_index", "is_active", "show_in_menu"].includes(key)
      ) {
        delete cleaned[key];
      }
    }
  }
  
  if (cleaned.parent_id === null || cleaned.parent_id === '') {
     cleaned.parent_id = null;
  } else {
     cleaned.parent_id = parseInt(cleaned.parent_id);
  }
  if (cleaned.order_index) cleaned.order_index = parseInt(cleaned.order_index);
  return cleaned;
};

// --- HELPER 2: FLATTEN MENU TREE UNTUK DROPDOWN ---
const flattenMenuTree = (menus, depth = 0, result = []) => {
  if (!menus || !Array.isArray(menus)) return result;

  menus.forEach(menu => {
    const indentUnit = '\u00A0\u00A0\u00A0\u00A0'; 
    let prefix = '';
    
    if (depth > 0) {
        prefix = '— '.repeat(depth);
        prefix = '\u00A0\u00A0' + prefix; 
    }
    
    result.push({
      value: menu.id, 
      label: menu.title, 
      level: depth,
      isGroup: menu.Children && menu.Children.length > 0 
    });

    if (menu.Children && menu.Children.length > 0) {
      flattenMenuTree(menu.Children, depth + 1, result);
    }
  });
  return result;
};


// --- HELPER 3: MENGHITUNG ORDER INDEX BERIKUTNYA (BARU) ---
const getNextOrderIndex = (currentMenus, newParentId) => {
    let siblings = [];

    // Fungsi rekursif untuk mencari parent dan mengambil anak-anaknya (Tidak berubah)
    const extractSiblings = (nodes, targetId) => {
        if (!nodes) return false;
        for (const node of nodes) {
            if (node.id === targetId) {
                siblings = node.Children || [];
                return true;
            }
            if (node.Children && extractSiblings(node.Children, targetId)) {
                return true; 
            }
        }
        return false;
    };

    // A. Kasus: Root Menu (parent_id = null) - LOGIC BATAS ADMIN DI SINI
    if (newParentId === null || newParentId === "") {
        siblings = currentMenus; 
        
        let adminCeilingIndex = Infinity; // Nilai batas awal yang sangat tinggi
        let maxIndexExcludingAdmin = 0;   // Index terbesar dari menu NON-ADMIN

        // 1. Iterasi semua menu root untuk mencari Ceiling dan Max Non-Admin
        siblings.forEach(rootNode => {
            const title = rootNode.title ? rootNode.title.toLowerCase() : '';
            
            // Jika kita menemukan menu administrasi (index tinggi atau mengandung keyword)
            if (rootNode.order_index >= 900 || title.includes('administrasi') || title.includes('admin')) {
                 if (rootNode.order_index < adminCeilingIndex) {
                    // Temukan index terkecil yang merupakan menu Admin
                    adminCeilingIndex = rootNode.order_index;
                 }
            } else {
                 // Hitung Max Index dari menu yang bukan Admin/Settings
                 if (rootNode.order_index > maxIndexExcludingAdmin) {
                     maxIndexExcludingAdmin = rootNode.order_index;
                 }
            }
        });
        
        let nextIndex = maxIndexExcludingAdmin + 1;
        
        // 2. Safety Check: Pastikan index baru tidak melebihi atau menyentuh index Admin
        if (nextIndex >= adminCeilingIndex) {
             // Jika sudah padat, kembalikan 1 unit di bawah batas Admin terendah.
             console.warn("Root menu sudah penuh! Menempatkan index satu unit di bawah batas admin.");
             return adminCeilingIndex === Infinity ? nextIndex : adminCeilingIndex - 1;
        }

        return nextIndex;
    } 
    
    // B. Kasus: Nested Menu (Simple maxIndex + 1 - TIDAK ADA CEILING)
    else {
        extractSiblings(currentMenus, newParentId);
        
        const maxIndex = siblings.reduce((max, item) => 
            (item.order_index > max ? item.order_index : max), 0
        );
        return maxIndex + 1;
    }
};


const MenuAdmin = () => {
  const [menus, setMenus] = useState([]);
  const [flatMenuOptions, setFlatMenuOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const initialFormState = {
    id: null,
    title: "",
    path: "",
    icon_name: "",
    required_permission: "",
    parent_id: "", 
    order_index: 0,
    is_active: true,
    show_in_menu: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- FETCH DATA ---
  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      let menuData = Array.isArray(response.data)
        ? response.data
        : response.data.menu || [];

      setMenus(menuData);

      const flattened = flattenMenuTree(menuData);
      setFlatMenuOptions(flattened);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handler untuk React-Select (saat Parent Menu dipilih)
  const handleSelectChange = (selectedOption) => {
    // ID baru (null jika Root Menu dipilih)
    const newParentId = selectedOption ? selectedOption.value : null;
    
    // Hitung Order Index berikutnya berdasarkan parent baru
    const nextOrder = getNextOrderIndex(menus, newParentId);

    setFormData((prev) => ({
      ...prev,
      parent_id: newParentId,
      // Selalu update order index ke nilai MAX+1 dari grup yang baru
      order_index: nextOrder,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = cleanFormData(formData);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isEdit) {
        await axios.put(`${API_URL}/${formData.id}`, payload, config);
        toast.success("Menu berhasil diupdate");
      } else {
        await axios.post(API_URL, payload, config);
        toast.success("Menu berhasil dibuat");
      }

      setShowModal(false);
      fetchMenus(); // Refresh data
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleEdit = (menu) => {
    setIsEdit(true);
    setFormData({
      id: menu.id,
      title: menu.title,
      path: menu.path || "",
      icon_name: menu.icon_name || "",
      required_permission: menu.required_permission || "",
      parent_id: menu.parent_id || "",
      order_index: menu.order_index || 0,
      is_active: menu.is_active,
      show_in_menu: menu.show_in_menu,
    });
    setShowModal(true);
  };

  // ... (handleDelete dan openAddModal) ...
  const handleDelete = async (id) => {
    if (
      !window.confirm("Yakin ingin menghapus menu ini? Sub-menu juga akan terhapus.")
    )
      return;
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Menu dihapus");
      fetchMenus();
    } catch (error) {
      toast.error("Gagal menghapus menu");
    }
  };

  const openAddModal = () => {
    const defaultParentId = null; // Default: Root Menu
    const nextOrder = getNextOrderIndex(menus, defaultParentId); // Hitung order untuk Root

    setIsEdit(false);
    setFormData({
        ...initialFormState,
        order_index: nextOrder, // 💡 SET ORDER INDEX AWAL
    });
    setShowModal(true);
  };
  
  // Ambil opsi yang saat ini dipilih
  const selectedParent = flatMenuOptions.find(opt => opt.value === formData.parent_id) || null;
  const rootOption = { value: null, label: "-- Root Menu (Menu Utama) --", level: -1 };
  const allOptions = [rootOption, ...flatMenuOptions];


  // --- RENDER REKURSIF UNTUK TABEL (Tidak Berubah) ---
  const renderTableRows = (items, depth = 0) => {
    if (!items || !items.length) return null;

    return items.map((item) => (
      <React.Fragment key={item.id}>
        <tr>
          <td>
            {/* Indentasi visual di tabel */}
            <div
              style={{
                paddingLeft: `${depth * 30}px`,
                display: "flex",
                alignItems: "center",
              }}
            >
              {depth > 0 && (
                <span style={{ color: "#ccc", marginRight: "5px" }}>└─ </span>
              )}
              {item.icon_name && FiIcons[item.icon_name]
                ? React.createElement(FiIcons[item.icon_name], {
                    className: "me-2",
                  })
                : null}
              <span style={{ fontWeight: depth === 0 ? "bold" : "normal" }}>
                {item.title}
              </span>
            </div>
          </td>
          <td>
            <small className="text-muted">{item.path || "-"}</small>
          </td>
          <td>
            {item.required_permission ? (
              <span className="badge bg-secondary">
                {item.required_permission}
              </span>
            ) : (
              "-"
            )}
          </td>
          <td>{item.order_index}</td>
          <td>
            {item.is_active ? (
              <span className="badge bg-success">Aktif</span>
            ) : (
              <span className="badge bg-danger">Nonaktif</span>
            )}
          </td>
          <td>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleEdit(item)}
              >
                <FiIcons.FiEdit2 />
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(item.id)}
              >
                <FiIcons.FiTrash2 />
              </button>
            </div>
          </td>
        </tr>
        {/* Render Anak (Rekursif) */}
        {item.Children &&
          item.Children.length > 0 &&
          renderTableRows(item.Children, depth + 1)}
      </React.Fragment>
    ));
  };


  return (
    <div className="container-fluid p-4">
      {/* ... (Header dan Tabel Menu) ... */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Manajemen Menu</h3>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FiIcons.FiPlus className="me-2" /> Tambah Menu
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: "30%" }}>Title</th>
                  <th>Path</th>
                  <th>Permission</th>
                  <th>Urutan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  renderTableRows(menus)
                )}
                {!loading && menus.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      Belum ada data menu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {/* MODAL FORM */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEdit ? "Edit Menu" : "Tambah Menu Baru"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* TITLE */}
                  <div className="mb-3">
                    <label className="form-label">Judul Menu</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* PARENT ID (MENGGUNAKAN REACT-SELECT) */}
                  <div className="mb-3">
                    <label className="form-label">Parent Menu (Cari)</label>
                    <Select
                        options={allOptions}
                        value={selectedParent}
                        onChange={handleSelectChange}
                        isClearable
                        placeholder="Cari Menu Utama atau Submenu..."
                        
                        formatOptionLabel={(option) => {
                            if (option.level === -1) {
                                return <div style={{ color: '#6c757d', fontStyle: 'italic' }}>{option.label}</div>;
                            }
                            
                            const paddingLeft = option.level * 15;
                            const prefix = option.level > 0 ? '— '.repeat(option.level) : '';
                            
                            return (
                                <div 
                                    style={{ 
                                        paddingLeft: `${paddingLeft}px`,
                                        fontWeight: option.level === 0 ? 'bold' : 'normal',
                                        opacity: Number(option.value) === Number(formData.id) ? 0.5 : 1
                                    }}
                                >
                                    {prefix}{option.label}
                                </div>
                            );
                        }}
                        isOptionDisabled={(option) => Number(option.value) === Number(formData.id)}
                    />
                    <small className="text-muted">Gunakan kolom cari untuk mempercepat pencarian.</small>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Path URL</label>
                      <input
                        type="text"
                        className="form-control"
                        name="path"
                        value={formData.path}
                        onChange={handleInputChange}
                        placeholder="/contoh"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Icon (Feather Name)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="icon_name"
                        value={formData.icon_name}
                        onChange={handleInputChange}
                        placeholder="FiHome, FiUsers..."
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Permission Required</label>
                    <input
                      type="text"
                      className="form-control"
                      name="required_permission"
                      value={formData.required_permission}
                      onChange={handleInputChange}
                      placeholder="user.view"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Urutan</label>
                      <input
                        type="number"
                        className="form-control"
                        name="order_index"
                        value={formData.order_index}
                        onChange={handleInputChange}
                      />
                      <small className="text-muted">Nilai otomatis: {formData.order_index}</small>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Tampil di Sidebar?</label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="show_in_menu"
                          checked={formData.show_in_menu}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Status Aktif</label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuAdmin;