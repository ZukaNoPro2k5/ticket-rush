---
applyTo: "**/*.sql"
---

# Database Instructions (MySQL 8.0)

## Schema Conventions
- Table names: `snake_case`, plural (e.g., `events`, `seat_zones`, `bookings`).
- Column names: `snake_case`.
- Primary keys: `id INT AUTO_INCREMENT PRIMARY KEY` or `id CHAR(36)` for UUIDs.
- Timestamps: `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`, `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`.
- Use `ENUM` for small fixed sets of values (e.g., status fields).
- Add foreign key constraints with appropriate `ON DELETE` behavior.
- Add indexes on columns used in WHERE, JOIN, and ORDER BY.

## Migration Files
- Located in `database/migrations/`.
- Named with numeric prefix: `001_create_tables.sql`, `002_add_indexes.sql`.
- Each migration is idempotent when possible (use `IF NOT EXISTS`).

## Seed Files
- Located in `database/seeds/`.
- Use `INSERT IGNORE` or `ON DUPLICATE KEY UPDATE` for idempotent seeds.
- Seed data should be realistic Vietnamese content (event names, descriptions).

## Security
- NEVER use `SELECT *` in production queries — list columns explicitly.
- Always use `?` placeholders for parameters in application code.
- Use `VARCHAR` with appropriate length limits.
- Sensitive data (passwords) stored as hashed strings, never plaintext.

## Character Set
- Use `utf8mb4` charset and `utf8mb4_unicode_ci` collation for Vietnamese support.
