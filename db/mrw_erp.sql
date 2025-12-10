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

 Date: 10/12/2025 09:06:51
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for catalog
-- ----------------------------
DROP TABLE IF EXISTS `catalog`;
CREATE TABLE `catalog`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'active',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of catalog
-- ----------------------------
INSERT INTO `catalog` VALUES (1, 'Summer Vibes', 'Katalog untuk produk-produk yang cocok di musim panas', 'active', '2025-12-09 02:24:04', '2025-12-09 02:24:04');
INSERT INTO `catalog` VALUES (2, 'Back To School', 'kembali ke sekolah yang mana itu sangat asyik', 'active', '2025-12-09 02:24:35', '2025-12-09 02:25:02');

-- ----------------------------
-- Table structure for menu_items
-- ----------------------------
DROP TABLE IF EXISTS `menu_items`;
CREATE TABLE `menu_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `required_permission` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `icon_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `parent_id` int NULL DEFAULT NULL,
  `order_index` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `show_in_menu` tinyint(1) NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `path_unique`(`path` ASC) USING BTREE,
  INDEX `parent_id`(`parent_id` ASC) USING BTREE,
  CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 31 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of menu_items
-- ----------------------------
INSERT INTO `menu_items` VALUES (1, 'Pesanan', NULL, NULL, 'FiShoppingCart', NULL, 10, 1, 1, '2025-11-30 14:11:27', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (2, 'Laporan', NULL, 'read-report', 'FiBarChart2', NULL, 20, 1, 1, '2025-11-30 14:11:27', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (3, 'Pengaturan Sistem', '', 'manage-system', 'FiSettings', NULL, 100, 1, 1, '2025-11-30 14:11:27', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (4, 'Pesanan Baru', '/orders', 'read-order', 'FiShoppingBag', 1, 11, 1, 1, '2025-11-30 14:13:23', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (5, 'Pengiriman ', '/orders/shipping', 'read-order-shipping', 'FiTruck', 1, 12, 1, 1, '2025-11-30 14:14:30', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (7, 'Laporan Keuangan', '/reports/keuangan', 'read-report-keuangan', 'FiFileText', 2, 21, 1, 1, '2025-11-30 14:15:33', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (9, 'Administrasi Menu', '/admin/menu', 'manage-menu', 'FiList', 3, 101, 1, 1, '2025-11-30 19:58:35', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (10, 'Administrasi User', '/admin/users', 'manage-users', 'FiUsers', 3, 102, 1, 1, '2025-12-01 07:10:48', '2025-12-03 15:11:54');
INSERT INTO `menu_items` VALUES (11, 'Riwayat Pesanan', '/orders/history', 'read-history', 'FiDatabase', 1, 13, 1, 1, '2025-12-02 12:17:29', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (12, 'Riwayat Posting', '/orders/posting-history', 'read-posting-history', 'FiArchive', 1, 13, 1, 1, '2025-12-02 12:20:23', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (13, 'Laporan Pesanan', '/reports/all', 'read-report', 'FiCircle', 2, 22, 1, 1, '2025-12-02 13:48:12', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (24, 'Produk', NULL, NULL, 'FiBox', NULL, 5, 1, 1, '2025-12-03 01:01:38', '2025-12-03 14:49:59');
INSERT INTO `menu_items` VALUES (25, 'List Produk', '/admin/products', NULL, 'FiGift', 24, 1, 1, 1, '2025-12-03 01:04:13', '2025-12-08 09:01:16');
INSERT INTO `menu_items` VALUES (29, 'Kategori', '/admin/products/category', NULL, 'FiGrid', 24, 2, 1, 1, '2025-12-03 14:49:56', '2025-12-08 08:11:04');
INSERT INTO `menu_items` VALUES (30, 'Katalog', '/admin/products/catalogs', NULL, 'FiLayers', 24, 3, 1, 1, '2025-12-09 00:21:01', '2025-12-09 00:21:01');

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_usper_name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 47 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of permissions
-- ----------------------------
INSERT INTO `permissions` VALUES (25, 'approve-pembelian');
INSERT INTO `permissions` VALUES (15, 'approve-pinjaman');
INSERT INTO `permissions` VALUES (9, 'approve-simpanan');
INSERT INTO `permissions` VALUES (1, 'create-member');
INSERT INTO `permissions` VALUES (21, 'create-pembelian');
INSERT INTO `permissions` VALUES (17, 'create-penjualan');
INSERT INTO `permissions` VALUES (11, 'create-pinjaman');
INSERT INTO `permissions` VALUES (44, 'create-product');
INSERT INTO `permissions` VALUES (5, 'create-simpanan');
INSERT INTO `permissions` VALUES (27, 'create-user');
INSERT INTO `permissions` VALUES (4, 'delete-member');
INSERT INTO `permissions` VALUES (24, 'delete-pembelian');
INSERT INTO `permissions` VALUES (20, 'delete-penjualan');
INSERT INTO `permissions` VALUES (14, 'delete-pinjaman');
INSERT INTO `permissions` VALUES (46, 'delete-product');
INSERT INTO `permissions` VALUES (8, 'delete-simpanan');
INSERT INTO `permissions` VALUES (30, 'delete-user');
INSERT INTO `permissions` VALUES (37, 'manage-menu');
INSERT INTO `permissions` VALUES (31, 'manage-roles');
INSERT INTO `permissions` VALUES (36, 'manage-system');
INSERT INTO `permissions` VALUES (38, 'manage-users');
INSERT INTO `permissions` VALUES (41, 'read-history');
INSERT INTO `permissions` VALUES (2, 'read-member');
INSERT INTO `permissions` VALUES (39, 'read-order');
INSERT INTO `permissions` VALUES (40, 'read-order-shipping');
INSERT INTO `permissions` VALUES (22, 'read-pembelian');
INSERT INTO `permissions` VALUES (18, 'read-penjualan');
INSERT INTO `permissions` VALUES (12, 'read-pinjaman');
INSERT INTO `permissions` VALUES (42, 'read-posting-history');
INSERT INTO `permissions` VALUES (33, 'read-report');
INSERT INTO `permissions` VALUES (34, 'read-report-keuangan');
INSERT INTO `permissions` VALUES (35, 'read-report-member');
INSERT INTO `permissions` VALUES (6, 'read-simpanan');
INSERT INTO `permissions` VALUES (28, 'read-user');
INSERT INTO `permissions` VALUES (26, 'reject-pembelian');
INSERT INTO `permissions` VALUES (16, 'reject-pinjaman');
INSERT INTO `permissions` VALUES (10, 'reject-simpanan');
INSERT INTO `permissions` VALUES (3, 'update-member');
INSERT INTO `permissions` VALUES (23, 'update-pembelian');
INSERT INTO `permissions` VALUES (19, 'update-penjualan');
INSERT INTO `permissions` VALUES (13, 'update-pinjaman');
INSERT INTO `permissions` VALUES (45, 'update-product');
INSERT INTO `permissions` VALUES (7, 'update-simpanan');
INSERT INTO `permissions` VALUES (29, 'update-user');
INSERT INTO `permissions` VALUES (43, 'view-product');

-- ----------------------------
-- Table structure for product_catalog
-- ----------------------------
DROP TABLE IF EXISTS `product_catalog`;
CREATE TABLE `product_catalog`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NULL DEFAULT NULL,
  `catalog_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_catalog
-- ----------------------------
INSERT INTO `product_catalog` VALUES (1, 7, 1);
INSERT INTO `product_catalog` VALUES (3, 2, 2);
INSERT INTO `product_catalog` VALUES (4, 6, 1);

-- ----------------------------
-- Table structure for product_category
-- ----------------------------
DROP TABLE IF EXISTS `product_category`;
CREATE TABLE `product_category`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `visibility` enum('public','hidden') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'public',
  `order_index` int NULL DEFAULT NULL,
  `default_base_price` decimal(15, 2) NULL DEFAULT 0.00,
  `default_sales_price` decimal(15, 2) NULL DEFAULT 0.00,
  `default_max_price` decimal(15, 2) NULL DEFAULT 0.00,
  `default_length` double NULL DEFAULT 0 COMMENT 'panjang (cm)',
  `default_height` double NULL DEFAULT 0 COMMENT 'tinggi (cm)',
  `default_width` double NULL DEFAULT 0 COMMENT 'lebar (cm)',
  `default_weight` double NULL DEFAULT 0 COMMENT 'berat (gram)',
  `default_volumetric_weight` double NULL DEFAULT 0 COMMENT 'berat volumetrik (kg)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_category
-- ----------------------------
INSERT INTO `product_category` VALUES (1, NULL, 'Tas Selempang', 'tas-selempang', 'tas selempang aja', 'public', 1, 0.00, 0.00, 0.00, 0, 0, 0, 0, 0);
INSERT INTO `product_category` VALUES (2, NULL, 'Backpack/Ransel', 'backpack-ransel', 'Rasnel gendong', 'public', 2, 0.00, 0.00, 0.00, 0, 0, 0, 0, 0);
INSERT INTO `product_category` VALUES (3, 1, 'Poke Reborn Series', 'poke-reborn-series', 'Tas selempang mini multifungsi', 'public', 3, 65000.00, 125000.00, 179000.00, 0, 0, 0, 0, 0);
INSERT INTO `product_category` VALUES (4, 2, 'Kanke Series', 'kanke-series', 'Tas Ransel untuk sekolah', 'public', 1, 0.00, 0.00, 0.00, 0, 0, 0, 0, 0);
INSERT INTO `product_category` VALUES (5, 2, 'Koda Series', 'koda-series', 'Tas ransel untuk kuliah/kerja', 'public', 2, 0.00, 0.00, 0.00, 0, 0, 0, 0, 0);
INSERT INTO `product_category` VALUES (7, 1, 'Tenzo Series', 'tenzo-series', 'Tas selempang mini, bisa houlder juga', 'public', 2, 0.00, 0.00, 0.00, 0, 0, 0, 0, 0);
INSERT INTO `product_category` VALUES (8, 1, 'Frio Series', 'frio-series', 'tas selempang multifungsi', 'public', 1, 115000.00, 195000.00, 249000.00, 28, 22, 12, 400, 1.23);
INSERT INTO `product_category` VALUES (9, 1, 'Aluze Series', 'aluze-series', 'Tas selempang lagi pengganti quna', 'public', 4, 89000.00, 159000.00, 199000.00, 27, 24, 8, 350, 800);
INSERT INTO `product_category` VALUES (10, 1, 'Tsuna Series', 'tsuna-series', 'Tas selempang besar', 'public', 5, 98500.00, 215000.00, 350000.00, 40, 28, 10, 450, 1.87);
INSERT INTO `product_category` VALUES (11, 1, 'Nara Series', 'nara-series', '', 'public', 6, 78500.00, 149000.00, 179000.00, 24, 28, 6, 350, 0.67);

-- ----------------------------
-- Table structure for product_images
-- ----------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_main` tinyint(1) NULL DEFAULT 0,
  `order_index` int NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_images
-- ----------------------------
INSERT INTO `product_images` VALUES (1, 6, '/uploads/products/1765190585999-144703643.webp', 1, 0);
INSERT INTO `product_images` VALUES (2, 6, '/uploads/products/1765190593659-555730727.jpg', 0, 0);
INSERT INTO `product_images` VALUES (3, 7, '/uploads/products/1765201521606-308446878.webp', 1, 0);

-- ----------------------------
-- Table structure for product_stocks
-- ----------------------------
DROP TABLE IF EXISTS `product_stocks`;
CREATE TABLE `product_stocks`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `stock_current` int NULL DEFAULT 0,
  `stock_minimum` int NULL DEFAULT 0,
  `stock_booked` int NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `product_stocks_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_stocks
-- ----------------------------
INSERT INTO `product_stocks` VALUES (2, 2, 'PK0001', 10, 5, 0);
INSERT INTO `product_stocks` VALUES (6, 6, 'TS001', 5, 2, 0);
INSERT INTO `product_stocks` VALUES (7, 7, 'NR001', 5, 5, 0);
INSERT INTO `product_stocks` VALUES (10, 10, 'PR000', 0, 0, 0);

-- ----------------------------
-- Table structure for product_variants
-- ----------------------------
DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `price` decimal(15, 2) NULL DEFAULT 0.00,
  `stock` int NULL DEFAULT 0,
  `combination_json` json NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_sku`(`sku` ASC) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `fk_pv_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_variants
-- ----------------------------

-- ----------------------------
-- Table structure for product_variation_groups
-- ----------------------------
DROP TABLE IF EXISTS `product_variation_groups`;
CREATE TABLE `product_variation_groups`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `fk_pvg_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_variation_groups
-- ----------------------------

-- ----------------------------
-- Table structure for product_variation_options
-- ----------------------------
DROP TABLE IF EXISTS `product_variation_options`;
CREATE TABLE `product_variation_options`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `meta_type` enum('text','color','image') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'text',
  `meta_value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `group_id`(`group_id` ASC) USING BTREE,
  CONSTRAINT `fk_pvo_group` FOREIGN KEY (`group_id`) REFERENCES `product_variation_groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_variation_options
-- ----------------------------

-- ----------------------------
-- Table structure for product_wholesale_prices
-- ----------------------------
DROP TABLE IF EXISTS `product_wholesale_prices`;
CREATE TABLE `product_wholesale_prices`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `min_qty` int NOT NULL,
  `price` decimal(15, 2) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `product_wholesale_prices_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_wholesale_prices
-- ----------------------------
INSERT INTO `product_wholesale_prices` VALUES (2, 2, 3, 119000.00);
INSERT INTO `product_wholesale_prices` VALUES (3, 2, 6, 114500.00);

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `visibility` enum('public','hidden','link_only') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'public',
  `base_price` decimal(15, 2) NULL DEFAULT 0.00,
  `sales_price` decimal(15, 2) NULL DEFAULT 0.00,
  `max_price` decimal(15, 2) NULL DEFAULT 0.00,
  `is_preorder` tinyint(1) NULL DEFAULT 0,
  `po_process_time` int NULL DEFAULT 0,
  `po_dp_requirement` enum('none','optional','mandatory') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'none',
  `po_dp_type` enum('fixed','percentage') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'fixed',
  `po_dp_value` decimal(15, 2) NULL DEFAULT 0.00,
  `weight` int NULL DEFAULT 0,
  `length` int NULL DEFAULT 0,
  `width` int NULL DEFAULT 0,
  `height` int NULL DEFAULT 0,
  `volumetric_weight` int NULL DEFAULT 0,
  `seo_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `seo_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `product_category` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (2, 3, 'Kala', 'kala', 'Tas Selempang mini untuk daily driver. Bisa naro hp', 'public', 78000.00, 125000.00, 149000.00, 0, 0, 'none', 'fixed', 0.00, 350, 24, 4, 12, 1, 'Kala', 'Tas Selempang mini untuk daily driver', '2025-12-08 10:11:02', '2025-12-08 10:20:47');
INSERT INTO `products` VALUES (6, 7, 'Almas', 'almas', 'Tas selempang mini bisa shoulder juga', 'public', 69000.00, 135000.00, 159000.00, 0, 0, 'none', 'fixed', 0.00, 250, 30, 5, 12, 1, 'Almas', 'Tas selempang mini bisa shoulder juga', '2025-12-08 10:46:02', '2025-12-08 10:46:02');
INSERT INTO `products` VALUES (7, 11, 'Agery', 'agery', 'Tas selempang yang bagus', 'public', 78500.00, 149000.00, 179000.00, 0, 0, 'none', 'fixed', 0.00, 350, 24, 6, 28, 1, 'Agery', 'Tas selempang yang bagus', '2025-12-08 13:46:00', '2025-12-09 07:37:54');
INSERT INTO `products` VALUES (10, 1, 'Poke Reborn Series', 'poke-reborn-series', 'tas selempang aja', 'public', 69000.00, 135000.00, 149000.00, 0, 0, 'none', 'fixed', 0.00, 300, 24, 4, 13, 1, 'Poke Reborn Series', 'tas selempang aja', '2025-12-09 10:39:53', '2025-12-09 10:39:53');

-- ----------------------------
-- Table structure for role_permissions
-- ----------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions`  (
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`) USING BTREE,
  INDEX `fk_urp_pid`(`permission_id` ASC) USING BTREE,
  CONSTRAINT `fk_urp_pid` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_urp_rid` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of role_permissions
-- ----------------------------
INSERT INTO `role_permissions` VALUES (1, 1);
INSERT INTO `role_permissions` VALUES (2, 1);
INSERT INTO `role_permissions` VALUES (3, 1);
INSERT INTO `role_permissions` VALUES (1, 2);
INSERT INTO `role_permissions` VALUES (2, 2);
INSERT INTO `role_permissions` VALUES (3, 2);
INSERT INTO `role_permissions` VALUES (4, 2);
INSERT INTO `role_permissions` VALUES (1, 3);
INSERT INTO `role_permissions` VALUES (2, 3);
INSERT INTO `role_permissions` VALUES (1, 4);
INSERT INTO `role_permissions` VALUES (2, 4);
INSERT INTO `role_permissions` VALUES (1, 5);
INSERT INTO `role_permissions` VALUES (2, 5);
INSERT INTO `role_permissions` VALUES (3, 5);
INSERT INTO `role_permissions` VALUES (1, 6);
INSERT INTO `role_permissions` VALUES (2, 6);
INSERT INTO `role_permissions` VALUES (3, 6);
INSERT INTO `role_permissions` VALUES (4, 6);
INSERT INTO `role_permissions` VALUES (1, 7);
INSERT INTO `role_permissions` VALUES (2, 7);
INSERT INTO `role_permissions` VALUES (1, 8);
INSERT INTO `role_permissions` VALUES (2, 8);
INSERT INTO `role_permissions` VALUES (1, 9);
INSERT INTO `role_permissions` VALUES (2, 9);
INSERT INTO `role_permissions` VALUES (1, 10);
INSERT INTO `role_permissions` VALUES (2, 10);
INSERT INTO `role_permissions` VALUES (1, 11);
INSERT INTO `role_permissions` VALUES (2, 11);
INSERT INTO `role_permissions` VALUES (3, 11);
INSERT INTO `role_permissions` VALUES (1, 12);
INSERT INTO `role_permissions` VALUES (2, 12);
INSERT INTO `role_permissions` VALUES (3, 12);
INSERT INTO `role_permissions` VALUES (4, 12);
INSERT INTO `role_permissions` VALUES (1, 13);
INSERT INTO `role_permissions` VALUES (2, 13);
INSERT INTO `role_permissions` VALUES (1, 14);
INSERT INTO `role_permissions` VALUES (2, 14);
INSERT INTO `role_permissions` VALUES (1, 15);
INSERT INTO `role_permissions` VALUES (2, 15);
INSERT INTO `role_permissions` VALUES (1, 16);
INSERT INTO `role_permissions` VALUES (2, 16);
INSERT INTO `role_permissions` VALUES (1, 17);
INSERT INTO `role_permissions` VALUES (2, 17);
INSERT INTO `role_permissions` VALUES (3, 17);
INSERT INTO `role_permissions` VALUES (1, 18);
INSERT INTO `role_permissions` VALUES (2, 18);
INSERT INTO `role_permissions` VALUES (3, 18);
INSERT INTO `role_permissions` VALUES (4, 18);
INSERT INTO `role_permissions` VALUES (1, 19);
INSERT INTO `role_permissions` VALUES (2, 19);
INSERT INTO `role_permissions` VALUES (1, 20);
INSERT INTO `role_permissions` VALUES (2, 20);
INSERT INTO `role_permissions` VALUES (1, 21);
INSERT INTO `role_permissions` VALUES (2, 21);
INSERT INTO `role_permissions` VALUES (3, 21);
INSERT INTO `role_permissions` VALUES (1, 22);
INSERT INTO `role_permissions` VALUES (2, 22);
INSERT INTO `role_permissions` VALUES (3, 22);
INSERT INTO `role_permissions` VALUES (1, 23);
INSERT INTO `role_permissions` VALUES (2, 23);
INSERT INTO `role_permissions` VALUES (1, 24);
INSERT INTO `role_permissions` VALUES (2, 24);
INSERT INTO `role_permissions` VALUES (1, 25);
INSERT INTO `role_permissions` VALUES (2, 25);
INSERT INTO `role_permissions` VALUES (1, 26);
INSERT INTO `role_permissions` VALUES (2, 26);
INSERT INTO `role_permissions` VALUES (1, 27);
INSERT INTO `role_permissions` VALUES (2, 27);
INSERT INTO `role_permissions` VALUES (3, 27);
INSERT INTO `role_permissions` VALUES (1, 28);
INSERT INTO `role_permissions` VALUES (2, 28);
INSERT INTO `role_permissions` VALUES (1, 29);
INSERT INTO `role_permissions` VALUES (2, 29);
INSERT INTO `role_permissions` VALUES (1, 30);
INSERT INTO `role_permissions` VALUES (2, 30);
INSERT INTO `role_permissions` VALUES (1, 31);
INSERT INTO `role_permissions` VALUES (2, 31);

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `level` tinyint(1) NULL DEFAULT NULL,
  `_deleted` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'superadmin', 'Administrator penuh sistem', 4, 0);
INSERT INTO `roles` VALUES (2, 'admin', 'Administrator modul tertentu', 3, 0);
INSERT INTO `roles` VALUES (3, 'staff', 'Operator harian', 2, 0);
INSERT INTO `roles` VALUES (4, 'user', 'Anggota/Pengguna standar', 1, 0);

-- ----------------------------
-- Table structure for user_permission
-- ----------------------------
DROP TABLE IF EXISTS `user_permission`;
CREATE TABLE `user_permission`  (
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `type` enum('allow','deny') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`user_id`, `permission_id`) USING BTREE,
  INDEX `fk_ur_rid`(`permission_id` ASC) USING BTREE,
  CONSTRAINT `fk_ur_rid` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_ur_uid` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_permission
-- ----------------------------

-- ----------------------------
-- Table structure for user_roles
-- ----------------------------
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles`  (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`) USING BTREE,
  INDEX `fk_urole_rid`(`role_id` ASC) USING BTREE,
  CONSTRAINT `fk_urole_rid` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_urole_uid` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_roles
-- ----------------------------
INSERT INTO `user_roles` VALUES (1, 1);
INSERT INTO `user_roles` VALUES (3, 2);
INSERT INTO `user_roles` VALUES (4, 3);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `email` varchar(72) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `birthday` date NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 0,
  `_deleted` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '$2b$10$oqiMoHi5E45CTH3RdmbuJepLx3HsNffr0/A5jhv2hblISY405iCua', 'Saya Admin', 'saya.admin@gmail.com', '1980-07-13', '2025-11-17 02:52:42', '2025-12-08 21:40:27', 1, 0);
INSERT INTO `users` VALUES (3, 'bambang13', '$2b$10$tAfkLQa.ydlkT1HGfxw/WeD/sRTGBOW6XXFxCy6gSM/gWp8NxsC4K', 'Bambang Petro Syamsudin', 'bamtro@gmail.com', NULL, '2025-11-17 10:23:11', '2025-12-08 21:39:49', 1, 0);
INSERT INTO `users` VALUES (4, 'syiefa01', '$2b$10$9lQKdOQ9WEelWGwFgAN2c.AZSWccMvKBdSZus2drV3qcDY9mZdlGK', 'Syiefa Aja', 'syiefa@marawa.id', NULL, '2025-11-19 03:44:02', '2025-12-08 21:40:56', 1, 0);

SET FOREIGN_KEY_CHECKS = 1;
