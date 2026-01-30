-- ===========================================
-- SCRIPT CẬP NHẬT CÔNG NỢ ĐẦY ĐỦ
-- ===========================================
-- Phiên bản tương thích với hosting
-- (không dùng cột payment_method trong orders)
-- ===========================================

-- =============================================
-- PHẦN 1: KIỂM TRA CẤU TRÚC CÁC BẢNG
-- =============================================

-- 1.1 Kiểm tra cấu trúc bảng debts
DESCRIBE debts;

-- 1.2 Kiểm tra cấu trúc bảng orders  
DESCRIBE orders;

-- 1.3 Kiểm tra cấu trúc bảng debt_orders
DESCRIBE debt_orders;

-- 1.4 Kiểm tra cấu trúc bảng payments
DESCRIBE payments;

-- =============================================
-- PHẦN 2: KIỂM TRA DỮ LIỆU HIỆN TẠI
-- =============================================

-- 2.1 Xem tất cả công nợ
SELECT 
    d.id as debt_id,
    d.customer_id,
    d.agent_id,
    d.total_amount,
    d.paid_amount,
    d.remaining_amount,
    d.status,
    d.created_at
FROM debts d
ORDER BY d.id;

-- 2.2 Xem tất cả đơn hàng (delivered hoặc completed)
SELECT 
    o.id as order_id,
    o.user_id as customer_id,
    o.agent_id,
    o.total_amount,
    o.status,
    o.created_at
FROM orders o
WHERE o.status IN ('completed', 'delivered', 'confirmed')
ORDER BY o.id;

-- 2.3 Xem debt_orders hiện tại
SELECT * FROM debt_orders;

-- 2.4 Xem payments hiện tại
SELECT * FROM payments;

-- =============================================
-- PHẦN 3: LIÊN KẾT CÔNG NỢ VỚI ĐƠN HÀNG
-- =============================================
-- Logic: Tìm đơn hàng có cùng customer_id và agent_id với công nợ
-- và đã giao hàng (delivered/completed/confirmed)

-- 3.1 Xem trước các liên kết sẽ được tạo
SELECT 
    d.id as debt_id,
    o.id as order_id,
    o.total_amount as amount,
    d.customer_id,
    d.agent_id,
    o.status as order_status,
    o.created_at as order_date
FROM debts d
JOIN orders o ON o.user_id = d.customer_id 
             AND o.agent_id = d.agent_id
             AND o.status IN ('completed', 'delivered', 'confirmed')
WHERE NOT EXISTS (
    SELECT 1 FROM debt_orders do2 
    WHERE do2.debt_id = d.id AND do2.order_id = o.id
)
ORDER BY d.id, o.id;

-- 3.2 THỰC HIỆN LIÊN KẾT
INSERT INTO debt_orders (debt_id, order_id, amount, created_at, updated_at)
SELECT 
    d.id as debt_id,
    o.id as order_id,
    o.total_amount as amount,
    o.created_at as created_at,
    NOW() as updated_at
FROM debts d
JOIN orders o ON o.user_id = d.customer_id 
             AND o.agent_id = d.agent_id
             AND o.status IN ('completed', 'delivered', 'confirmed')
WHERE NOT EXISTS (
    SELECT 1 FROM debt_orders do2 
    WHERE do2.debt_id = d.id AND do2.order_id = o.id
);

-- =============================================
-- PHẦN 4: KIỂM TRA KẾT QUẢ SAU KHI LIÊN KẾT
-- =============================================

-- 4.1 Kiểm tra debt_orders sau khi liên kết
SELECT 
    d.id as debt_id,
    d.total_amount,
    d.status,
    COUNT(do2.id) as so_don_hang,
    GROUP_CONCAT(do2.order_id ORDER BY do2.order_id) as order_ids,
    SUM(do2.amount) as tong_tien_don_hang
FROM debts d
LEFT JOIN debt_orders do2 ON do2.debt_id = d.id
GROUP BY d.id, d.total_amount, d.status
ORDER BY d.id;

