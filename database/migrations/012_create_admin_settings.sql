-- =============================================
-- Migration 012: Persist admin configuration screens
-- =============================================

CREATE TABLE IF NOT EXISTS admin_system_settings (
  id                          TINYINT PRIMARY KEY,
  company_name                VARCHAR(120) NOT NULL,
  support_email               VARCHAR(255) NOT NULL,
  address                     VARCHAR(255) NOT NULL,
  ticket_hold_minutes         INT NOT NULL DEFAULT 10,
  max_tickets_per_booking     INT NOT NULL DEFAULT 10,
  timezone                    VARCHAR(80) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  language                    VARCHAR(10) NOT NULL DEFAULT 'vi',
  maintenance_mode            BOOLEAN NOT NULL DEFAULT FALSE,
  payment_sandbox_mode        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO admin_system_settings (
  id, company_name, support_email, address, ticket_hold_minutes,
  max_tickets_per_booking, timezone, language, maintenance_mode, payment_sandbox_mode
)
VALUES (
  1, 'TicketRush VN', 'support@ticketrush.vn', 'Q. Cầu Giấy, Hà Nội', 10,
  10, 'Asia/Ho_Chi_Minh', 'vi', FALSE, TRUE
)
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS payment_gateways (
  id             VARCHAR(40) PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  description    VARCHAR(255) NOT NULL,
  enabled        BOOLEAN NOT NULL DEFAULT FALSE,
  partner_code   VARCHAR(255) NULL,
  access_key     VARCHAR(255) NULL,
  secret_key     VARCHAR(255) NULL,
  webhook_url    VARCHAR(500) NOT NULL,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO payment_gateways (id, name, description, enabled, partner_code, access_key, webhook_url)
VALUES
  ('vnpay',  'VNPay',  'Thanh toán qua mã QR, thẻ ATM và tài khoản ngân hàng nội địa.', TRUE,  NULL, NULL, 'https://api.ticketrush.vn/webhooks/vnpay'),
  ('momo',   'Ví MoMo', 'Cổng thanh toán điện tử ví MoMo phổ biến nhất tại Việt Nam.', TRUE,  NULL, NULL, 'https://api.ticketrush.vn/webhooks/momo'),
  ('stripe', 'Stripe', 'Thanh toán quốc tế bằng thẻ Visa, Mastercard, AMEX.', FALSE, NULL, NULL, 'https://api.ticketrush.vn/webhooks/stripe')
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS smtp_settings (
  id          TINYINT PRIMARY KEY,
  host        VARCHAR(255) NOT NULL,
  port        INT NOT NULL,
  from_name   VARCHAR(255) NOT NULL,
  from_email  VARCHAR(255) NOT NULL,
  username    VARCHAR(255) NOT NULL,
  password    VARCHAR(255) NULL,
  encryption  ENUM('tls', 'ssl', 'none') NOT NULL DEFAULT 'tls',
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO smtp_settings (id, host, port, from_name, from_email, username, password, encryption)
VALUES (1, 'smtp.gmail.com', 587, 'TicketRush VN', 'no-reply@ticketrush.vn', 'apikey', NULL, 'tls')
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS email_templates (
  id          VARCHAR(60) PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  subject     VARCHAR(255) NOT NULL,
  body        TEXT NOT NULL,
  status      ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO email_templates (id, name, subject, body, status)
VALUES
  (
    'booking_confirmation',
    'Xác nhận đặt vé',
    'Xác nhận đặt vé thành công từ TicketRush',
    'Xin chào {{user_name}},\n\nCảm ơn bạn đã đặt vé sự kiện {{event_name}}. Mã vé của bạn là: {{ticket_code}}.\n\nVui lòng đưa mã này tại quầy check-in.\n\nHẹn gặp bạn tại sự kiện!',
    'active'
  ),
  (
    'booking_reminder',
    'Nhắc nhở sự kiện',
    'Nhắc lịch tham dự {{event_name}}',
    'Xin chào {{user_name}},\n\nSự kiện {{event_name}} sẽ diễn ra vào {{event_date}}. Hẹn gặp bạn tại địa điểm tổ chức!',
    'active'
  ),
  (
    'account_welcome',
    'Chào mừng tài khoản mới',
    'Chào mừng bạn đến với TicketRush',
    'Xin chào {{user_name}},\n\nTài khoản TicketRush của bạn đã sẵn sàng. Chúc bạn tìm được thật nhiều sự kiện đáng nhớ!',
    'active'
  ),
  (
    'password_reset',
    'Quên mật khẩu',
    'Đặt lại mật khẩu TicketRush',
    'Xin chào {{user_name}},\n\nDùng liên kết sau để đặt lại mật khẩu: {{reset_link}}\n\nNếu bạn không yêu cầu thao tác này, hãy bỏ qua email.',
    'active'
  )
ON DUPLICATE KEY UPDATE id = id;
