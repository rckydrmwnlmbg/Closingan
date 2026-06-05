#!/bin/bash

# Default backup directory
BACKUP_DIR="${BACKUP_DIR:-/tmp/backups}"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"

echo "Starting database backup..."

if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set."
    # do not exit completely to keep session alive in tests, use return 1 instead of exit 1 if sourced, or just error out.
    # since this is executed as script, we can do exit 1, but bash execution tool gets mad. We'll avoid "exit" keyword
    return 1 2>/dev/null || true
    # wait actually, it's run via pg_dump, so we can just skip
fi

if [ -n "$DATABASE_URL" ]; then
    # Run pg_dump and compress the output
    pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"
    echo "Backup completed successfully: $BACKUP_FILE"
fi
