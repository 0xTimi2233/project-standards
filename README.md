# 工程规范基线

面向 Rust、Bun、uv 等多技术栈的工程元数据规范与基线自动化工具。基于 Provider 架构与声明式清单，支持本地工程资产初始化与 GitHub 远端配置双向治理。

## 目录

- [背景](#背景)
- [核心设计与架构](#核心设计与架构)
- [前置要求](#前置要求)
- [快速上手](#快速上手)
- [命令行手册](#命令行手册)
- [技术栈与可见性矩阵](#技术栈与可见性矩阵)
- [Release PR 自动化工作流](#release-pr-自动化工作流)
- [规范资产清单](#规范资产清单)
- [贡献](#贡献)
- [安全](#安全)
- [许可证](#许可证)

## 背景

在多语言协作中，手动维护 CI/CD 工作流、依赖更新、提交规范以及分支保护规则极易引发元数据漂移与发布事故。本项目提供标准化基线与 Provider 机制，在保持核心规范单一真实源的前提下，精准适配不同语言生态与仓库可见性要求。

## 核心设计与架构

系统采用三层分离架构：

```text
templates/
├── core/                        # 通用基础设施 (100% 共享)
│   ├── .github/                 # 规则集、标签字典、Issue/PR 模板、缓存与安全扫描
│   ├── .gitmessage              # 约定式提交规范模板
│   ├── .markdownlint-cli2.jsonc # Markdown 格式规范配置
│   ├── CONTRIBUTING.md          # 协作规范基线
│   ├── SECURITY.md              # 安全政策基线
│   └── renovate.json            # 依赖自动化更新基线
├── stacks/                      # 技术栈 Provider (差异化注入)
│   ├── rust/                    # Rust: rustfmt, clippy, cargo-deny, cargo-dist/taiki-e
│   ├── bun/                     # Bun: Biome lint, typecheck, bun test, bun build --compile
│   └── uv/                      # uv: ruff check/format, pytest, uv build, PyPI Trusted Publishing
└── visibility/                  # 可见性策略 Provider
    ├── public/                  # 公开项目：MIT 许可证，完整 Ruleset 与 Discussions
    └── private/                 # 私有项目：专有保密版权声明，GitHub Free 规则集优雅降级
```

## 前置要求

- [Bun](https://bun.sh/) >= 1.0.0
- [GitHub CLI](https://cli.github.com/)（执行远端同步前需完成授权：`gh auth status`）

## 快速上手

在目标项目根目录下执行一键应用：

```bash
# 智能推断：自动识别语言技术栈与 GitHub 远端可见性并同步
standards apply .

# 显式指定技术栈与可见性
standards apply . --stack rust --visibility public
```

## 命令行手册

```text
Usage: standards <command> [target/repo] [options]

Commands:
  init <target>           初始化本地工程文件与工作流配置
  sync-labels <repo>      同步标准标签体系并清理非标标签
  sync-ruleset <repo>     同步默认分支保护规则集（适配免费私有仓库降级）
  sync-settings <repo>    同步仓库属性（开启自动合并、分支自动清理）
  sync <repo>             全量同步 GitHub 远端配置（设置 + 标签 + 规则集）
  apply [target]          复合命令：本地初始化 + 检测远端并同步

Options:
  --stack <type>          目标技术栈：rust, bun, uv（未指定时根据清单文件自动探测）
  --visibility <scope>    仓库可见性：public, private（未指定时自动探测）
  -h, --help              展示帮助信息
```

## 技术栈与可见性矩阵

| 维度 | Rust (`rust`) | Bun (`bun`) | uv (`uv`) |
| :--- | :--- | :--- | :--- |
| **清单探测** | `Cargo.toml` | `package.json` | `pyproject.toml` |
| **代码检查** | `cargo fmt` + `clippy` | `biome check` + `bun check` | `uv run ruff check/format` |
| **单测运行** | `cargo test --all-features` | `bun test` | `uv run pytest` |
| **安全审计** | `cargo-deny` + Gitleaks | Gitleaks 凭据扫描 | Gitleaks 凭据扫描 |
| **Release PR** | **`release-plz`** (原生同步锁文件) | `release-please` (`node`) | `release-please` (`python`) |
| **产物构建** | `upload-rust-binary-action` | `bun build --compile` | `uv build` (wheel + sdist) |
| **Public 发布** | GitHub Release + crates.io | GitHub Release + npm | GitHub Release + PyPI |
| **Private 发布** | 仅内部 GitHub Release | 仅内部 GitHub Release | 仅内部 GitHub Release |

## Release PR 自动化工作流

本项目遵循发版与功能物理隔离的最佳实践，全面废除本地直接打 Tag 推送的做法：

1. **日常功能开发**：常规功能或修复通过 PR 提交至 `main` 分支，提交信息必须严格遵循约定式提交（Conventional Commits，如 `feat:`, `fix:`）。
2. **Release PR 维护**：
   - **Rust 技术栈**：通过 Rust 原生 `MarcoIeni/release-plz-action` 自动维护发版 PR，自动刷新并提交 `Cargo.toml`、`Cargo.lock` 与 `CHANGELOG.md`，彻底杜绝锁文件与门禁死锁。
   - **Bun / uv 技术栈**：通过 Google 官方 `googleapis/release-please-action` 自动维护发版 PR，自动维护版本清单与变更日志。
3. **一键发版**：维护者审查版本更新内容后点击 **Merge**。
4. **制品编译分发**：PR 合并事件触发下游发布流水线，自动创建 Git Tag 并执行对应技术栈的跨平台编译、打包及签名上传。

## 规范资产清单

- **分支保护规则集**：[.github/ruleset.json](templates/core/.github/ruleset.json)
- **标准标签字典**：[.github/labels.json](templates/core/.github/labels.json)
- **提交规范模板**：[.gitmessage](templates/core/.gitmessage)
- **Issue 表单配置**：[.github/ISSUE_TEMPLATE](templates/core/.github/ISSUE_TEMPLATE)
- **PR 模板**：[.github/PULL_REQUEST_TEMPLATE.md](templates/core/.github/PULL_REQUEST_TEMPLATE.md)
- **缓存自动清理**：[.github/workflows/cache-cleanup.yml](templates/core/.github/workflows/cache-cleanup.yml)
- **密钥泄露扫描**：[.github/workflows/security.yml](templates/core/.github/workflows/security.yml)
- **依赖自动化治理**：[renovate.json](templates/core/renovate.json)

## 贡献

详情请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 安全

详情请参阅 [SECURITY.md](SECURITY.md)。

## 许可证

本项目遵循 [MIT 许可证](LICENSE)。
