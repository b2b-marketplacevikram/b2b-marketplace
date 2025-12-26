-- Fix user passwords
-- BCrypt hash for "password123"
USE b2b_marketplace;

UPDATE users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email IN ('buyer1@example.com', 'buyer2@example.com', 'buyer3@example.com', 
                'supplier1@techcorp.com', 'supplier2@globalmanuf.com', 
                'supplier3@easttrade.com', 'supplier4@eurosupply.com');

SELECT email, user_type FROM users WHERE email IN ('buyer1@example.com', 'supplier1@techcorp.com');
