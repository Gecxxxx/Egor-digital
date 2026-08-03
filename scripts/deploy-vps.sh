#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/var/www/digital-tools-by-egor"
SERVICE_NAME="digital-tools-by-egor.service"
NGINX_FILE="/etc/nginx/sites-enabled/egordigital.site"
BUILD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
BACKUP_DIR="/var/backups/egordigital"
BACKUP_FILE="$BACKUP_DIR/public-$STAMP.tar.gz"
SERVER_BACKUP_FILE="$BACKUP_DIR/server-$STAMP.js"
NGINX_BACKUP_FILE="$BACKUP_DIR/nginx-$STAMP.conf"
STAGE_DIR="$APP_DIR/public.next-$STAMP"
PREVIOUS_DIR="$APP_DIR/public.previous-$STAMP"
SWITCHED=0
SERVER_PATCHED=0
NGINX_PATCHED=0

wait_for_endpoint() {
  local method="$1"
  local url="$2"
  local attempt

  for attempt in $(seq 1 30); do
    if curl --fail --silent --show-error --max-time 5 -X "$method" "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "Service did not become ready: $method $url" >&2
  return 1
}

verify_public_headers() {
  local headers
  local csp

  curl --fail --silent --show-error --max-time 5 https://egordigital.site/ | grep '111246146' >/dev/null
  headers="$(curl --fail --silent --show-error --head --max-time 5 https://egordigital.site/ | tr -d '\r')"
  csp="$(grep -i '^content-security-policy:' <<<"$headers")"

  grep -qi 'script-src[^;]*https://mc\.yandex\.ru' <<<"$csp"
  grep -qi 'connect-src[^;]*https://mc\.yandex\.ru' <<<"$csp"
  grep -qi 'img-src[^;]*https://mc\.yandex\.ru' <<<"$csp"
  grep -qi 'style-src[^;]*https://fonts\.googleapis\.com' <<<"$csp"
  grep -qi 'font-src[^;]*https://fonts\.gstatic\.com' <<<"$csp"

  if [[ "${#csp}" -gt 4096 ]]; then
    echo "Public CSP header is unexpectedly large: ${#csp} bytes" >&2
    return 1
  fi
}

verify_brief_api() {
  local response

  response="$(curl --fail --silent --show-error --max-time 15 \
    -X POST https://egordigital.site/api/brief \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    --data '{"name":"Release check","contact":"healthcheck","message":"Public API verification","website":"release-healthcheck"}')"

  grep -Eq '"ok"[[:space:]]*:[[:space:]]*true' <<<"$response"
}

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run this deployment as root." >&2
  exit 1
fi

for required in "$APP_DIR" "$APP_DIR/public" "$APP_DIR/server.js" "$APP_DIR/.env" "$NGINX_FILE"; do
  if [[ ! -e "$required" ]]; then
    echo "Required production path is missing: $required" >&2
    exit 1
  fi
done

rollback() {
  local exit_code=$?

  if [[ "$SWITCHED" -eq 1 && -d "$PREVIOUS_DIR" ]]; then
    echo "Deployment failed; restoring the previous public directory." >&2
    if [[ -d "$APP_DIR/public" ]]; then
      mv "$APP_DIR/public" "$APP_DIR/public.failed-$STAMP"
    fi
    mv "$PREVIOUS_DIR" "$APP_DIR/public"
  fi

  if [[ "$SERVER_PATCHED" -eq 1 && -f "$SERVER_BACKUP_FILE" ]]; then
    echo "Restoring the previous server.js." >&2
    cp -a "$SERVER_BACKUP_FILE" "$APP_DIR/server.js"
  fi

  if [[ "$NGINX_PATCHED" -eq 1 && -f "$NGINX_BACKUP_FILE" ]]; then
    echo "Restoring the previous Nginx configuration." >&2
    cp -a "$NGINX_BACKUP_FILE" "$NGINX_FILE"
  fi

  node --check "$APP_DIR/server.js" || true
  nginx -t || true
  systemctl restart "$SERVICE_NAME" || true
  systemctl reload nginx || true
  exit "$exit_code"
}
trap rollback ERR

cd "$BUILD_DIR"
npm ci
npm run build
npm run test:sites

test -f "$BUILD_DIR/dist/client/index.html"
test -f "$BUILD_DIR/dist/client/404.html"
test -f "$BUILD_DIR/dist/client/services.html"
test -d "$BUILD_DIR/dist/client/assets"

mkdir -p "$BACKUP_DIR"
tar -C "$APP_DIR" -czf "$BACKUP_FILE" public
cp -a "$APP_DIR/server.js" "$SERVER_BACKUP_FILE"
cp -a "$NGINX_FILE" "$NGINX_BACKUP_FILE"

node "$BUILD_DIR/scripts/patch-vps-server.mjs" "$APP_DIR/server.js"
SERVER_PATCHED=1
node --check "$APP_DIR/server.js"

node "$BUILD_DIR/scripts/patch-vps-nginx.mjs" "$NGINX_FILE"
NGINX_PATCHED=1
nginx -t

mkdir "$STAGE_DIR"
cp -a "$BUILD_DIR/dist/client/." "$STAGE_DIR/"
chmod -R u=rwX,go=rX "$STAGE_DIR"

mv "$APP_DIR/public" "$PREVIOUS_DIR"
mv "$STAGE_DIR" "$APP_DIR/public"
SWITCHED=1

systemctl restart "$SERVICE_NAME"
systemctl is-active --quiet "$SERVICE_NAME"
systemctl reload nginx
systemctl is-active --quiet nginx

wait_for_endpoint GET http://127.0.0.1:3000/
wait_for_endpoint GET http://127.0.0.1:3000/services
wait_for_endpoint OPTIONS http://127.0.0.1:3000/api/brief
verify_public_headers
verify_brief_api

rm -rf -- "$PREVIOUS_DIR"
SWITCHED=0
SERVER_PATCHED=0
NGINX_PATCHED=0
trap - ERR

echo "Deployment completed. Backup: $BACKUP_FILE"
echo "Server backup: $SERVER_BACKUP_FILE"
echo "Nginx backup: $NGINX_BACKUP_FILE"
echo "Service: $(systemctl is-active "$SERVICE_NAME")"
echo "Nginx: $(systemctl is-active nginx)"
