-- =============================================
-- Migration 015: Real newsroom posts shared by admin + public site
-- =============================================

CREATE TABLE IF NOT EXISTS posts (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  slug              VARCHAR(180) NOT NULL,
  title             VARCHAR(255) NOT NULL,
  excerpt           TEXT NOT NULL,
  body              JSON NOT NULL,
  quote             TEXT NULL,
  author_name       VARCHAR(120) NOT NULL,
  category          VARCHAR(60) NOT NULL,
  cover_url         VARCHAR(500) NOT NULL,
  read_time_min     INT NOT NULL DEFAULT 5,
  featured          BOOLEAN NOT NULL DEFAULT FALSE,
  status            ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  view_count        INT NOT NULL DEFAULT 0,
  published_at      DATETIME NULL,
  created_by        INT NOT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT uq_posts_slug UNIQUE (slug),
  CONSTRAINT fk_posts_created_by FOREIGN KEY (created_by) REFERENCES users(id),

  INDEX idx_posts_status_published (status, published_at),
  INDEX idx_posts_category_status (category, status),
  INDEX idx_posts_views (view_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
