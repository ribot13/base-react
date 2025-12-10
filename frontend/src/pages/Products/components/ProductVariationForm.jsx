import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiRefreshCw, FiSettings, FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext'; // Sesuaikan path context
import { uploadImage } from '../../../services/upload.service'; // Sesuaikan path upload service

// Terima props parentPrice dan parentSku
const ProductVariationForm = ({ onVariationsChange, initialData, parentPrice, parentSku }) => {
    const { token } = useAuth();
    const [groups, setGroups] = useState([]);
    const [variants, setVariants] = useState([]);

    // Validasi: Cek apakah Harga Jual dan SKU sudah diisi di parent
    // Kita anggap valid jika ada nilai (tidak 0 dan tidak string kosong)
    const isParentValid = Number(parentPrice) > 0 && parentSku && parentSku.trim() !== "";

    // Cek apakah tombol generate boleh muncul (Minimal 1 grup punya minimal 1 opsi)
    const canGenerate = groups.length > 0 && groups.some(g => g.options.length > 0);

    // Load data awal (Edit Mode)
    useEffect(() => {
        if (initialData && initialData.groups) {
            const mappedGroups = initialData.groups.map(g => ({
                name: g.name,
                options: g.Options.map(o => ({
                    name: o.name,
                    meta_type: o.meta_type,
                    meta_value: o.meta_value
                }))
            }));
            setGroups(mappedGroups);
            
            const mappedVariants = initialData.variants.map(v => ({
                ...v,
                combination: v.combination_json, 
                name_display: v.combination_json ? Object.values(v.combination_json).join(" / ") : "Varian"
            }));
            setVariants(mappedVariants);
        }
    }, [initialData]);

    // Update parent
    useEffect(() => {
        onVariationsChange({ variationGroups: groups, variants: variants });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groups, variants]);

    // --- LOGIC CRUD GROUP & OPTION ---
    const addGroup = () => {
        if (!isParentValid) {
            toast.warn("Mohon isi Harga Jual dan SKU Produk terlebih dahulu.");
            return;
        }
        setGroups([...groups, { name: '', options: [] }]);
    };
    
    const removeGroup = (idx) => {
        const newG = [...groups]; newG.splice(idx, 1); setGroups(newG);
    };

    const updateGroupName = (idx, val) => {
        const newG = [...groups]; newG[idx].name = val; setGroups(newG);
    };

    const addOption = (gIdx) => {
        const newG = [...groups];
        // Default meta_type text
        newG[gIdx].options.push({ name: '', meta_type: 'text', meta_value: '' });
        setGroups(newG);
    };

    const updateOption = (gIdx, oIdx, field, val) => {
        const newG = [...groups];
        newG[gIdx].options[oIdx][field] = val;
        setGroups(newG);
    };

    const removeOption = (gIdx, oIdx) => {
        const newG = [...groups];
        newG[gIdx].options.splice(oIdx, 1);
        setGroups(newG);
    };

    // --- PERBAIKAN 4: HANDLER UPLOAD GAMBAR OPSI ---
    const handleOptionImageUpload = async (e, gIdx, oIdx) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const toastId = toast.loading("Mengupload...");
            const res = await uploadImage(token, file);
            toast.dismiss(toastId);
            
            // Simpan URL gambar ke meta_value
            updateOption(gIdx, oIdx, 'meta_value', res.url);
            toast.success("Gambar opsi terupload");
        } catch (error) {
            toast.error("Gagal upload: " + error.message);
        }
    };

    // --- LOGIC GENERATE KOMBINASI ---
    const generateCombinations = () => {
        const validGroups = groups.filter(g => g.name.trim() !== '' && g.options.length > 0);
        
        const optionsArrays = validGroups.map(g => g.options);
        
        // Cartesian Product Recursive
        const cartesian = (args) => {
            const r = [], max = args.length - 1;
            function helper(arr, i) {
                for (let j = 0, l = args[i].length; j < l; j++) {
                    const a = arr.slice(0);
                    a.push(args[i][j]);
                    if (i === max) r.push(a);
                    else helper(a, i + 1);
                }
            }
            helper([], 0);
            return r;
        };

        const combinations = cartesian(optionsArrays);

        // eslint-disable-next-line no-unused-vars
        const newVariants = combinations.map((combo, idx) => {
            const combinationObj = {};
            const displayNames = [];
            // Generate SKU Otomatis: SKU_INDUK-OP1-OP2 (Contoh: KEMEJA-MERAH-XL)
            let autoSkuSuffix = ""; 

            combo.forEach((opt, i) => {
                const groupName = validGroups[i].name;
                combinationObj[groupName] = opt.name;
                displayNames.push(opt.name);
                autoSkuSuffix += `-${opt.name.toUpperCase().replace(/\s+/g, '')}`;
            });

            return {
                combination: combinationObj,
                name_display: displayNames.join(" / "),
                price: Number(parentPrice), // Default pakai harga induk
                stock: 0,
                // SKU Induk + Varian
                sku: `${parentSku}${autoSkuSuffix}`
            };
        });

        setVariants(newVariants);
        toast.success(`Berhasil generate ${newVariants.length} variasi!`);
    };

    const updateVariantRow = (idx, field, val) => {
        const newV = [...variants];
        newV[idx][field] = val;
        setVariants(newV);
    };

    return (
        <div className="card border shadow-sm mt-4">
            <div className="card-header bg-white py-3">
                <h6 className="m-0 fw-bold d-flex align-items-center">
                    <FiSettings className="me-2"/> Konfigurasi Variasi Produk
                </h6>
            </div>
            <div className="card-body">
                
                {/* VALIDASI PARENT MESSAGE */}
                {!isParentValid && (
                    <div className="alert alert-warning py-2 small mb-3">
                        <i className="bi bi-exclamation-circle me-2"></i>
                        Silakan isi <b>Harga Jual</b> dan <b>SKU</b> pada informasi produk di atas sebelum menambah variasi.
                    </div>
                )}

                {/* INPUT GROUP & OPSI */}
                {groups.map((group, gIdx) => (
                    <div key={gIdx} className="border rounded p-3 mb-3 bg-light position-relative">
                        <button 
                            type="button" 
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                            onClick={() => removeGroup(gIdx)}
                        >&times;</button>
                        
                        <div className="mb-2">
                            <label className="small fw-bold text-muted">Nama Variasi</label>
                            <input 
                                type="text" className="form-control form-control-sm fw-bold w-50"
                                value={group.name} 
                                onChange={(e) => updateGroupName(gIdx, e.target.value)}
                                placeholder="Contoh: Warna, Ukuran"
                            />
                        </div>

                        <div className="ms-3 ps-3 border-start border-3 border-secondary">
                            <label className="small fw-bold text-muted mb-2">Opsi Pilihan:</label>
                            {group.options.map((opt, oIdx) => (
                                <div key={oIdx} className="d-flex gap-2 mb-2 align-items-center flex-wrap">
                                    {/* Nama Opsi */}
                                    <input 
                                        type="text" className="form-control form-control-sm" style={{width: '150px'}}
                                        placeholder="Nama Opsi"
                                        value={opt.name} onChange={(e) => updateOption(gIdx, oIdx, 'name', e.target.value)}
                                    />
                                    
                                    {/* Tipe Selector */}
                                    <select 
                                        className="form-select form-select-sm" style={{width: '100px'}}
                                        value={opt.meta_type} onChange={(e) => updateOption(gIdx, oIdx, 'meta_type', e.target.value)}
                                    >
                                        <option value="text">Teks</option>
                                        <option value="color">Warna</option>
                                        <option value="image">Gambar</option>
                                    </select>

                                    {/* Value Input Berdasarkan Tipe */}
                                    {opt.meta_type === 'color' && (
                                        <input 
                                            type="color" className="form-control form-control-color form-control-sm"
                                            value={opt.meta_value || '#000000'} 
                                            onChange={(e) => updateOption(gIdx, oIdx, 'meta_value', e.target.value)}
                                        />
                                    )}

                                    {opt.meta_type === 'image' && (
                                        <div className="d-flex align-items-center gap-2">
                                            {opt.meta_value ? (
                                                <div className="position-relative border rounded" style={{width: 32, height: 32}}>
                                                    <img src={opt.meta_value} alt="Opsi" className="w-100 h-100 object-fit-cover"/>
                                                    <button 
                                                        type="button"
                                                        className="btn btn-xs btn-danger position-absolute top-0 end-0 p-0" 
                                                        style={{width:12, height:12, fontSize:8, lineHeight:1}}
                                                        onClick={() => updateOption(gIdx, oIdx, 'meta_value', '')}
                                                    >&times;</button>
                                                </div>
                                            ) : (
                                                <label className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-0" style={{height: 31}}>
                                                    <FiImage size={12}/> <span style={{fontSize: 10}}>Upload</span>
                                                    <input 
                                                        type="file" className="d-none" accept="image/*"
                                                        onChange={(e) => handleOptionImageUpload(e, gIdx, oIdx)}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    )}

                                    <button 
                                        type="button"
                                        className="btn btn-sm text-danger" 
                                        onClick={() => removeOption(gIdx, oIdx)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                            <button 
                                type="button"
                                className="btn btn-sm btn-link text-decoration-none px-0" 
                                onClick={() => addOption(gIdx)}
                            >
                                <FiPlus /> Tambah Opsi
                            </button>
                        </div>
                    </div>
                ))}

                <div className="d-flex gap-2 border-bottom pb-4 mb-4">
                    {/* TOMBOL TAMBAH GROUP (Disable jika parent invalid) */}
                    <button 
                        type="button"
                        className="btn btn-sm btn-outline-primary" 
                        onClick={addGroup}
                        disabled={!isParentValid}
                    >
                        <FiPlus /> Buat Group Baru
                    </button>
                    
                    {/* TOMBOL GENERATE (Sembunyi jika belum ada opsi) */}
                    {canGenerate && (
                        <button 
                            type="button"
                            className="btn btn-sm btn-success text-white" 
                            onClick={generateCombinations}
                        >
                            <FiRefreshCw /> Generate Kombinasi
                        </button>
                    )}
                </div>

                {/* TABEL HASIL GENERATE */}
                {variants.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-bordered table-sm small align-middle">
                            <thead className="table-light text-center">
                                <tr>
                                    <th>Varian</th>
                                    <th width="25%">Harga (Rp)</th>
                                    <th width="15%">Stok</th>
                                    <th width="25%">SKU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {variants.map((variant, idx) => (
                                    <tr key={idx}>
                                        <td className="fw-bold text-primary px-3">
                                            {variant.name_display}
                                        </td>
                                        <td>
                                            <input 
                                                type="number" className="form-control form-control-sm text-end"
                                                value={variant.price} onChange={(e) => updateVariantRow(idx, 'price', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                type="number" className="form-control form-control-sm text-center"
                                                value={variant.stock} onChange={(e) => updateVariantRow(idx, 'stock', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                type="text" className="form-control form-control-sm"
                                                value={variant.sku} onChange={(e) => updateVariantRow(idx, 'sku', e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductVariationForm;