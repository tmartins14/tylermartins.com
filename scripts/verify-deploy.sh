#!/usr/bin/env bash
# Build the site the way Vercel does, so deploy failures surface locally.
#
# Why this exists: this repo is one workspace of the `my-portfolio` monorepo, so
# locally `node_modules/footballd3` is a SYMLINK to football-analytics/src/footballd3
# and the workspace root hoists dependencies. Vercel gets neither — it clones this
# repo alone and runs a clean install from the registry. That gap has shipped broken
# builds that were green locally.
#
# This script removes the gap: tracked files only (as GitHub would serve them),
# no workspace parent, no symlink, `npm ci` from the committed lockfile.
#
# Usage: ./scripts/verify-deploy.sh   (or: make verify-deploy)
# Exit 0 = the deploy should build. Non-zero = it would not.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# This tests HEAD, because that is what gets pushed. Uncommitted work is invisible here.
if [ -n "$(git status --porcelain)" ]; then
  echo "WARNING: working tree has uncommitted changes."
  echo "         This verifies HEAD only — commit first to test what you'll actually push."
  echo
fi

if [ ! -f package-lock.json ]; then
  echo "FAIL: no package-lock.json committed. Vercel would resolve dependencies"
  echo "      unpinned on every build. Run 'npm install' and commit the lockfile."
  exit 1
fi

SIM="$(mktemp -d)"
trap 'rm -rf "$SIM"' EXIT

echo "==> Exporting tracked files at HEAD (this is what GitHub serves Vercel)"
git archive HEAD | tar -x -C "$SIM"

# Guard: the export must be self-contained. A file that only exists because of the
# workspace (or is gitignored) will be missing here, exactly as it would be on Vercel.
for required in package.json package-lock.json; do
  if [ ! -f "$SIM/$required" ]; then
    echo "FAIL: $required is not tracked by git — Vercel would never see it."
    exit 1
  fi
done

cd "$SIM"

echo "==> Clean install from the lockfile (npm ci, no workspace root)"
# npm ci also fails outright if package.json and package-lock.json disagree,
# which is its own useful check.
npm ci --no-audit --no-fund

# Any workspace-linked dependency that never made it to the registry shows up here
# as a symlink or a missing directory rather than a real installed package.
if [ -L node_modules/footballd3 ]; then
  echo "FAIL: footballd3 resolved to a symlink even outside the workspace."
  exit 1
fi

echo "==> Production build"
npm run build

echo
echo "PASS: clean-install build succeeded. This is what Vercel will do."
