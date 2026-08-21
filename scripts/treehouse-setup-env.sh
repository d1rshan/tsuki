#!/bin/sh
set -eu

repo_git_dir=$(git rev-parse --path-format=absolute --git-common-dir)
repo_root=$(dirname "$repo_git_dir")

for relative_path in apps/api/.env apps/web/.env packages/db/.env; do
  source_path="$repo_root/$relative_path"
  target_path="$PWD/$relative_path"

  [ -e "$source_path" ] || continue
  [ -e "$target_path" ] || ln -s "$source_path" "$target_path"
done
