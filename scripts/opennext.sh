#!/bin/sh
# build: Run with Bun to avoid Node.js v22+ cpSync virtiofs bug.
#        Node.js v22/v24+'s native cpSyncCopyDir fails on virtiofs mounts.
# deploy: Run with Node.js because wrangler's getPlatformProxy uses Node.js
#         IPC that is incompatible with Bun, causing a hang.

NODE="${NODE:-node}"
# Resolve Bun: proto shim → system bun → fallback to empty (use Node.js)
if [ -z "$BUN" ]; then
  PROTO_BUN="${HOME}/.proto/shims/bun"
  if [ -x "$PROTO_BUN" ]; then
    BUN="$PROTO_BUN"
  else
    BUN=$(command -v bun 2>/dev/null || true)
  fi
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
# For build: pass --skipNextBuild since `next build` was already run by npm run build
case "$1" in
  deploy|populateCache)
    exec "$NODE" "$CLI" "$@"
    ;;
  build)
    shift
    if [ -n "$BUN" ]; then
      exec "$BUN" run "$CLI" build --skipNextBuild "$@"
    else
      exec "$NODE" "$CLI" build --skipNextBuild "$@"
    fi
    ;;
  *)
    if [ -n "$BUN" ]; then
      exec "$BUN" run "$CLI" "$@"
    else
      exec "$NODE" "$CLI" "$@"
    fi
    ;;
esac
