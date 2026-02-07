#!/bin/sh
set -e

# ENCRYPTION_SECRET이 없으면 자동 생성
if [ -z "$ENCRYPTION_SECRET" ]; then
  export ENCRYPTION_SECRET=$(cat /dev/urandom | tr -dc 'a-f0-9' | head -c 64)
  echo "[entrypoint] ENCRYPTION_SECRET auto-generated"
fi

exec "$@"
