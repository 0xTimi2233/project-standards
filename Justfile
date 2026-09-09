default:
    @just --list

# 将标准标签对齐到指定的 GitHub 仓库，用法如 just sync-labels 0xTimi2233/target-repo
sync-labels repo:
    #!/usr/bin/env bash
    set -euo pipefail
    manifest="{{justfile_directory()}}/.github/labels.json"
    wanted=$(mktemp)
    jq -r '.[].name' "$manifest" | sort > "$wanted"
    gh label list --repo "{{repo}}" --json name --jq '.[].name' | sort | comm -13 "$wanted" - | while read -r name; do
        gh label delete "$name" --repo "{{repo}}" --yes
    done
    rm -f "$wanted"
    jq -c '.[]' "$manifest" | while read -r item; do
        name=$(echo "$item" | jq -r .name)
        color=$(echo "$item" | jq -r .color)
        desc=$(echo "$item" | jq -r .description)
        gh label create "$name" --color "$color" --description "$desc" --repo "{{repo}}" --force
    done
