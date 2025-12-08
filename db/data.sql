/*
 Navicat Premium Data Transfer

 Source Server         : Localhost on Root
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : mrw_erp

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 08/12/2025 21:42:04
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Records of catalog
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Records of menu_items
-- ----------------------------
BEGIN;
INSERT INTO `menu_items` (`id`, `title`, `path`, `required_permission`, `icon_name`, `parent_id`, `order_index`, `is_active`, `show_in_menu`, `created_at`, `updated_at`) VALUES (1, 'Pesanan', NULL, NULL, 'FiShoppingCart', NULL, 10, 1, 1, '2025-11-30 14:11:27', '2025-12-03 09:20:14'), (2, 'Laporan', NULL, 'read-report', 'FiBarChart2', NULL, 20, 1, 1, '2025-11-30 14:11:27', '2025-12-03 09:20:14'), (3, 'Pengaturan Sistem', '', 'manage-system', 'FiSettings', NULL, 100, 1, 1, '2025-11-30 14:11:27', '2025-12-03 09:20:14'), (4, 'Pesanan Baru', '/orders', 'read-order', 'FiShoppingBag', 1, 11, 1, 1, '2025-11-30 14:13:23', '2025-12-03 09:20:14'), (5, 'Pengiriman ', '/orders/shipping', 'read-order-shipping', 'FiTruck', 1, 12, 1, 1, '2025-11-30 14:14:30', '2025-12-03 09:20:14'), (7, 'Laporan Keuangan', '/reports/keuangan', 'read-report-keuangan', 'FiFileText', 2, 21, 1, 1, '2025-11-30 14:15:33', '2025-12-03 09:20:14'), (9, 'Administrasi Menu', '/admin/menu', 'manage-menu', 'FiList', 3, 101, 1, 1, '2025-11-30 19:58:35', '2025-12-03 09:20:14'), (10, 'Administrasi User', '/admin/users', 'manage-users', 'FiUsers', 3, 102, 1, 1, '2025-12-01 07:10:48', '2025-12-03 15:11:54'), (11, 'Riwayat Pesanan', '/orders/history', 'read-history', 'FiDatabase', 1, 13, 1, 1, '2025-12-02 12:17:29', '2025-12-03 09:20:14'), (12, 'Riwayat Posting', '/orders/posting-history', 'read-posting-history', 'FiArchive', 1, 13, 1, 1, '2025-12-02 12:20:23', '2025-12-03 09:20:14'), (13, 'Laporan Pesanan', '/reports/all', 'read-report', 'FiCircle', 2, 22, 1, 1, '2025-12-02 13:48:12', '2025-12-03 09:20:14'), (24, 'Produk', NULL, NULL, 'FiBox', NULL, 5, 1, 1, '2025-12-03 01:01:38', '2025-12-03 14:49:59'), (25, 'List Produk', '/admin/products', NULL, 'FiGift', 24, 1, 1, 1, '2025-12-03 01:04:13', '2025-12-08 09:01:16'), (29, 'Kategori', '/admin/products/category', NULL, 'FiGrid', 24, 2, 1, 1, '2025-12-03 14:49:56', '2025-12-08 08:11:04');
COMMIT;

-- ----------------------------
-- Records of permissions
-- ----------------------------
BEGIN;
INSERT INTO `permissions` (`id`, `name`) VALUES (25, 'approve-pembelian'), (15, 'approve-pinjaman'), (9, 'approve-simpanan'), (1, 'create-member'), (21, 'create-pembelian'), (17, 'create-penjualan'), (11, 'create-pinjaman'), (44, 'create-product'), (5, 'create-simpanan'), (27, 'create-user'), (4, 'delete-member'), (24, 'delete-pembelian'), (20, 'delete-penjualan'), (14, 'delete-pinjaman'), (46, 'delete-product'), (8, 'delete-simpanan'), (30, 'delete-user'), (37, 'manage-menu'), (31, 'manage-roles'), (36, 'manage-system'), (38, 'manage-users'), (41, 'read-history'), (2, 'read-member'), (39, 'read-order'), (40, 'read-order-shipping'), (22, 'read-pembelian'), (18, 'read-penjualan'), (12, 'read-pinjaman'), (42, 'read-posting-history'), (33, 'read-report'), (34, 'read-report-keuangan'), (35, 'read-report-member'), (6, 'read-simpanan'), (28, 'read-user'), (26, 'reject-pembelian'), (16, 'reject-pinjaman'), (10, 'reject-simpanan'), (3, 'update-member'), (23, 'update-pembelian'), (19, 'update-penjualan'), (13, 'update-pinjaman'), (45, 'update-product'), (7, 'update-simpanan'), (29, 'update-user'), (43, 'view-product');
COMMIT;

-- ----------------------------
-- Records of product_catalog
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Records of product_category
-- ----------------------------
BEGIN;
INSERT INTO `product_category` (`id`, `parent_id`, `name`, `slug`, `description`, `visibility`, `order_index`, `default_base_price`, `default_sales_price`, `default_max_price`, `default_length`, `default_height`, `default_width`, `default_weight`, `default_volumetric_weight`) VALUES (1, NULL, 'Tas Selempang', 'tas-selempang', 'tas selempang aja', 'public', 1, 0.00, 0.00, 0.00, 0, 0, 0, 0, 0), (2, NULL, 'Backpack/Ransel', 'backpack-ransel', 'Rasnel gendong', 'public', 2, 0.00, 0.00, 0.00, 0, 0, 0, 0, 0), (3, 1, 'Poke Reborn Series', 'poke-reborn-series', 'Tas selempang mini multifungsi', 'public', 3, 65000.00, 125000.00, 179000.00, 0, 0, 0, 0, 0), (4, 2, 'Kanke Series', 'kanke-series', 'Tas Ransel untuk sekolah', 'public', 1, 0.00, 0.00, 0.00, 0, 0, 0, 0, 0), (5, 2, 'Koda Series', 'koda-series', 'Tas ransel untuk kuliah/kerja', 'public', 2, 0.00, 0.00, 0.00, 0, 0, 0, 0, 0), (7, 1, 'Tenzo Series', 'tenzo-series', 'Tas selempang mini, bisa houlder juga', 'public', 2, 0.00, 0.00, 0.00, 0, 0, 0, 0, 0), (8, 1, 'Frio Series', 'frio-series', 'tas selempang multifungsi', 'public', 1, 115000.00, 195000.00, 249000.00, 28, 22, 12, 400, 1.23), (9, 1, 'Aluze Series', 'aluze-series', 'Tas selempang lagi pengganti quna', 'public', 4, 89000.00, 159000.00, 199000.00, 27, 24, 8, 350, 800), (10, 1, 'Tsuna Series', 'tsuna-series', 'Tas selempang besar', 'public', 5, 98500.00, 215000.00, 350000.00, 40, 28, 10, 450, 1.87), (11, 1, 'Nara Series', 'nara-series', '', 'public', 6, 78500.00, 149000.00, 179000.00, 24, 28, 6, 350, 0.67);
COMMIT;

-- ----------------------------
-- Records of product_images
-- ----------------------------
BEGIN;
INSERT INTO `product_images` (`id`, `product_id`, `image_path`, `is_main`, `order_index`) VALUES (1, 6, '/uploads/products/1765190585999-144703643.webp', 1, 0), (2, 6, '/uploads/products/1765190593659-555730727.jpg', 0, 0), (3, 7, '/uploads/products/1765201521606-308446878.webp', 1, 0);
COMMIT;

-- ----------------------------
-- Records of product_stocks
-- ----------------------------
BEGIN;
INSERT INTO `product_stocks` (`id`, `product_id`, `sku`, `stock_current`, `stock_minimum`, `stock_booked`) VALUES (2, 2, 'PK0001', 10, 5, 0), (6, 6, 'TS001', 5, 2, 0), (7, 7, 'NR001', 5, 5, 0);
COMMIT;

-- ----------------------------
-- Records of product_wholesale_prices
-- ----------------------------
BEGIN;
INSERT INTO `product_wholesale_prices` (`id`, `product_id`, `min_qty`, `price`) VALUES (2, 2, 3, 119000.00), (3, 2, 6, 114500.00);
COMMIT;

-- ----------------------------
-- Records of products
-- ----------------------------
BEGIN;
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `visibility`, `base_price`, `sales_price`, `max_price`, `is_preorder`, `po_process_time`, `po_dp_requirement`, `po_dp_type`, `po_dp_value`, `weight`, `length`, `width`, `height`, `volumetric_weight`, `seo_title`, `seo_description`, `created_at`, `updated_at`) VALUES (2, 3, 'Kala', 'kala', 'Tas Selempang mini untuk daily driver. Bisa naro hp', 'public', 78000.00, 125000.00, 149000.00, 0, 0, 'none', 'fixed', 0.00, 350, 24, 4, 12, 1, 'Kala', 'Tas Selempang mini untuk daily driver', '2025-12-08 10:11:02', '2025-12-08 10:20:47'), (6, 7, 'Almas', 'almas', 'Tas selempang mini bisa shoulder juga', 'public', 69000.00, 135000.00, 159000.00, 0, 0, 'none', 'fixed', 0.00, 250, 30, 5, 12, 1, 'Almas', 'Tas selempang mini bisa shoulder juga', '2025-12-08 10:46:02', '2025-12-08 10:46:02'), (7, 11, 'Agery', 'agery', 'Tas selempang yang bagus', 'public', 78500.00, 149000.00, 179000.00, 0, 0, 'none', 'fixed', 0.00, 350, 24, 6, 28, 1, 'Agery', 'Tas selempang yang bagus', '2025-12-08 13:46:00', '2025-12-08 13:46:00');
COMMIT;

-- ----------------------------
-- Records of role_permissions
-- ----------------------------
BEGIN;
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES (1, 1), (2, 1), (3, 1), (1, 2), (2, 2), (3, 2), (4, 2), (1, 3), (2, 3), (1, 4), (2, 4), (1, 5), (2, 5), (3, 5), (1, 6), (2, 6), (3, 6), (4, 6), (1, 7), (2, 7), (1, 8), (2, 8), (1, 9), (2, 9), (1, 10), (2, 10), (1, 11), (2, 11), (3, 11), (1, 12), (2, 12), (3, 12), (4, 12), (1, 13), (2, 13), (1, 14), (2, 14), (1, 15), (2, 15), (1, 16), (2, 16), (1, 17), (2, 17), (3, 17), (1, 18), (2, 18), (3, 18), (4, 18), (1, 19), (2, 19), (1, 20), (2, 20), (1, 21), (2, 21), (3, 21), (1, 22), (2, 22), (3, 22), (1, 23), (2, 23), (1, 24), (2, 24), (1, 25), (2, 25), (1, 26), (2, 26), (1, 27), (2, 27), (3, 27), (1, 28), (2, 28), (1, 29), (2, 29), (1, 30), (2, 30), (1, 31), (2, 31);
COMMIT;

-- ----------------------------
-- Records of roles
-- ----------------------------
BEGIN;
INSERT INTO `roles` (`id`, `name`, `description`, `level`, `_deleted`) VALUES (1, 'superadmin', 'Administrator penuh sistem', 4, 0), (2, 'admin', 'Administrator modul tertentu', 3, 0), (3, 'staff', 'Operator harian', 2, 0), (4, 'user', 'Anggota/Pengguna standar', 1, 0);
COMMIT;

-- ----------------------------
-- Records of user_permission
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Records of user_roles
-- ----------------------------
BEGIN;
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES (1, 1), (3, 2), (4, 3);
COMMIT;

-- ----------------------------
-- Records of users
-- ----------------------------
BEGIN;
INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `birthday`, `created_at`, `updated_at`, `is_active`, `_deleted`) VALUES (1, 'admin', '$2b$10$oqiMoHi5E45CTH3RdmbuJepLx3HsNffr0/A5jhv2hblISY405iCua', 'Saya Admin', 'saya.admin@gmail.com', '1980-07-13', '2025-11-17 02:52:42', '2025-12-08 21:40:27', 1, 0), (3, 'bambang13', '$2b$10$tAfkLQa.ydlkT1HGfxw/WeD/sRTGBOW6XXFxCy6gSM/gWp8NxsC4K', 'Bambang Petro Syamsudin', 'bamtro@gmail.com', NULL, '2025-11-17 10:23:11', '2025-12-08 21:39:49', 1, 0), (4, 'syiefa01', '$2b$10$9lQKdOQ9WEelWGwFgAN2c.AZSWccMvKBdSZus2drV3qcDY9mZdlGK', 'Syiefa Aja', 'syiefa@marawa.id', NULL, '2025-11-19 03:44:02', '2025-12-08 21:40:56', 1, 0);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
