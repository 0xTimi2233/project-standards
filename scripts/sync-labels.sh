#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
    echo "用法: $0 <owner/repo>"
    exit 1
fi

REPO="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MANIFEST="$ROOT_DIR/.github/labels.json"

if [ ! -f "$MANIFEST" ]; then
    echo "错误: 未找到标签配置文件: $MANIFEST"
    exit 1
fi

echo "==> 正在同步标签至 $REPO ..."

WANTED=$(mktemp)
jq -r '.[].name' "$MANIFEST" | sort > "$WANTED"

# 删除目标仓库中未在基线中定义的非标标签
gh label list --repo "$REPO" --json name --jq '.[].name' | sort | comm -13 "$WANTED" - | while read -r name; do
    if [ -n "$name" ]; then
        echo "  - 删除非标标签: $name"
        gh label delete "$name" --repo "$REPO" --yes
    fi
done
rm -f "$WANTED"

# 批量创建或覆盖基准标签
jq -c '.[]' "$MANIFEST" | while read -r item; do
    name=$(echo "$item" | jq -r .name)
    color=$(echo "$item" | jq -r .color)
    desc=$(echo "$item" | jq -r .description)
    echo "  + 同步标签: $name"
    gh label create "$name" --color "$color" --description "$desc" --repo "$REPO" --force >/dev/null
done

echo "✓ 标签同步完成: $REPO"
