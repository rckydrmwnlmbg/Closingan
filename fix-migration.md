# Production Database Fix for `12_smart_outreach`

The production deployment crashed with Error P3009 because the migration named `12_smart_outreach` does not use the standard timestamp format, causing it to run in an unexpected order (before the `CampaignRecipient` table was created or similarly out of sync).

When Prisma encounters a failed migration, it stops and refuses to run any further pending migrations. There are exactly 6 migrations currently available in the `apps/api/prisma/migrations/` directory.

To resolve this issue directly on the Railway production database, you need to mark the migration as applied so Prisma can continue with the rest of the 6 migrations.

## Option 1: Using the provided script
We have created a helper script for you. Run the following command locally, substituting your Railway Postgres URL:
```bash
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>" ./scripts/fix-prod-db.sh
```

## Option 2: Running the command manually
Navigate to your `apps/api` directory and run:
```bash
cd apps/api
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>" npx prisma migrate resolve --applied "12_smart_outreach"
```

Once the `12_smart_outreach` migration is resolved, the subsequent pending migrations will apply cleanly during the next Railway deployment, or you can apply them manually by running:
```bash
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>" npx prisma migrate deploy
```
