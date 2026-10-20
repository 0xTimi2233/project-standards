# 工程规范基线

跨语言、跨技术栈通用的工程元数据规范与基线配置工具。通过声明式清单与统一命令行工具，实现目标项目本地文件初始化与 GitHub 远端配置同步。

## 目录

- [背景](#背景)
- [前置要求](#前置要求)
- [快速上手](#快速上手)
- [核心命令](#核心命令)
- [规范资产清单](#规范资产清单)
- [架构与同步策略](#架构与同步策略)
- [贡献](#贡献)
- [安全](#安全)
- [许可证](#许可证)

## 背景

在多语言与多仓库协作中，统一分支保护、标签体系、提交规范以及自动化依赖治理是保障工程质量的底线。本项目提供面向开发者与 Agent 的一键式基线同步能力，彻底消除跨项目元数据漂移。

## 前置要求

- [Bun](https://bun.sh/) >= 1.0.0
- [GitHub CLI](https://cli.github.com/)，且完成用户授权（`gh auth status`）

## 快速上手

在目标项目的根目录下，执行一键规范应用：

```bash
# 全流程应用（初始化本地文件 + 自动识别关联远端并同步 GitHub 配置）
~/templates/project-standards/bin/standards.ts apply .
```

若已将本工具目录加入 `PATH` 或执行了全局链接，可直接调用 `standards`：

```bash
standards apply .
```

## 核心命令

命令行工具面向自动化与 Agent 设计，输出收敛为高信噪比纯文本格式：

| 命令 | 参数 | 职责说明 |
| :--- | :--- | :--- |
| `init` | `<target_dir>` | 仅初始化本地项目工程资产（复制模板并合并 `.gitignore`） |
| `sync` | `<owner/repo>` | 仅同步 GitHub 远端配置（仓库设置 + 标签集合 + 分支保护规则集） |
| `sync-labels` | `<owner/repo>` | 单独同步标准标签体系并清理非标标签 |
| `sync-ruleset` | `<owner/repo>` | 单独同步默认分支保护规则集（适配免费私有仓库降级） |
| `sync-settings` | `<owner/repo>` | 单独同步仓库属性（开启自动合并与分支自动回收） |
| `apply` | `[target_dir]` | 复合命令：先执行 `init`，若检测到 Git 远端则自动执行 `sync` |

## 规范资产清单

### Git 提交规范

定义文件：[.gitmessage](.gitmessage)  
遵循约定式提交规范，统一采用 `<type>(<scope>): <中文简述>` 结构。

### 分支保护规则集

定义文件：[.github/ruleset.json](.github/ruleset.json)  
作用于默认分支，强制禁止删除分支与强制推送，要求必须通过 PR 合并并解决所有审查讨论。支持 GitHub Free 私有仓库降级静默处理。

### GitHub 协作模板

- 全局配置：[.github/ISSUE_TEMPLATE/config.yaml](.github/ISSUE_TEMPLATE/config.yaml)，禁用空白 Issue 提交并引导至 Discussions
- 缺陷报告表单：[.github/ISSUE_TEMPLATE/bug_report.yaml](.github/ISSUE_TEMPLATE/bug_report.yaml)
- 功能需求表单：[.github/ISSUE_TEMPLATE/feature_request.yaml](.github/ISSUE_TEMPLATE/feature_request.yaml)
- 合并请求模板：[.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)

### 标准标签集合

定义文件：[.github/labels.json](.github/labels.json)  
基于人机协同流转设计，提供与 GitHub 默认标签正交的精简集合：

| 标签 | 含义说明 |
| :--- | :--- |
| `type/bug` | 系统缺陷、逻辑错误或运行异常 |
| `type/feat` | 新增功能特性与能力支持 |
| `status/ready-for-agent` | 上下文与验收标准明确，Agent 可直接领取实现 |
| `status/needs-human` | 执行受阻挂起，需要人类进行决策、授权或方向确认 |
| `status/wontfix` | 不予支持、不予采纳或超出当前项目规划边界 |

### 通用忽略规则

定义文件：[.gitignore](.gitignore)  
声明系统缓存、IDE 配置、依赖目录与构建产物忽略项，初始化时以幂等方式增量追加。

### 依赖自动化配置

定义文件：[renovate.json](renovate.json)  
统一声明 Mend Renovate 配置基线，内置上海时区、语义化提交与安全自动合并规则。

### 贡献指南

定义文件：[CONTRIBUTING.md](CONTRIBUTING.md)  
定义跨语言通用的协作工作流、约定式提交、质量门禁与完成定义。

### 安全策略

定义文件：[SECURITY.md](SECURITY.md)  
声明漏洞报告途径、受支持版本及响应时效承诺。

## 架构与同步策略

所有待分发资产与策略统一收敛于 [manifest.json](manifest.json)：

- **`overwrite`**：规范中心管控的核心资产（如 PR 模板、标签配置、规则集配置），每次同步强制覆盖。
- **`create-only`**：允许项目定制的非破坏性资产（如 `renovate.json`、`CONTRIBUTING.md`、`SECURITY.md`），仅在目标不存在时创建。
- **`merge-lines`**：以行模式增量合并去重，专用于 `.gitignore` 规则合并。

## 贡献

详情请查阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 安全

详情请查阅 [SECURITY.md](SECURITY.md)。

## 许可证

本项目遵循 [MIT 许可证](LICENSE)。
