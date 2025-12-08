// frontend/src/pages/Products/CategoryUtils.js

/**
 * Mengubah daftar kategori datar (flat list) menjadi struktur pohon (tree/hierarki).
 */
export const buildCategoryTree = (flatData, parentId = null) => {
    const tree = [];

    // Filter item yang sesuai dengan parentId saat ini.
    // Urutkan berdasarkan order_index.
    const items = flatData
        .filter(item => (item.parent_id === parentId) || (item.parent_id === null && parentId === null))
        .sort((a, b) => a.order_index - b.order_index);

    items.forEach(item => {
        // Cari anak-anaknya (rekursif)
        const children = buildCategoryTree(flatData, item.id);
        
        // Clone item dan tambahkan children
        const node = {
            ...item,
            children: children.length > 0 ? children : []
        };
        
        tree.push(node);
    });
    return tree;
};