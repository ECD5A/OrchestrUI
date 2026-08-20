#!/usr/bin/env bash
#
# OrchestrUI
# Copyright (c) 2026 ECD5A
# Licensed under the MIT License.
# https://github.com/ECD5A/OrchestrUI
# SPDX-License-Identifier: MIT
#
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${HOME}/.agents/skills"
mkdir -p "$DEST"
for skill in ui-library-router ui-orchestrator ui-quality-audit; do
  src="$ROOT/.agents/skills/$skill"; dst="$DEST/$skill"
  if [ -e "$dst" ] || [ -L "$dst" ]; then rm -rf "$dst"; fi
  ln -s "$src" "$dst"
  echo "Installed $skill -> $dst"
done
echo "OrchestrUI skills installed."
