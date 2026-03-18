#!/bin/sh
# Run opennextjs-cloudflare with Bun to avoid Node.js v22+ cpSync virtiofs bug.
# Node.js v22/v24's native cpSyncCopyDir fails on virtiofs mounts.
# Bun uses its own fs implementation that doesn't have this issue.

BUN="${BUN:-${HOME}/.proto/shims/bun}"

# Resolve CLI entry point from pnpm store
CLI=$(ls node_modules/.pnpm/@opennextjs+cloudflare*/node_modules/@opennextjs/cloudflare/dist/cli/index.js 2>/dev/null | head -1)

if [ -z "$CLI" ]; then
  echo "Error: opennextjs-cloudflare CLI not found in node_modules" >&2
  exit 1
fi

exec "$BUN" run "$CLI" "$@"
