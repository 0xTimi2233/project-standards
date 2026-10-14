#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
    echo "用法: $0 <owner/repo>"
    exit 1
fi

REPO="$1"
echo "==> 正在同步仓库属性配置至 $REPO ..."
gh repo edit "$REPO" --enable-auto-merge --delete-branch-on-merge > /dev/null
echo "✓ 仓库属性配置同步完成: $REPO"
