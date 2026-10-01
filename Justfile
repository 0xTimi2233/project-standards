default:
    @just --list

# 初始化目标本地项目的基线配置，用法：just init /path/to/project
init target:
    @bash {{justfile_directory()}}/scripts/init-repo.sh "{{target}}"

# 同步标准标签至指定 GitHub 仓库，用法：just sync-labels 0xTimi2233/target-repo
sync-labels repo:
    @bash {{justfile_directory()}}/scripts/sync-labels.sh "{{repo}}"

# 同步默认分支保护规则集至指定 GitHub 仓库，用法：just sync-ruleset 0xTimi2233/target-repo
sync-ruleset repo:
    @bash {{justfile_directory()}}/scripts/sync-ruleset.sh "{{repo}}"

# 同步指定 GitHub 仓库的全部远端配置（标签 + 分支保护规则集），用法：just sync-github 0xTimi2233/target-repo
sync-github repo:
    @just sync-labels "{{repo}}"
    @just sync-ruleset "{{repo}}"

# 一键应用规范至本地项目及远端仓库，用法：just apply /path/to/project
apply target:
    #!/usr/bin/env bash
    set -euo pipefail
    target_dir="{{target}}"
    "{{just_executable()}}" init "$target_dir"
    if [ -d "$target_dir/.git" ]; then
        remote_url=$(cd "$target_dir" && git config --get remote.origin.url || true)
        if [ -n "$remote_url" ]; then
            repo_slug=$(echo "$remote_url" | sed -E 's/.*github.com[:\/]([^\/]+\/[^\/\.]+)(\.git)?/\1/')
            if [ -n "$repo_slug" ] && [ "$repo_slug" != "$remote_url" ]; then
                echo "==> 检测到关联远端仓库: $repo_slug"
                "{{just_executable()}}" sync-github "$repo_slug"
            fi
        fi
    fi
