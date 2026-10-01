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

# 获取当前仓库的 Ruleset 列表，同时捕获错误
if ! RESPONSE=$(gh api "repos/$REPO/rulesets" 2>&1); then
    if echo "$RESPONSE" | grep -q "Upgrade to GitHub Pro"; then
        echo "  ℹ 提示: 当前为 GitHub Free 私有仓库，平台不支持 Ruleset，已跳过远端同步"
        exit 0
    fi
    echo "错误: 获取 Ruleset 失败: $RESPONSE"
    exit 1
fi

# 从合法 JSON 响应中提取现有规则集 ID
EXISTING_ID=$(echo "$RESPONSE" | jq -r '.[] | select(.name=="default-branch-protection") | .id' 2>/dev/null || true)

if [ -n "$EXISTING_ID" ] && [ "$EXISTING_ID" != "null" ]; then
    echo "  * 更新已有 Ruleset (ID: $EXISTING_ID)..."
    gh api --method PUT "repos/$REPO/rulesets/$EXISTING_ID" --input "$RULESET_FILE" > /dev/null
else
    echo "  + 创建新 Ruleset..."
    gh api --method POST "repos/$REPO/rulesets" --input "$RULESET_FILE" > /dev/null
fi

echo "✓ 分支保护规则集同步完成: $REPO"
