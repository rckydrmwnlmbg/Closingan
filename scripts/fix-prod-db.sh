#!/bin/bash
# Resolves the failed migration 12_smart_outreach on Railway production DB
# Run this script with: DATABASE_URL="<your_production_railway_url>" ./scripts/fix-prod-db.sh

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set. Please set the Railway production DATABASE_URL."
else
  echo "Checking the status of migrations..."
  cd apps/api
  npx prisma migrate status || true

  echo "--------------------------------------------------------"
  echo "Attempting to resolve the failed migration 12_smart_outreach..."
  echo "If the migration actually failed but part of it (e.g. adding the column) was applied,"
  echo "this command tells Prisma to consider it applied so it doesn't block future migrations."
  echo "--------------------------------------------------------"

  npx prisma migrate resolve --applied "12_smart_outreach"

  echo "--------------------------------------------------------"
  echo "Migration 12_smart_outreach marked as resolved."
  echo "Now you can run the remaining pending migrations (there should be 6 pending migrations in total in the project)."
  echo "npx prisma migrate deploy"
fi
