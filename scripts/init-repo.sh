#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
    echo "用法: $0 <target-project-path>"
    exit 1
fi

TARGET_DIR="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ ! -d "$TARGET_DIR" ]; then
    echo "错误: 目标目录不存在: $TARGET_DIR"
    exit 1
fi

TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"
echo "==> 正在初始化工程规范基线至: $TARGET_DIR"

# 1. 同步 .gitmessage
echo "  -> 复制 .gitmessage ..."
cp "$ROOT_DIR/.gitmessage" "$TARGET_DIR/.gitmessage"

# 如果目标是 Git 仓库，设置本地 commit.template
if [ -d "$TARGET_DIR/.git" ]; then
    (cd "$TARGET_DIR" && git config --local commit.template .gitmessage)
    echo "  ✓ 已配置本地 Git commit.template"
fi

# 2. 同步 .github/ 目录（保留目标项目已有未冲突文件，覆盖基线文件）
echo "  -> 同步 .github/ 协作模版与配置 ..."
mkdir -p "$TARGET_DIR/.github/ISSUE_TEMPLATE"
cp "$ROOT_DIR/.github/PULL_REQUEST_TEMPLATE.md" "$TARGET_DIR/.github/"
cp "$ROOT_DIR/.github/labels.json" "$TARGET_DIR/.github/"
cp "$ROOT_DIR/.github/ruleset.json" "$TARGET_DIR/.github/"
cp "$ROOT_DIR/.github/ISSUE_TEMPLATE/config.yaml" "$TARGET_DIR/.github/ISSUE_TEMPLATE/"
cp "$ROOT_DIR/.github/ISSUE_TEMPLATE/bug_report.yaml" "$TARGET_DIR/.github/ISSUE_TEMPLATE/"
cp "$ROOT_DIR/.github/ISSUE_TEMPLATE/feature_support.yaml" "$TARGET_DIR/.github/ISSUE_TEMPLATE/"

# 3. 幂等合并 .gitignore
if [ ! -f "$TARGET_DIR/.gitignore" ]; then
    echo "  -> 创建 .gitignore ..."
    cp "$ROOT_DIR/.gitignore" "$TARGET_DIR/.gitignore"
else
    echo "  -> 合并通用忽略规则至现有 .gitignore ..."
    TEMP_FILE=$(mktemp)
    # 逐行检查基准规则，若未出现则追加
    while IFS= read -r line || [ -n "$line" ]; do
        # 忽略纯空行和注释行去重，只检查实际忽略模式
        if [[ -z "$line" || "$line" =~ ^# ]]; then
            continue
        fi
        if ! grep -Fxq "$line" "$TARGET_DIR/.gitignore"; then
            echo "$line" >> "$TEMP_FILE"
        fi
    done < "$ROOT_DIR/.gitignore"

    if [ -s "$TEMP_FILE" ]; then
        echo "" >> "$TARGET_DIR/.gitignore"
        echo "# --- Standard Baseline Ignore Rules ---" >> "$TARGET_DIR/.gitignore"
        cat "$TEMP_FILE" >> "$TARGET_DIR/.gitignore"
        echo "  ✓ 追加了新忽略项"
    else
        echo "  ✓ .gitignore 已包含全部通用规则"
    fi
    rm -f "$TEMP_FILE"
fi

echo "✓ 本地规范基线初始化完成: $TARGET_DIR"
