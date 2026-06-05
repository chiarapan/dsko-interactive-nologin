#!/usr/bin/env bash
set -euo pipefail

# Render build script: ensure Rust toolchain is available for building Python packages
# that include Rust extensions (maturin/cargo). Installs deps then pip installs.

export CARGO_HOME="$HOME/.cargo"
export RUSTUP_HOME="$HOME/.rustup"
export PATH="$CARGO_HOME/bin:$PATH"

# Install build prerequisites if available.
if command -v apt-get >/dev/null 2>&1; then
  apt-get update
  apt-get install -y gfortran ninja-build build-essential python3-dev
fi

# Install rustup non-interactively if not present
if ! command -v rustup >/dev/null 2>&1; then
  curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  source "$HOME/.cargo/env" || true
  rustup default stable
fi

python -m pip install --upgrade pip setuptools wheel maturin meson ninja

# Install backend requirements (assumes backend/requirements.txt exists)
pip install -r backend/requirements_minimal.txt
