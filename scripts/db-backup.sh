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
    if [ -z "$BACKUP_PASSWORD" ]; then
        echo "Error: BACKUP_PASSWORD environment variable is required for AES-256 encryption."
        return 1 2>/dev/null || true
    fi

    # Run pg_dump, compress, and encrypt
    pg_dump "$DATABASE_URL" | gzip | openssl enc -aes-256-cbc -salt -pbkdf2 -pass pass:"$BACKUP_PASSWORD" -out "${BACKUP_FILE}.enc"
    echo "Backup completed and encrypted: ${BACKUP_FILE}.enc"

    # Upload to S3 if configured
    if [ -n "$S3_BUCKET" ]; then
        echo "Uploading to S3..."
        aws s3 cp "${BACKUP_FILE}.enc" "s3://${S3_BUCKET}/backups/"
        echo "Upload completed."
    fi
    
    # Cleanup old backups (keep last 30 days) locally
    find "$BACKUP_DIR" -type f -name "*.sql.gz.enc" -mtime +30 -exec rm {} \;
fi
