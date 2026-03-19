#!/bin/sh
# build: Run with Bun to avoid Node.js v22+ cpSync virtiofs bug.
#        Node.js v22/v24+'s native cpSyncCopyDir fails on virtiofs mounts.
# deploy: Run with Node.js because wrangler's getPlatformProxy uses Node.js
#         IPC that is incompatible with Bun, causing a hang.

BUN="${BUN:-${HOME}/.proto/shims/bun}"
NODE="${NODE:-node}"

# Resolve CLI entry point from pnpm store
CLI=$(ls node_modules/.pnpm/@opennextjs+cloudflare*/node_modules/@opennextjs/cloudflare/dist/cli/index.js 2>/dev/null | head -1)

if [ -z "$CLI" ]; then
  echo "Error: opennextjs-cloudflare CLI not found in node_modules" >&2
  exit 1
fi

# Use Bun for build (cpSync workaround), Node.js for deploy (wrangler IPC)
case "$1" in
  deploy|populateCache)
    exec "$NODE" "$CLI" "$@"
    ;;
  *)
    exec "$BUN" run "$CLI" "$@"
    ;;
esac
