-- Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    sent_at DATETIME,
    created_at DATETIME NOT NULL,
    retry_count INT DEFAULT 0,
    order_id BIGINT,
    user_id BIGINT,
    INDEX idx_recipient (recipient),
    INDEX idx_status (status),
    INDEX idx_email_type (email_type),
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
