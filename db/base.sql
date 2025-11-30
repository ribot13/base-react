/*
 Navicat Premium Data Transfer

 Source Server         : Localhost on Root
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : mrw_retail

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 30/11/2025 10:44:06
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for menu_items
-- ----------------------------
DROP TABLE IF EXISTS `menu_items`;
CREATE TABLE `menu_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `required_permission` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `icon_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `order_index` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `path_unique`(`path` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of menu_items
-- ----------------------------

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_usper_name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 33 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

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
INSERT INTO `permissions` VALUES (5, 'create-simpanan');
INSERT INTO `permissions` VALUES (27, 'create-user');
INSERT INTO `permissions` VALUES (4, 'delete-member');
INSERT INTO `permissions` VALUES (24, 'delete-pembelian');
INSERT INTO `permissions` VALUES (20, 'delete-penjualan');
INSERT INTO `permissions` VALUES (14, 'delete-pinjaman');
INSERT INTO `permissions` VALUES (8, 'delete-simpanan');
INSERT INTO `permissions` VALUES (30, 'delete-user');
INSERT INTO `permissions` VALUES (31, 'manage-roles');
INSERT INTO `permissions` VALUES (2, 'read-member');
INSERT INTO `permissions` VALUES (22, 'read-pembelian');
INSERT INTO `permissions` VALUES (18, 'read-penjualan');
INSERT INTO `permissions` VALUES (12, 'read-pinjaman');
INSERT INTO `permissions` VALUES (6, 'read-simpanan');
INSERT INTO `permissions` VALUES (28, 'read-user');
INSERT INTO `permissions` VALUES (26, 'reject-pembelian');
INSERT INTO `permissions` VALUES (16, 'reject-pinjaman');
INSERT INTO `permissions` VALUES (10, 'reject-simpanan');
INSERT INTO `permissions` VALUES (3, 'update-member');
INSERT INTO `permissions` VALUES (23, 'update-pembelian');
INSERT INTO `permissions` VALUES (19, 'update-penjualan');
INSERT INTO `permissions` VALUES (13, 'update-pinjaman');
INSERT INTO `permissions` VALUES (7, 'update-simpanan');
INSERT INTO `permissions` VALUES (29, 'update-user');

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

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
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'superadmin', 'Administrator penuh sistem');
INSERT INTO `roles` VALUES (2, 'admin', 'Administrator modul tertentu');
INSERT INTO `roles` VALUES (3, 'staff', 'Operator harian');
INSERT INTO `roles` VALUES (4, 'user', 'Anggota/Pengguna standar');

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

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
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '$2b$10$nTN1rcDz44VUBx1egX1h/OpefnnoDq7rRKtjavugb3RudapdBUoVK', 'Arie K Ramdhani', 'ak.ramdhani@gmail.com', '1980-07-13', '2025-11-17 02:52:42', NULL, 1, 0);
INSERT INTO `users` VALUES (3, 'bambang13', '$2b$10$u1gVssOlv2a3ucD2NfLsauBsfZCPaZQRGutQaYdUbkRYZcKOwkVL6', 'Bambang Petro Syamsudin', 'bamtro@gmail.com', NULL, '2025-11-17 10:23:11', NULL, 1, 0);
INSERT INTO `users` VALUES (4, 'syiefa01', '$2b$10$EENL3QO1nbxVfZv/A246KeKfSNZXsG2UUCRRhcY2vauuGeuV7r1Mq', 'Syiefa Aja', 'syiefa@marawa.id', NULL, '2025-11-19 03:44:02', NULL, 0, 0);

SET FOREIGN_KEY_CHECKS = 1;
