#!/bin/sh

# Run database migrations
echo "Running database migrations..."
pnpm exec prisma migrate deploy

# Start the application
echo "Starting the application..."
pnpm run start:dev
