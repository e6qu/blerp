#!/usr/bin/env bash
# Check all internal markdown links in the repository.
# Usage: bash scripts/check-links.sh
# Exit code 0 = all links valid, 1 = broken links found.

set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

broken=0
checked=0

# Extract all markdown link targets from a file, handling multiple links per line.
extract_targets() {
  perl -ne 'while (/\[[^\]]*\]\(([^)]+)\)/g) { print "$1\n" }' "$1" 2>/dev/null
}

while IFS= read -r file; do
  dir=$(dirname "$file")

  while IFS= read -r target; do
    [ -z "$target" ] && continue

    # Strip anchor fragments
    target_no_anchor="${target%%#*}"

    # Skip empty (anchor-only), external, and mailto links
    [ -z "$target_no_anchor" ] && continue
    case "$target_no_anchor" in
      http://*|https://*|mailto:*) continue ;;
    esac

    checked=$((checked + 1))

    if [[ "$target_no_anchor" == /* ]]; then
      # VitePress absolute path — resolve from apps/docs/
      vp_target="apps/docs${target_no_anchor}"
      if [ -f "$vp_target" ] || [ -f "${vp_target}.md" ] || [ -f "${vp_target%/}/index.md" ]; then
        continue
      fi
      echo "BROKEN  $file -> $target"
      echo "        (resolved to $vp_target)"
      broken=$((broken + 1))
    else
      # Relative path — resolve from file's directory
      resolved="$dir/$target_no_anchor"
      if [ -f "$resolved" ] || [ -f "${resolved}.md" ] || [ -f "${resolved%/}/index.md" ]; then
        continue
      fi
      if [ -d "$resolved" ] && [ -f "$resolved/index.md" ]; then
        continue
      fi
      echo "BROKEN  $file -> $target"
      echo "        (resolved to $resolved)"
      broken=$((broken + 1))
    fi
  done < <(extract_targets "$file")
done < <(find . -name '*.md' -not -path '*/node_modules/*' -not -path '*/.vitepress/cache/*' -not -path '*/tasks/*')

echo ""
if [ "$broken" -gt 0 ]; then
  echo "Found $broken broken link(s) out of $checked checked."
  exit 1
else
  echo "All $checked internal markdown links are valid."
  exit 0
fi
