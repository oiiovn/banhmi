-- ===========================================
-- SCRIPT LIÊN KẾT CÔNG NỢ CŨ VỚI ĐƠN HÀNG
-- ===========================================
-- Chạy script này trên phpMyAdmin để liên kết
-- các công nợ cũ với đơn hàng tương ứng
-- ===========================================
-- LƯU Ý: Bảng orders dùng user_id (không phải customer_id)
-- ===========================================

-- BƯỚC 1: Kiểm tra công nợ chưa có liên kết trong debt_orders
SELECT 
    d.id as debt_id,
    d.customer_id,
    d.agent_id,
    d.total_amount,
    d.status,
    d.created_at,
    (SELECT COUNT(*) FROM debt_orders do2 WHERE do2.debt_id = d.id) as so_don_da_lien_ket
FROM debts d
ORDER BY d.id;

-- BƯỚC 2: Kiểm tra các đơn hàng công nợ (payment_method = 'debt') chưa được liên kết
SELECT 
    o.id as order_id,
    o.user_id as customer_id,
    o.agent_id,
    o.total_amount as total,
    o.status,
    o.payment_method,
    o.created_at,
    (SELECT COUNT(*) FROM debt_orders do2 WHERE do2.order_id = o.id) as da_lien_ket
FROM orders o
WHERE o.payment_method = 'debt'
  AND o.status IN ('completed', 'delivered', 'confirmed')
ORDER BY o.id;

-- BƯỚC 3: Xem trước các liên kết sẽ được tạo
SELECT 
    d.id as debt_id,
    o.id as order_id,
    o.total_amount as amount,
    d.customer_id,
    d.agent_id,
    'Sẽ được liên kết' as trang_thai
FROM debts d
JOIN orders o ON o.user_id = d.customer_id 
             AND o.agent_id = d.agent_id
             AND o.payment_method = 'debt'
             AND o.status IN ('completed', 'delivered', 'confirmed')
WHERE NOT EXISTS (
    SELECT 1 FROM debt_orders do2 
    WHERE do2.debt_id = d.id AND do2.order_id = o.id
)
ORDER BY d.id, o.id;

-- ===========================================
-- BƯỚC 4: THỰC HIỆN LIÊN KẾT (CHẠY SAU KHI KIỂM TRA)
-- ===========================================

INSERT INTO debt_orders (debt_id, order_id, amount, created_at, updated_at)
SELECT 
    d.id as debt_id,
    o.id as order_id,
    o.total_amount as amount,
    NOW() as created_at,
    NOW() as updated_at
FROM debts d
JOIN orders o ON o.user_id = d.customer_id 
             AND o.agent_id = d.agent_id
             AND o.payment_method = 'debt'
             AND o.status IN ('completed', 'delivered', 'confirmed')
WHERE NOT EXISTS (
    SELECT 1 FROM debt_orders do2 
    WHERE do2.debt_id = d.id AND do2.order_id = o.id
);

-- ===========================================
-- BƯỚC 5: Kiểm tra kết quả sau khi liên kết
-- ===========================================

SELECT 
    d.id as debt_id,
    d.customer_id,
    d.total_amount,
    d.status,
    COUNT(do2.id) as so_don_hang_lien_ket,
    GROUP_CONCAT(do2.order_id) as danh_sach_order_id
FROM debts d
LEFT JOIN debt_orders do2 ON do2.debt_id = d.id
GROUP BY d.id, d.customer_id, d.total_amount, d.status
ORDER BY d.id;

-- ===========================================
-- GHI CHÚ:
-- - Chạy BƯỚC 1-3 trước để kiểm tra dữ liệu
-- - Nếu kết quả BƯỚC 3 đúng, chạy BƯỚC 4
-- - Chạy BƯỚC 5 để xác nhận liên kết thành công
-- ===========================================
