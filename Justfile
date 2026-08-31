default:
    @just --list

# 配置本机全局 Git 提交模板
apply-git-template:
    git config --global commit.template {{justfile_directory()}}/git/.gitmessage

# 批量同步标准标签到指定的 GitHub 仓库，用法如 just sync-labels 0xTimi2233/target-repo
sync-labels repo:
    jq -c '.[]' {{justfile_directory()}}/github/labels.json | while read -r item; do \
        name=$$(echo "$$item" | jq -r .name); \
        color=$$(echo "$$item" | jq -r .color); \
        desc=$$(echo "$$item" | jq -r .description); \
        gh label create "$$name" --color "$$color" --description "$$desc" --repo {{repo}} --force; \
    done
