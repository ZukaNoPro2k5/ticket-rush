#!/bin/bash
# Chạy toàn bộ migration files theo thứ tự, sau đó seed data
set -e

echo "==> [init-db] Chạy migrations..."
for f in /docker-entrypoint-initdb.d/01-migrations/*.sql; do
  echo "    --> $f"
  mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < "$f"
done

echo "==> [init-db] Chạy seeds..."
for f in /docker-entrypoint-initdb.d/02-seeds/*.sql; do
  echo "    --> $f"
  mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < "$f"
done

echo "==> [init-db] Hoàn tất."
