#!/usr/bin/env bash
# Clone data from remote Supabase Postgres to local Postgres and switch Prisma to local.
# Usage:
#   bash scripts/clone-db-to-local.sh [REMOTE_DATABASE_URL] [LOCAL_DATABASE_URL]
# If args are omitted:
#   REMOTE_DATABASE_URL defaults to DATABASE_URL from .env
#   LOCAL_DATABASE_URL defaults to postgresql://postgres:postgres@localhost:5432/xpfarmer?schema=public

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

# --- Helpers ---
log() { echo "[clone-db] $*"; }
err() { echo "[clone-db][ERROR] $*" >&2; }

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "Required command '$1' not found in PATH"; exit 1; fi
}

# --- Check required tools ---
need_cmd psql
need_cmd pg_dump
need_cmd sed
need_cmd awk
need_cmd npx

# --- Resolve URLs ---
ENV_FILE=".env"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC2046
  export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ENV_FILE" | xargs -0 -I{} bash -c 'printf %s "{}"' | tr '\n' ' ')
fi

REMOTE_URL="${1:-${DATABASE_URL:-}}"
if [[ -z "${REMOTE_URL:-}" ]]; then
  err "REMOTE_DATABASE_URL not provided and DATABASE_URL missing in .env"; exit 1; fi

LOCAL_URL_DEFAULT="postgresql://postgres:postgres@localhost:5432/xpfarmer?schema=public"
LOCAL_URL="${2:-${LOCAL_DATABASE_URL:-$LOCAL_URL_DEFAULT}}"

# --- Ensure local DB exists ---
log "Ensuring local database exists for URL: $LOCAL_URL"
# Extract dbname from LOCAL_URL
DB_NAME=$(echo "$LOCAL_URL" | awk -F'/' '{print $4}' | awk -F'?' '{print $1}')
if [[ -z "$DB_NAME" ]]; then err "Failed to parse local database name from LOCAL_URL"; exit 1; fi

if ! psql "postgresql://postgres:postgres@localhost:5432/postgres" -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  log "Creating local database '${DB_NAME}'"
  createdb "$DB_NAME"
else
  log "Local database '${DB_NAME}' already exists"
fi

# --- Create/Sync schema locally from Prisma ---
log "Pushing Prisma schema to local DB"
DATABASE_URL="$LOCAL_URL" npx prisma db push
log "Generating Prisma client"
DATABASE_URL="$LOCAL_URL" npx prisma generate

# --- Dump DATA ONLY from remote and restore into local ---
WORK_SQL="$(mktemp -t xpfarmer_data.XXXXXX).sql"
log "Dumping remote data (data-only) to $WORK_SQL"
pg_dump --data-only --column-inserts --no-owner --no-privileges "$REMOTE_URL" > "$WORK_SQL"

log "Restoring data into local"
psql "$LOCAL_URL" -v ON_ERROR_STOP=1 -f "$WORK_SQL"

# --- Update .env to point to local ---
if [[ -f "$ENV_FILE" ]]; then
  TS=$(date +%Y%m%d_%H%M%S)
  cp "$ENV_FILE" "${ENV_FILE}.backup_${TS}"
  log "Backed up $ENV_FILE to ${ENV_FILE}.backup_${TS}"
  # macOS/BSD sed requires an empty string for -i extension
  LOCAL_ESC=$(printf '%s' "$LOCAL_URL" | sed -e 's/[\/&]/\\&/g')
  if grep -q '^DATABASE_URL=' "$ENV_FILE"; then
    sed -i '' -E "s|^DATABASE_URL=.*|DATABASE_URL=${LOCAL_ESC}|" "$ENV_FILE"
  else
    printf '\nDATABASE_URL=%s\n' "$LOCAL_URL" >> "$ENV_FILE"
  fi
  log "Updated .env DATABASE_URL to local"
else
  printf 'DATABASE_URL=%s\n' "$LOCAL_URL" > "$ENV_FILE"
  log "Created .env with local DATABASE_URL"
fi

log "Done. Your backend is now configured to use the local database."
log "Run: npx prisma generate && yarn start:dev (or npm run start:dev)"
