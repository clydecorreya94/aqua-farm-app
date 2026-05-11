#!/usr/bin/env bash
set -e
REMOTE="${1:?Usage: ./deploy.sh user@server-ip}"
REMOTE_DIR="/var/www/aquafarm"
echo "🐟 Deploying Clyde's AquaFarm Kerala"
echo "   Target: $REMOTE:$REMOTE_DIR"
npm run build
echo "✓ Build complete ($(du -sh dist | cut -f1))"
ssh "$REMOTE" "mkdir -p $REMOTE_DIR"
rsync -avz --delete --progress dist/ "$REMOTE:$REMOTE_DIR/"
ssh "$REMOTE" "chmod -R 755 $REMOTE_DIR && chown -R www-data:www-data $REMOTE_DIR 2>/dev/null || true"
echo "✅ Deploy complete! Visit: http://$REMOTE"
