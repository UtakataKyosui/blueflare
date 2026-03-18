#!/bin/bash
set -e

# .open-next はビルドアーティファクト。ホスト側の権限不整合を防ぐため削除
rm -rf /workspaces/sandbox/.open-next

# jj ユーザー設定
mkdir -p ~/.config/jj
printf '[user]\nname = "%s"\nemail = "%s"\n' "$JJ_USER" "$JJ_EMAIL" > ~/.config/jj/config.toml

# better-server セットアップ
. "$HOME/.cargo/env"
cargo make install-tools
