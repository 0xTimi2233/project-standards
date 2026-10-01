# 工程规范基线

跨语言、跨技术栈通用的工程元数据规范与基线配置，作为项目协作与自动化智能体的单一真实事实源。仓库自身即遵循该标准构建。

## 目录与文件结构

- [.gitignore](/Users/sony/templates/project-standards/.gitignore:1)：跨语言通用忽略规则
- [.gitmessage](/Users/sony/templates/project-standards/.gitmessage:1)：Git 提交规范模板
- [.github/](/Users/sony/templates/project-standards/.github:1)：GitHub 协作基线与自动化配置
  - [ruleset.json](/Users/sony/templates/project-standards/.github/ruleset.json:1)：默认分支保护规则集
  - [labels.json](/Users/sony/templates/project-standards/.github/labels.json:1)：标准标签定义
  - [PULL_REQUEST_TEMPLATE.md](/Users/sony/templates/project-standards/.github/PULL_REQUEST_TEMPLATE.md:1)：拉取请求模板
  - [ISSUE_TEMPLATE/](/Users/sony/templates/project-standards/.github/ISSUE_TEMPLATE:1)：缺陷报告与功能支持表单
- [scripts/](/Users/sony/templates/project-standards/scripts:1)：自动化同步与初始化脚本
- [Justfile](/Users/sony/templates/project-standards/Justfile:1)：规范分发与同步命令入口

## 规范清单与说明

### 1. Git 提交规范

文件路径：[.gitmessage](/Users/sony/templates/project-standards/.gitmessage:1)

遵循 Conventional Commits 规范，统一采用 `<type>(<scope>): <中文简述>` 结构。

执行如下命令将该模板绑定为本机全局提交模板：

```bash
git config --global commit.template ~/templates/project-standards/.gitmessage
```

### 2. 通用忽略规则

文件路径：[.gitignore](/Users/sony/templates/project-standards/.gitignore:1)

覆盖构建产物、覆盖率报告、日志与本地环境变量文件。通过初始化脚本可幂等增量合并至已有项目。

### 3. GitHub 协作模板

- 表单全局配置：[config.yaml](/Users/sony/templates/project-standards/.github/ISSUE_TEMPLATE/config.yaml:1)，禁用空白 Issue 自由提交
- 缺陷报告表单：[bug_report.yaml](/Users/sony/templates/project-standards/.github/ISSUE_TEMPLATE/bug_report.yaml:1)
- 功能支持表单：[feature_support.yaml](/Users/sony/templates/project-standards/.github/ISSUE_TEMPLATE/feature_support.yaml:1)
- 合并请求模板：[PULL_REQUEST_TEMPLATE.md](/Users/sony/templates/project-standards/.github/PULL_REQUEST_TEMPLATE.md:1)

### 4. 分支保护规则集

定义文件：[ruleset.json](/Users/sony/templates/project-standards/.github/ruleset.json:1)

针对默认分支（`~DEFAULT_BRANCH`）实施协议级安全保护：
- 禁止直接删除默认分支（`deletion`）
- 禁止强制推送（`non_fast_forward`）
- 必须通过 PR 合并（`pull_request`），要求解决所有 Review 讨论并自动失效过时评审

> **关于合并门禁（Status Checks）的说明**：
> 基座 Ruleset 保持技术栈无关与零外部假设，未预置具体的 `required_status_checks`。下游项目在建立自身 CI（如 Rust `cargo test`、Node `bun test`）后，可在其仓库的 Ruleset 中按需追加对应的门禁 Job 上下文名称。

### 5. 标准标签集合

定义文件：[labels.json](/Users/sony/templates/project-standards/.github/labels.json:1)

基于人机协同流转设计，提供与 GitHub 默认标签正交的精简标签集：

| 标签 | 含义说明 |
| :--- | :--- |
| `type/bug` | 系统缺陷、逻辑错误或运行异常 |
| `type/feat` | 新增功能特性与能力支持 |
| `status/ready-for-agent` | 上下文与验收标准明确，智能体可直接领跑实现 |
| `status/needs-human` | 执行受阻挂起，需要人类进行决策、授权或方向确认 |
| `status/wontfix` | 不予支持、不予采纳或超出当前项目规划边界 |

## 快速接入与同步指令

通过 [Justfile](/Users/sony/templates/project-standards/Justfile:1) 提供一键初始化与远端对齐能力：

```bash
# 1. 本地文件一键迁移（自动配置 commit.template、增量合并 .gitignore、同步 .github 模板）
just init /path/to/target-project

# 2. 远端分支保护规则集同步
just sync-ruleset <owner/repo>

# 3. 远端标准标签集同步
just sync-labels <owner/repo>

# 4. 远端 GitHub 配置全量对齐（标签 + 规则集）
just sync-github <owner/repo>

# 5. 全流程一键应用（自动识别本地 Git 关联的远端并完成本地与 GitHub 的双向同步）
just apply /path/to/target-project
```
