#!/bin/bash
# Stop hook: advisory docs-drift notice. Never blocks, always exits 0.
set -u

input=$(cat)
[ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

docs=$(git status --porcelain -- CLAUDE.md AGENTS.md .claude/rules | wc -l | tr -d ' ')
[ "$docs" -gt 0 ] && exit 0

# Only nag on structural change: schema/deps, or a domain directory that isn't tracked yet.
structural=$(git status --porcelain -- schema.sql package.json | wc -l | tr -d ' ')
new_dirs=$(git status --porcelain -- lib app/components \
  | awk '{print $NF}' \
  | awk -F/ 'NF>2 {print $1"/"$2}' \
  | sort -u \
  | while read -r d; do git ls-files --error-unmatch "$d" >/dev/null 2>&1 || echo "$d"; done \
  | wc -l | tr -d ' ')

if [ "$structural" -gt 0 ] || [ "$new_dirs" -gt 0 ]; then
  jq -n '{systemMessage: "Docs drift: schema.sql/package.json changed or a new domain directory appeared, but CLAUDE.md, AGENTS.md and .claude/rules/ are untouched. Update the affected rule, or run /doctor."}'
fi

exit 0
