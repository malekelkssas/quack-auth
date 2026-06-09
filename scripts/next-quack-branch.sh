#!/usr/bin/env bash
# Create the next quack-XX-<feature> branch (one branch per Cursor chat/agent).
# Usage: ./scripts/next-quack-branch.sh <feature-slug>
# Example: ./scripts/next-quack-branch.sh husky-ci → quack-01-husky-ci (if first)
#
# Scans local + remote refs and active git worktrees so parallel Cursor worktrees
# (e.g. quack-04-*, quack-05-*) are not skipped when picking the next XX.

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

# Collect quack-XX-* names from refs (local + origin) and checked-out worktree branches.
quack_branches="$(
  {
    git for-each-ref --format='%(refname:short)' refs/heads/ 2>/dev/null || true
    git for-each-ref --format='%(refname:short)' refs/remotes/origin/ 2>/dev/null \
      | sed 's|^origin/||' || true
    git worktree list --porcelain 2>/dev/null \
      | awk '/^branch / { sub(/^branch refs\/heads\//, ""); print }' || true
  } | grep -E '^quack-[0-9]+-' | sort -u
)"

worktree_quack="$(
  git worktree list 2>/dev/null | grep -E '\[quack-[0-9]+-' || true
)"

if [ -n "$worktree_quack" ]; then
  echo "Active worktrees on quack branches (included when picking next XX):" >&2
  echo "$worktree_quack" | sed 's/^/  /' >&2
fi

max=0
while IFS= read -r branch; do
  [ -n "$branch" ] || continue
  num="${branch#quack-}"
  num="${num%%-*}"
  if [[ "$num" =~ ^[0-9]+$ ]]; then
    num_dec=$((10#$num))
    if [ "$num_dec" -gt "$max" ]; then
      max="$num_dec"
    fi
  fi
done <<< "$quack_branches"

next=$((max + 1))
printf -v padded '%02d' "$next"
name="quack-${padded}-${slug}"

if git show-ref --verify --quiet "refs/heads/${name}"; then
  echo "Branch already exists: ${name}" >&2
  exit 1
fi

git checkout -b "${name}"
echo "${name}"
