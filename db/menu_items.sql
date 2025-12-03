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

 Date: 03/12/2025 09:30:04
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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
) ENGINE = InnoDB AUTO_INCREMENT = 29 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

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
INSERT INTO `menu_items` VALUES (10, 'Administrasi User', '/admin/users', 'manage-users', 'FiUsers', 3, 102, 1, 1, '2025-12-01 07:10:48', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (11, 'Riwayat Pesanan', '/orders/history', 'read-history', 'FiDatabase', 1, 13, 1, 1, '2025-12-02 12:17:29', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (12, 'Riwayat Posting', '/orders/posting-history', 'read-posting-history', 'FiArchive', 1, 13, 1, 1, '2025-12-02 12:20:23', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (13, 'Laporan Pesanan', '/reports/all', 'read-report', 'FiCircle', 2, 22, 1, 1, '2025-12-02 13:48:12', '2025-12-03 09:20:14');
INSERT INTO `menu_items` VALUES (24, 'Produk', NULL, 'view-product', 'FiBox', NULL, 5, 1, 1, '2025-12-03 01:01:38', '2025-12-03 01:01:38');
INSERT INTO `menu_items` VALUES (25, 'List Produk', '/product', 'view-product', 'FiGift', 24, 1, 1, 1, '2025-12-03 01:04:13', '2025-12-03 01:04:13');
INSERT INTO `menu_items` VALUES (26, 'Tambah Produk', '/product/create', 'create-product', NULL, 24, 0, 1, 0, '2025-12-03 09:27:43', '2025-12-03 09:28:53');
INSERT INTO `menu_items` VALUES (27, 'Edit Produk', '/product/edit/:id', 'update-product', NULL, 24, 0, 1, 0, '2025-12-03 09:28:12', '2025-12-03 09:29:51');
INSERT INTO `menu_items` VALUES (28, 'Delete Produk', '/product/delete/:id', 'delete-product', NULL, 24, 0, 1, 0, '2025-12-03 09:28:36', '2025-12-03 09:29:04');

SET FOREIGN_KEY_CHECKS = 1;
