#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
    echo "用法: $0 <owner/repo>"
    exit 1
fi

REPO="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RULESET_FILE="$ROOT_DIR/.github/ruleset.json"

if [ ! -f "$RULESET_FILE" ]; then
    echo "错误: 未找到规则集配置文件: $RULESET_FILE"
    exit 1
fi

echo "==> 正在同步分支保护规则集至 $REPO ..."

EXISTING_ID=$(gh api "repos/$REPO/rulesets" --jq '.[] | select(.name=="default-branch-protection") | .id' 2>/dev/null || true)

if [ -n "$EXISTING_ID" ]; then
    echo "  * 更新已有 Ruleset (ID: $EXISTING_ID)..."
    gh api --method PUT "repos/$REPO/rulesets/$EXISTING_ID" --input "$RULESET_FILE" > /dev/null
else
    echo "  + 创建新 Ruleset..."
    gh api --method POST "repos/$REPO/rulesets" --input "$RULESET_FILE" > /dev/null
fi

echo "✓ 分支保护规则集同步完成: $REPO"
