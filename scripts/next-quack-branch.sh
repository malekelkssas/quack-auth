#!/usr/bin/env bash
# Create the next quack-XX-<feature> branch (one branch per Cursor chat/agent).
# Usage: ./scripts/next-quack-branch.sh <feature-slug>
# Example: ./scripts/next-quack-branch.sh husky-ci → quack-01-husky-ci (if first)

set -euo pipefail

if [ $# -lt 1 ] || [ -z "${1// }" ]; then
  echo "Usage: $0 <feature-slug>" >&2
  echo "Example: $0 auth-login" >&2
  exit 1
fi

slug="$1"
slug="${slug#quack-}"
slug="$(echo "$slug" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')"

if [ -z "$slug" ]; then
  echo "Invalid feature slug." >&2
  exit 1
fi

git fetch origin --prune 2>/dev/null || true

max=0
while IFS= read -r branch; do
  num="${branch#quack-}"
  num="${num%%-*}"
  if [[ "$num" =~ ^[0-9]+$ ]] && [ "$num" -gt "$max" ]; then
    max="$num"
  fi
done < <(git branch -a | sed 's/^[* ]*//; s|remotes/origin/||' | grep -E '^quack-[0-9]+-' || true)

next=$((max + 1))
printf -v padded '%02d' "$next"
name="quack-${padded}-${slug}"

if git show-ref --verify --quiet "refs/heads/${name}"; then
  echo "Branch already exists: ${name}" >&2
  exit 1
fi

git checkout -b "${name}"
echo "${name}"