-- =============================================
-- PHẦN 5: THÊM CỘT THIẾU VÀO BẢNG PAYMENTS (NẾU CẦN)
-- =============================================

-- 5.1 Kiểm tra cột status trong payments
SELECT COLUMN_NAME, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'payments';

-- 5.2 Thêm cột status nếu thiếu (uncomment để chạy)
-- ALTER TABLE payments ADD COLUMN status ENUM('pending', 'confirmed', 'rejected') DEFAULT 'confirmed' AFTER payment_date;

-- 5.3 Thêm cột confirmed_by nếu thiếu (uncomment để chạy)
-- ALTER TABLE payments ADD COLUMN confirmed_by INT UNSIGNED NULL AFTER status;

-- =============================================
-- PHẦN 6: TẠO THANH TOÁN MẪU (TEST)
-- =============================================

-- 6.1 Xem công nợ chưa thanh toán hết
SELECT 
    d.id as debt_id,
    d.customer_id,
    d.agent_id,
    d.total_amount,
    d.paid_amount,
    d.remaining_amount,
    d.status
FROM debts d
WHERE d.remaining_amount > 0;

-- 6.2 Tạo thanh toán mẫu (thay đổi ID và số tiền phù hợp)
-- Ví dụ: debt_id=5, customer_id=4, agent_id=2, thanh toán 50000đ
/*
INSERT INTO payments (debt_id, customer_id, agent_id, amount, payment_method, payment_date, notes, created_at, updated_at)
VALUES (5, 4, 2, 50000, 'cash', CURDATE(), 'Thanh toán một phần', NOW(), NOW());

-- Cập nhật công nợ sau khi thanh toán
UPDATE debts 
SET paid_amount = paid_amount + 50000,
    remaining_amount = remaining_amount - 50000,
    status = CASE 
        WHEN remaining_amount - 50000 <= 0 THEN 'paid'
        ELSE 'partial'
    END,
    updated_at = NOW()
WHERE id = 5;
*/

-- =============================================
-- PHẦN 7: ĐỒNG BỘ TỔNG TIỀN CÔNG NỢ (NẾU CẦN)
-- =============================================

-- 7.1 Kiểm tra công nợ có tổng tiền không khớp
SELECT 
    d.id as debt_id,
    d.total_amount as debt_total,
    COALESCE(SUM(do2.amount), 0) as orders_total,
    d.total_amount - COALESCE(SUM(do2.amount), 0) as chenh_lech
FROM debts d
LEFT JOIN debt_orders do2 ON do2.debt_id = d.id
GROUP BY d.id, d.total_amount
HAVING ABS(d.total_amount - COALESCE(SUM(do2.amount), 0)) > 0.01;

-- 7.2 Cập nhật tổng tiền từ đơn hàng (uncomment nếu cần)
/*
UPDATE debts d
SET d.total_amount = (
    SELECT COALESCE(SUM(do2.amount), 0) 
    FROM debt_orders do2 
    WHERE do2.debt_id = d.id
),
d.remaining_amount = (
    SELECT COALESCE(SUM(do2.amount), 0) 
    FROM debt_orders do2 
    WHERE do2.debt_id = d.id
) - d.paid_amount,
d.updated_at = NOW()
WHERE EXISTS (SELECT 1 FROM debt_orders do2 WHERE do2.debt_id = d.id);
*/

-- =============================================
-- HƯỚNG DẪN SỬ DỤNG:
-- =============================================
-- 1. Chạy PHẦN 1 - Kiểm tra cấu trúc bảng
-- 2. Chạy PHẦN 2 - Xem dữ liệu hiện có
-- 3. Chạy PHẦN 3.1 - Xem trước liên kết sẽ tạo
-- 4. Chạy PHẦN 3.2 - Thực hiện liên kết
-- 5. Chạy PHẦN 4 - Xác nhận kết quả
-- 6. PHẦN 5-7 là tùy chọn
-- =============================================
