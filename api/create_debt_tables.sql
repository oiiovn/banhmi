-- =====================================================
-- SQL Script: Tạo các bảng debt, debt_orders, payments
-- Sử dụng trên hosting khi migration không chạy được
-- =====================================================

-- =====================================================
-- 1. TẠO BẢNG DEBTS (nếu chưa tồn tại)
-- =====================================================
CREATE TABLE IF NOT EXISTS `debts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned DEFAULT NULL COMMENT 'NULL = công nợ tổng, có giá trị = công nợ đơn lẻ',
  `customer_id` bigint(20) unsigned NOT NULL,
  `agent_id` bigint(20) unsigned NOT NULL,
  `total_amount` decimal(15,2) NOT NULL COMMENT 'Tổng số tiền nợ',
  `paid_amount` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Số tiền đã thanh toán',
  `remaining_amount` decimal(15,2) NOT NULL COMMENT 'Số tiền còn lại',
  `status` enum('pending','partial','paid','cancelled') NOT NULL DEFAULT 'pending',
  `due_date` date DEFAULT NULL COMMENT 'Ngày đến hạn',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `debts_customer_id_status_index` (`customer_id`,`status`),
  KEY `debts_agent_id_status_index` (`agent_id`,`status`),
  KEY `debts_customer_id_agent_id_status_index` (`customer_id`,`agent_id`,`status`),
  KEY `debts_order_id_foreign` (`order_id`),
  CONSTRAINT `debts_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `debts_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `debts_agent_id_foreign` FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. CẬP NHẬT BẢNG DEBTS (nếu đã tồn tại)
-- Đảm bảo order_id là nullable và có index
-- =====================================================

-- Kiểm tra và sửa order_id thành nullable (nếu chưa nullable)
ALTER TABLE `debts` 
  MODIFY COLUMN `order_id` bigint(20) unsigned DEFAULT NULL COMMENT 'NULL = công nợ tổng, có giá trị = công nợ đơn lẻ';

-- Thêm index cho (customer_id, agent_id, status) nếu chưa có
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE table_schema = DATABASE() 
    AND table_name = 'debts' 
    AND index_name = 'debts_customer_id_agent_id_status_index'
);

SET @sql = IF(@index_exists = 0,
  'ALTER TABLE `debts` ADD INDEX `debts_customer_id_agent_id_status_index` (`customer_id`, `agent_id`, `status`)',
  'SELECT "Index debts_customer_id_agent_id_status_index already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 3. TẠO BẢNG DEBT_ORDERS (QUAN TRỌNG!)
-- Bảng này liên kết nhiều đơn hàng với một công nợ tổng
-- =====================================================
CREATE TABLE IF NOT EXISTS `debt_orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `debt_id` bigint(20) unsigned NOT NULL,
  `order_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(15,2) NOT NULL COMMENT 'Số tiền của đơn hàng này trong công nợ',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `debt_orders_order_id_unique` (`order_id`),
  KEY `debt_orders_debt_id_index` (`debt_id`),
  CONSTRAINT `debt_orders_debt_id_foreign` FOREIGN KEY (`debt_id`) REFERENCES `debts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `debt_orders_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TẠO BẢNG PAYMENTS (nếu chưa tồn tại)
-- =====================================================
CREATE TABLE IF NOT EXISTS `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `debt_id` bigint(20) unsigned NOT NULL,
  `customer_id` bigint(20) unsigned NOT NULL,
  `agent_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(15,2) NOT NULL COMMENT 'Số tiền thanh toán',
  `payment_method` enum('cash','bank_transfer','other') NOT NULL DEFAULT 'cash',
  `payment_date` date NOT NULL COMMENT 'Ngày thanh toán',
  `status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái xác nhận',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_customer_id_payment_date_index` (`customer_id`,`payment_date`),
  KEY `payments_agent_id_payment_date_index` (`agent_id`,`payment_date`),
  KEY `payments_debt_id_index` (`debt_id`),
  CONSTRAINT `payments_debt_id_foreign` FOREIGN KEY (`debt_id`) REFERENCES `debts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_agent_id_foreign` FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. CẬP NHẬT BẢNG PAYMENTS (nếu đã tồn tại)
-- Thêm cột status nếu chưa có
-- =====================================================

-- Kiểm tra và thêm cột status nếu chưa có
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_schema = DATABASE() 
    AND table_name = 'payments' 
    AND column_name = 'status'
);

SET @sql = IF(@column_exists = 0,
  "ALTER TABLE `payments` ADD COLUMN `status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái xác nhận' AFTER `payment_date`",
  'SELECT "Column status already exists in payments table" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- HOÀN TẤT
-- =====================================================
SELECT '✅ Đã tạo/cập nhật các bảng: debts, debt_orders, payments' AS result;
