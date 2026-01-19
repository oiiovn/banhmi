-- Tạo bảng debt_transfers để quản lý chuyển công nợ giữa 2 đại lý
-- Ví dụ: A nợ B 500k, B nợ A 100k → chuyển 100k → A còn nợ B 400k

CREATE TABLE IF NOT EXISTS debt_transfers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    from_debt_id BIGINT UNSIGNED NOT NULL COMMENT 'Công nợ A nợ B (công nợ sẽ bị trừ)',
    to_debt_id BIGINT UNSIGNED NOT NULL COMMENT 'Công nợ B nợ A (công nợ sẽ được trừ)',
    amount DECIMAL(15, 2) NOT NULL COMMENT 'Số tiền được trừ (ví dụ: 100k)',
    status ENUM('pending', 'confirmed', 'rejected') NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái yêu cầu',
    initiated_by BIGINT UNSIGNED NOT NULL COMMENT 'Người tạo yêu cầu (A)',
    confirmed_by BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Người xác nhận yêu cầu (B)',
    description TEXT NULL DEFAULT NULL COMMENT 'Ghi chú',
    confirmed_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời gian xác nhận',
    rejected_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời gian từ chối',
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    INDEX idx_status_initiated_by (status, initiated_by),
    INDEX idx_status_confirmed_by (status, confirmed_by),
    INDEX idx_from_debt_id (from_debt_id),
    INDEX idx_to_debt_id (to_debt_id),
    CONSTRAINT fk_debt_transfers_from_debt FOREIGN KEY (from_debt_id) 
        REFERENCES debts(id) ON DELETE CASCADE,
    CONSTRAINT fk_debt_transfers_to_debt FOREIGN KEY (to_debt_id) 
        REFERENCES debts(id) ON DELETE CASCADE,
    CONSTRAINT fk_debt_transfers_initiated_by FOREIGN KEY (initiated_by) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_debt_transfers_confirmed_by FOREIGN KEY (confirmed_by) 
        REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
