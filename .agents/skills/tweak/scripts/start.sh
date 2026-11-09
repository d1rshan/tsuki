#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "usage: start.sh <branch> <agent-name>" >&2
  exit 2
fi

branch=$1
agent=$2
[[ ${HERDR_ENV:-} == 1 ]] || { echo 'This workflow requires a Herdr-managed pane.' >&2; exit 1; }
[[ $agent =~ ^[a-z][a-z0-9_-]{0,31}$ ]] || { echo 'Invalid agent name.' >&2; exit 1; }
git check-ref-format --branch "$branch" >/dev/null
root=$(git rev-parse --show-toplevel)
cd "$root"

path=$(treehouse get --lease --branch "$branch" --lease-holder "$agent")
printf 'worktree: %s\nbranch: %s\nagent: %s\n' "$path" "$branch" "$agent"
(cd "$path" && bun install)

workspace=$(herdr workspace create --cwd "$path" --label "$agent" --no-focus)
printf '%s\n' "$workspace"
pane=$(printf '%s' "$workspace" | python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["root_pane"]["pane_id"])')
herdr agent start "$agent" --kind codex --pane "$pane" -- --no-daemon --yolo
