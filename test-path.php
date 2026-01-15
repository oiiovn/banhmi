<?php
/**
 * File test để xem đường dẫn thực tế trên hosting
 * Upload file này lên hosting và truy cập qua browser
 */

echo "<h2>Đường dẫn thực tế trên hosting:</h2>";
echo "<p><strong>Thư mục hiện tại:</strong><br>";
echo "<code>" . __DIR__ . "</code></p>";

echo "<p><strong>Đường dẫn đầy đủ:</strong><br>";
echo "<code>" . realpath(__DIR__) . "</code></p>";

echo "<hr>";
echo "<h3>Hướng dẫn:</h3>";
echo "<ol>";
echo "<li>Upload file này vào thư mục <code>api.websi.vn/</code></li>";
echo "<li>Truy cập: <code>https://api.websi.vn/test-path.php</code></li>";
echo "<li>Copy đường dẫn hiển thị</li>";
echo "<li>Dán vào <code>PROJECT_DIR</code> trong script</li>";
echo "</ol>";

echo "<hr>";
echo "<p><strong>Lưu ý:</strong> Xóa file này sau khi đã tìm được đường dẫn!</p>";
?>


