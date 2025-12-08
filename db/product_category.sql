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

 Date: 03/12/2025 14:49:25
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_category
-- ----------------------------
INSERT INTO `product_category` VALUES (1, NULL, 'Tas Selempang', 'tas-selempang', 'tas selempang aja', 'public', 1);
INSERT INTO `product_category` VALUES (2, NULL, 'Backpack/Ransel', 'backpack-ransel', 'Rasnel gendong', 'public', 2);
INSERT INTO `product_category` VALUES (3, 1, 'Poke Reborn Series', 'poke-reborn-series', 'Tas selempang mini multifungsi', 'public', 1);

SET FOREIGN_KEY_CHECKS = 1;
