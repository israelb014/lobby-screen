#!/usr/bin/env bash
# Writes a new version to version.json. Every screen reloads itself within ~5 minutes
# after this change is pushed to GitHub.
set -euo pipefail
cd "$(dirname "$0")/.."
v="$(date -u +%Y%m%d-%H%M%S)"
printf '{\n  "version": "%s"\n}\n' "$v" > version.json
echo "version.json -> $v"
