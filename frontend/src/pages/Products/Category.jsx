// frontend/src/pages/ProductCategory/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiRefreshCw, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
// Import fungsi baru
import { fetchCategories, deleteCategory, updateCategoryOrder } from '../../services/product.category.service';
import { buildCategoryTree } from './CategoryUtils'; 


// --- Komponen Rekursif untuk Node Kategori (Tree View) ---
const CategoryNode = ({ category, level, onEdit, onDelete, onMove, siblings }) => {
    
    // Tentukan posisi item dalam daftar siblings saat ini
    const currentIndex = siblings.findIndex(c => c.id === category.id);
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === siblings.length - 1;

    // Style indentasi untuk tampilan tree
    const indentStyle = { paddingLeft: `${level * 25}px` };

    const visibilityClass = category.visibility === 'public' ? 'text-success' : 'text-secondary';
    
    return (
        <>
            <tr className="category-row table-light">
                {/* 1. Kategori (Tree Indent) */}
                <td style={indentStyle}>
                    <span className="fw-bold">
                        {category.children.length > 0 ? '📁' : '•'} {category.name}
                    </span>
                </td>
                
                {/* 2. Slug */}
                <td className="text-muted small">{category.slug}</td>
                
                {/* 3. Visibilitas */}
                <td className="text-center">
                    <span className={`badge ${visibilityClass}`}>
                        {category.visibility}
                    </span>
                </td>
                
                {/* 4. Urutan & Panah (Order Controls) */}
                <td className="text-center">
                    {/* UP Button */}
                    <button 
                        className="btn btn-sm btn-outline-primary me-1" 
                        onClick={() => onMove(category, siblings[currentIndex - 1])}
                        disabled={isFirst}
                        title="Pindah ke Atas"
                    >
                        &uarr;
                    </button>
                    {/* DOWN Button */}
                    <button 
                        className="btn btn-sm btn-outline-primary" 
                        onClick={() => onMove(category, siblings[currentIndex + 1])}
                        disabled={isLast}
                        title="Pindah ke Bawah"
                    >
                        &darr;
                    </button>
                </td>
                
                {/* 5. Aksi */}
                <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                        <button className="btn-icon-sm border btn-secondary" onClick={() => onEdit(category.id)}>
                            <FiEdit size={16} />
                        </button>
                        <button className="btn-icon-sm border btn-danger" onClick={() => onDelete(category.id)}>
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                </td>
            </tr>
            
            {/* Render Children Recursively */}
            {category.children.map((child) => (
                <CategoryNode 
                    key={child.id} 
                    category={child} 
                    level={level + 1} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                    onMove={onMove}
                    siblings={category.children} // Pass children list as the new siblings
                />
            ))}
        </>
    );
};


// --- Halaman Utama ---
const ProductCategoryIndex = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [flatCategories, setFlatCategories] = useState([]);
    const [categoryTree, setCategoryTree] = useState([]); // State untuk tampilan Tree
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchCategories(token);
            setFlatCategories(data);
            setCategoryTree(buildCategoryTree(data)); // Konversi ke Tree
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Kategori Produk | MRW ERP";
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus kategori ini? Pastikan tidak ada sub-kategori.')) {
            try {
                await deleteCategory(token, id);
                toast.success('Kategori berhasil dihapus');
                loadData();
            } catch (error) {
                toast.error(error.message);
            }
        }
    };
    
    // --- Logika Perubahan Urutan ---
    const handleMove = async (category, siblingCategory) => {
        if (!siblingCategory) return;
        
        try {
            // Data untuk API: Tukar nilai order_index kedua kategori
            const payload = {
                categoryId: category.id,
                siblingId: siblingCategory.id,
                categoryOrder: siblingCategory.order_index, // Nilai yang ditukar
                siblingOrder: category.order_index          // Nilai yang ditukar
            };

            await updateCategoryOrder(token, payload);
            toast.success('Urutan berhasil diperbarui!');
            
            // Reload data dari API untuk update UI
            await loadData(); 
            
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="container-fluid p-0">
            <div className="card-panel">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <h4 className="m-0 fw-bold">Kategori Produk (Hierarki)</h4>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/product/category/new')}>
                        <FiPlus className="me-2" /> Tambah Kategori
                    </button>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>Total: <span className="text-primary fw-bold">{flatCategories.length}</span></div>
                    <button className="btn btn-outline-secondary btn-sm" onClick={loadData}>
                        <FiRefreshCw /> Refresh
                    </button>
                </div>

                <div className="table-responsive">
                    {loading ? (
                        <div className="text-center py-5"><FiLoader className="spin" size={30}/> Memuat...</div>
                    ) : (
                        <table className="data-table w-100 table-hover">
                            <thead>
                                <tr className="bg-light">
                                    <th>Nama Kategori & Hierarki</th>
                                    <th>Slug</th>
                                    <th className="text-center">Visibilitas</th>
                                    <th className="text-center" style={{width: '15%'}}>Urutan</th>
                                    <th className="text-center" style={{width: '10%'}}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Render Root Categories (Level 0) dan Childrennya secara rekursif */}
                                {categoryTree.length > 0 ? (
                                    categoryTree.map((cat) => (
                                        <CategoryNode
                                            key={cat.id} 
                                            category={cat} 
                                            level={0} 
                                            onEdit={(id) => navigate(`/admin/product/category/${id}`)} 
                                            onDelete={handleDelete}
                                            onMove={handleMove}
                                            siblings={categoryTree} // Root nodes adalah siblings
                                        />
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="text-center py-4">Belum ada data.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCategoryIndex;