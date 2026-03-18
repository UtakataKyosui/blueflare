FROM mcr.microsoft.com/devcontainers/base:ubuntu

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    pkg-config \
    sudo \
    xz-utils \
    unzip \
    clang \
    mold \
    sox \
    && rm -rf /var/lib/apt/lists/*

# gh (GitHub CLI)
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
      | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && \
    chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
      > /etc/apt/sources.list.d/github-cli.list && \
    apt-get update && apt-get install -y gh && \
    rm -rf /var/lib/apt/lists/*

# utakata ユーザーを作成
RUN useradd -m -s /bin/bash -G sudo utakata \
    && echo "utakata ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/utakata \
    && chmod 0440 /etc/sudoers.d/utakata

# jj (Jujutsu VCS) - バイナリ直接インストール (root で /usr/local/bin に配置)
RUN JJ_VERSION="0.37.0" && \
    ARCH=$(uname -m) && \
    case "$ARCH" in \
      x86_64)  ARCH_SUFFIX="x86_64-unknown-linux-musl" ;; \
      aarch64) ARCH_SUFFIX="aarch64-unknown-linux-musl" ;; \
      *) echo "Unsupported architecture: $ARCH" >&2; exit 1 ;; \
    esac && \
    curl -fsSL "https://github.com/jj-vcs/jj/releases/download/v${JJ_VERSION}/jj-v${JJ_VERSION}-${ARCH_SUFFIX}.tar.gz" \
      | tar xz -C /usr/local/bin ./jj

USER utakata
WORKDIR /home/utakata

# umask を 0022 に固定してファイル生成時の権限不整合を防ぐ
RUN echo 'umask 0022' >> ~/.bashrc && \
    echo 'umask 0022' >> ~/.profile

# bind mount の親ディレクトリを utakata 所有で事前作成
RUN mkdir -p /home/utakata/.config /home/utakata/.gemini /home/utakata/.codex


ENV PROTO_HOME="/home/utakata/.proto"
ENV PATH="/home/utakata/.local/bin:$PROTO_HOME/shims:$PROTO_HOME/bin:/usr/local/bin:$PATH"

# proto (toolchain manager)
RUN curl -fsSL https://moonrepo.dev/install/proto.sh | bash -s -- --no-profile

# proto / claude の PATH を .bashrc にも追加 (インタラクティブシェル用)
RUN echo 'export PROTO_HOME="$HOME/.proto"' >> ~/.bashrc && \
    echo 'export PATH="$HOME/.local/bin:$PROTO_HOME/shims:$PROTO_HOME/bin:$PATH"' >> ~/.bashrc

# Node.js LTS (proto 管理) + Gemini CLI / Codex
RUN proto install node 24.14.0 && \
    proto pin node 24.14.0 --to global && \
    NODE_BIN=$(ls -d /home/utakata/.proto/tools/node/*/bin | head -1) && \
    "$NODE_BIN/npm" config set prefix "$HOME/.local" && \
    "$NODE_BIN/npm" install -g @google/gemini-cli @openai/codex

# Rust + pnpm (proto 管理, better-server/.prototools のバージョンに合わせる)
RUN proto install rust 1.94.0 && \
    proto install pnpm 10.32.1

# cargo-binstall / cargo-make
RUN . "$HOME/.cargo/env" && \
    cargo install cargo-binstall && \
    cargo binstall cargo-make --no-confirm

# Claude Code CLI (ネイティブインストーラー)
RUN curl -fsSL https://claude.ai/install.sh | bash -s -- 2.1.78

# proto管理のnode/npm/npxをシステムPATHからも参照できるようシンボリックリンクを作成
# (Claude Code hookなどbashrcを読まない環境向け)
# - node: proto shimが存在するのでshimへリンク
# - npm/npx: protoはshimを作らないため、globalピンのバージョンディレクトリへ直接リンク
USER root
RUN NODE_VERSION=$(grep '^node' /home/utakata/.prototools | sed 's/node = "\([^"]*\)"/\1/') \
    && ln -sf /home/utakata/.proto/shims/node /usr/local/bin/node \
    && ln -sf "/home/utakata/.proto/tools/node/${NODE_VERSION}/bin/npm" /usr/local/bin/npm \
    && ln -sf "/home/utakata/.proto/tools/node/${NODE_VERSION}/bin/npx" /usr/local/bin/npx
USER utakata
