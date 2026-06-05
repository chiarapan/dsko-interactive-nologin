#!/usr/bin/env bash
set -euo pipefail

# Render build script: ensure Rust toolchain is available for building Python packages
# that include Rust extensions (maturin/cargo). Installs deps then pip installs.

export CARGO_HOME="$HOME/.cargo"
export RUSTUP_HOME="$HOME/.rustup"
export PATH="$CARGO_HOME/bin:$PATH"

# Install rustup non-interactively if not present
if ! command -v rustup >/dev/null 2>&1; then
  curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  source "$HOME/.cargo/env" || true
fi

# Ensure stable toolchain is installed and selected
source "$HOME/.cargo/env" || true
rustup toolchain install stable
rustup default stable

python -m pip install --upgrade pip setuptools wheel maturin

# Install backend requirements using binary packages when available.
# Render build environments may not allow apt-get, so avoid forcing system package installs.
pip install -r backend/requirements.txt --prefer-binary
