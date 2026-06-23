#!/bin/bash
set -e

echo "==> Installing server dependencies..."
cd server && npm install && cd ..

echo "==> Building frontend..."
cd client && npm install && npm run build && cd ..

echo "==> Restarting app with PM2..."
pm2 startOrRestart ecosystem.config.js --env production
pm2 save

echo "==> Done! App running on port 3001"
