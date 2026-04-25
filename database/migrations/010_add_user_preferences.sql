-- =============================================
-- Migration 010: Add OAuth columns + user preferences to users table
-- =============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS oauth_provider    VARCHAR(20)  NULL AFTER role,
  ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255) NULL AFTER oauth_provider,
  ADD COLUMN IF NOT EXISTS avatar_url        VARCHAR(500) NULL AFTER oauth_provider_id,
  ADD COLUMN IF NOT EXISTS category_preferences JSON       NULL AFTER avatar_url,
  ADD COLUMN IF NOT EXISTS preferred_city    VARCHAR(100) NULL AFTER category_preferences;

-- Index for fast OAuth lookup
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users (oauth_provider, oauth_provider_id);
