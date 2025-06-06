-- Insert sample articles
INSERT INTO articles (title, excerpt, content, image_url, category, published_at) VALUES
(
    'Công nghệ AI đang thay đổi ngành báo chí',
    'Trí tuệ nhân tạo đang được áp dụng rộng rãi trong ngành báo chí, từ việc viết bài tự động đến phân tích dữ liệu độc giả.',
    'Nội dung chi tiết về cách AI đang thay đổi ngành báo chí...',
    'https://example.com/images/ai-journalism.jpg',
    'Công nghệ',
    CURRENT_TIMESTAMP
),
(
    'Xu hướng phát triển web năm 2024',
    'Các xu hướng phát triển web mới nhất đang định hình tương lai của trải nghiệm người dùng.',
    'Chi tiết về các xu hướng phát triển web trong năm 2024...',
    'https://example.com/images/web-dev-2024.jpg',
    'Công nghệ',
    CURRENT_TIMESTAMP
),
(
    'Kinh tế Việt Nam tăng trưởng ấn tượng',
    'Nền kinh tế Việt Nam tiếp tục cho thấy dấu hiệu phục hồi mạnh mẽ sau đại dịch.',
    'Phân tích chi tiết về tình hình kinh tế Việt Nam...',
    'https://example.com/images/vietnam-economy.jpg',
    'Kinh tế',
    CURRENT_TIMESTAMP
); 