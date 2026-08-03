#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/var/www/digital-tools-by-egor"
SERVICE_NAME="digital-tools-by-egor.service"
BUILD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
BACKUP_DIR="/var/backups/egordigital"
BACKUP_FILE="$BACKUP_DIR/public-$STAMP.tar.gz"
SERVER_BACKUP_FILE="$BACKUP_DIR/server-$STAMP.js"
STAGE_DIR="$APP_DIR/public.next-$STAMP"
PREVIOUS_DIR="$APP_DIR/public.previous-$STAMP"
SWITCHED=0
SERVER_PATCHED=0

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

verify_metrika() {
  local headers

  curl --fail --silent --show-error --max-time 5 http://127.0.0.1:3000/ | grep -q '111246146'
  headers="$(curl --fail --silent --show-error --head --max-time 5 http://127.0.0.1:3000/ | tr -d '\r')"
  grep -qi '^content-security-policy:.*script-src[^;]*https://mc\.yandex\.ru' <<<"$headers"
  grep -qi '^content-security-policy:.*connect-src[^;]*https://mc\.yandex\.ru' <<<"$headers"
  grep -qi '^content-security-policy:.*img-src[^;]*https://mc\.yandex\.ru' <<<"$headers"
}

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run this deployment as root." >&2
  exit 1
fi

for required in "$APP_DIR" "$APP_DIR/public" "$APP_DIR/server.js" "$APP_DIR/.env"; do
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
    systemctl restart "$SERVICE_NAME" || true
  fi
  if [[ "$SERVER_PATCHED" -eq 1 && -f "$SERVER_BACKUP_FILE" ]]; then
    echo "Restoring the previous server.js." >&2
    cp -a "$SERVER_BACKUP_FILE" "$APP_DIR/server.js"
    systemctl restart "$SERVICE_NAME" || true
  fi
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
node "$BUILD_DIR/scripts/patch-vps-server.mjs" "$APP_DIR/server.js"
node --check "$APP_DIR/server.js"
SERVER_PATCHED=1

mkdir "$STAGE_DIR"
cp -a "$BUILD_DIR/dist/client/." "$STAGE_DIR/"
chmod -R u=rwX,go=rX "$STAGE_DIR"

mv "$APP_DIR/public" "$PREVIOUS_DIR"
mv "$STAGE_DIR" "$APP_DIR/public"
SWITCHED=1

systemctl restart "$SERVICE_NAME"
systemctl is-active --quiet "$SERVICE_NAME"
wait_for_endpoint GET http://127.0.0.1:3000/
wait_for_endpoint GET http://127.0.0.1:3000/services
wait_for_endpoint OPTIONS http://127.0.0.1:3000/api/brief
verify_metrika

rm -rf -- "$PREVIOUS_DIR"
SWITCHED=0
SERVER_PATCHED=0
trap - ERR

echo "Deployment completed. Backup: $BACKUP_FILE"
echo "Server backup: $SERVER_BACKUP_FILE"
echo "Service: $(systemctl is-active "$SERVICE_NAME")"
