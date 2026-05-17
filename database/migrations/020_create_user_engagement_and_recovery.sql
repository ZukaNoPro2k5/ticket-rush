-- =============================================
-- Migration 020: User engagement + recovery flows
-- =============================================

CREATE TABLE IF NOT EXISTS event_favorites (
  user_id     INT NOT NULL,
  event_id    INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, event_id),
  CONSTRAINT fk_event_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_favorites_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event_favorites_event (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_bookmarks (
  user_id     INT NOT NULL,
  post_id     INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, post_id),
  CONSTRAINT fk_post_bookmarks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_bookmarks_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_post_bookmarks_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  email           VARCHAR(255) NOT NULL,
  user_id         INT NULL,
  status          ENUM('active', 'unsubscribed') NOT NULL DEFAULT 'active',
  subscribed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP NULL,

  CONSTRAINT uq_newsletter_email UNIQUE (email),
  CONSTRAINT fk_newsletter_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_newsletter_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  token_hash  CHAR(64) NOT NULL,
  expires_at  DATETIME NOT NULL,
  used_at     DATETIME NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_password_reset_token UNIQUE (token_hash),
  CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_password_reset_user (user_id, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_outbox (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  template_id    VARCHAR(60) NULL,
  recipient      VARCHAR(255) NOT NULL,
  subject        VARCHAR(255) NOT NULL,
  body           TEXT NOT NULL,
  status         ENUM('queued', 'sent', 'failed', 'skipped') NOT NULL DEFAULT 'queued',
  error_message  VARCHAR(500) NULL,
  sent_at        DATETIME NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_email_outbox_template FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL,
  INDEX idx_email_outbox_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
