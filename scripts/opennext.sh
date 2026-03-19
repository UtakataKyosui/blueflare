#!/bin/sh
# build: Run with Bun to avoid Node.js v22+ cpSync virtiofs bug.
#        Node.js v22/v24+'s native cpSyncCopyDir fails on virtiofs mounts.
# deploy: Run with Node.js because wrangler's getPlatformProxy uses Node.js
#         IPC that is incompatible with Bun, causing a hang.

NODE="${NODE:-node}"
# Resolve Bun: proto shim → system bun → fallback to Node.js
if [ -x "${BUN:-${HOME}/.proto/shims/bun}" ]; then
  BUN="${BUN:-${HOME}/.proto/shims/bun}"
else
  BUN=$(command -v bun 2>/dev/null || echo "")
fi

# Resolve CLI entry point (npm/yarn/bun direct path first, pnpm store path fallback)
DIRECT_CLI="node_modules/@opennextjs/cloudflare/dist/cli/index.js"
PNPM_CLI=$(ls node_modules/.pnpm/@opennextjs+cloudflare*/node_modules/@opennextjs/cloudflare/dist/cli/index.js 2>/dev/null | head -1)

if [ -f "$DIRECT_CLI" ]; then
  CLI="$DIRECT_CLI"
elif [ -n "$PNPM_CLI" ]; then
  CLI="$PNPM_CLI"
else
  echo "Error: opennextjs-cloudflare CLI not found in node_modules" >&2
  exit 1
fi

# Use Bun for build (cpSync workaround), Node.js for deploy (wrangler IPC)
case "$1" in
  deploy|populateCache)
    exec "$NODE" "$CLI" "$@"
    ;;
  *)
    if [ -n "$BUN" ]; then
      exec "$BUN" run "$CLI" "$@"
    else
      exec "$NODE" "$CLI" "$@"
    fi
    ;;
esac
