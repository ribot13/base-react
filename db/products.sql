-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 03, 2025 at 01:46 AM
-- Server version: 9.5.0
-- PHP Version: 8.5.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mrw_cmrc`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `sku` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `price_max` decimal(10,2) DEFAULT '0.00',
  `price_cost` decimal(10,2) DEFAULT '0.00',
  `stock` int DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image_url` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `_deleted` tinyint(1) DEFAULT '0',
  `is_featured` tinyint DEFAULT '0',
  `is_discontinued` tinyint DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `is_link_only` tinyint(1) DEFAULT '0' COMMENT '1 = Hanya bisa diakses via link, tidak muncul di katalog',
  `is_scheduled` tinyint(1) DEFAULT '0',
  `published_at` datetime DEFAULT NULL COMMENT 'Jadwal publikasi. Jika NULL = Langsung tayang (kecuali draft)',
  `is_preorder` tinyint(1) DEFAULT '0',
  `po_duration` int DEFAULT '0' COMMENT 'Lama pengerjaan dalam hari',
  `is_dp_mandatory` tinyint(1) DEFAULT '0' COMMENT '1 = Wajib DP',
  `dp_amount` decimal(15,2) DEFAULT '0.00',
  `dp_type` enum('fixed','percentage') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'fixed',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `sku`, `category`, `name`, `price`, `price_max`, `price_cost`, `stock`, `description`, `image_url`, `_deleted`, `is_featured`, `is_discontinued`, `is_active`, `is_link_only`, `is_scheduled`, `published_at`, `is_preorder`, `po_duration`, `is_dp_mandatory`, `dp_amount`, `dp_type`, `created_at`, `updated_at`) VALUES
(31, '', 'Backpack', 'Hali Series', 159000.00, 199000.00, 120000.00, 5, 'Tas Ransel/Selempang multifungsi', NULL, 0, 0, 0, 1, 0, 0, NULL, 0, NULL, 0, 0.00, 'fixed', '2025-11-27 08:19:28', '2025-11-27 08:19:28'),
(32, 'K001', 'Backpack', 'Kanke Series', 325000.00, 499000.00, 179000.00, 0, 'Ransel kuliah/kerja compact', NULL, 0, 0, 0, 1, 0, 0, NULL, 0, NULL, 0, 0.00, 'fixed', '2025-11-27 08:24:32', '2025-11-27 08:24:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
