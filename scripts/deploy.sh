#!/bin/bash
set -e

echo "Starting deployment build..."

# Force prisma push to remote schema to resolve P3009
echo "Pushing Prisma schema and generating client..."
cd apps/api
npx prisma db push --accept-data-loss
npx prisma generate
cd ../..

echo "Building NestJS backend..."
npm run build --workspace=apps/api

echo "Building Next.js frontend..."
npm run build --workspace=apps/web

echo "Deployment build completed successfully."
