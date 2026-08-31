# 工程规范基线

跨语言、跨技术栈通用的工程元数据规范与基线配置，作为项目协作与自动化智能体的单一真实事实源。仓库自身即遵循该标准构建。

## 目录与文件结构

- [.gitmessage](/Users/sony/templates/project-standards/.gitmessage:1)：Git 提交规范模板
- [.github/](/Users/sony/templates/project-standards/.github:1)：GitHub 协作基线，包含缺陷报告、功能支持表单、拉取请求模板与标准标签定义

## 规范清单与接入指南

### 1. Git 提交规范

文件路径：[.gitmessage](/Users/sony/templates/project-standards/.gitmessage:1)

遵循 Conventional Commits 规范，统一采用 `<type>(<scope>): <中文简述>` 结构。

执行如下命令将该模板绑定为本机全局提交模板：

```bash
just apply-git-template
```

或使用原生 Git 命令配置：

```bash
git config --global commit.template ~/templates/project-standards/.gitmessage
```

### 2. GitHub 协作模板

- 表单全局配置：[config.yml](/Users/sony/templates/project-standards/.github/ISSUE_TEMPLATE/config.yml:1)，统一禁用空白 Issue 自由提交
- 缺陷报告表单：[bug_report.yml](/Users/sony/templates/project-standards/.github/ISSUE_TEMPLATE/bug_report.yml:1)
- 功能支持表单：[feature_support.yml](/Users/sony/templates/project-standards/.github/ISSUE_TEMPLATE/feature_support.yml:1)
- 合并请求模板：[PULL_REQUEST_TEMPLATE.md](/Users/sony/templates/project-standards/.github/PULL_REQUEST_TEMPLATE.md:1)

在新项目初始化或规范化现有项目时，直接将本仓库的 `.github/` 目录复制至目标项目根目录即可。

### 3. 标准标签集合

定义文件：[labels.json](/Users/sony/templates/project-standards/.github/labels.json:1)

基于人机协同流转设计，提供与 GitHub 默认标签正交的精简标签集：

| 标签 | 含义说明 |
| :--- | :--- |
| `type/bug` | 系统缺陷、逻辑错误或运行异常 |
| `type/feat` | 新增功能特性与能力支持 |
| `status/ready-for-agent` | 上下文与验收标准明确，智能体可直接领跑实现 |
| `status/needs-human` | 执行受阻挂起，需要人类进行决策、授权或方向确认 |
| `status/wontfix` | 不予支持、不予采纳或超出当前项目规划边界 |

使用如下命令一键将上述标准标签批量同步至目标 GitHub 仓库：

```bash
just sync-labels <owner/repo>
```

