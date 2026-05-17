-- =============================================
-- Migration 017: Standardize event taxonomy to 8 categories
-- Canonical order:
-- music, arts, sports, food, entertainment, workshop, stage, other
-- =============================================

-- Existing "tech" events are folded into "other" before removing the enum value.
UPDATE events
SET category = 'other'
WHERE category = 'tech';

ALTER TABLE events
  MODIFY COLUMN category ENUM(
    'music',
    'arts',
    'sports',
    'food',
    'entertainment',
    'workshop',
    'stage',
    'other'
  ) NOT NULL DEFAULT 'other';

-- Existing user preferences may still contain the retired "tech" value.
-- Remove it so recommendations stay aligned with the live taxonomy.
UPDATE users
SET category_preferences = JSON_REMOVE(
  category_preferences,
  JSON_UNQUOTE(JSON_SEARCH(category_preferences, 'one', 'tech'))
)
WHERE category_preferences IS NOT NULL
  AND JSON_SEARCH(category_preferences, 'one', 'tech') IS NOT NULL;
