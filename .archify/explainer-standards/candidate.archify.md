# 工程规范基线架构与自动化发版设计全貌 {#standards-overview}

多技术栈工程治理采用**分层 Provider 架构**，发布全流程采用**声明式 Release PR 自动化**，实现业务开发与版本发布彻底隔离。

- 核心基线单一源头管理，语言特性与可见性策略按需注入。
- 彻底废除本地发布脚本，发版 PR 严格仅改动版本号与变更日志。
- Rust 接入原生的 `release-plz`，发版自动同步锁文件，终结门禁死锁。
- 统一 `gate` 合并门禁，全技术栈固定 40 位 SHA 供应链安全。

@answer scope="Rust · Bun · uv · Public · Private · release-plz · release-please"
@meta locale=zh-CN

## 系统架构与 Provider 如何分层协作？ {#architecture}

@architecture id=system-arch title="Provider 三层分离架构"
| cli | CLI 调度器 | frontend |
| detect | 智能探测器 | backend |
| core | 通用基线 Core | backend |
| stacks | 技术栈 Provider | backend |
| vis | 可见性 Provider | backend |
| actions | CI/CD 工作流 | cloud |
| remote | GitHub 远端配置 | external |
| cli > detect | 分析目标特征 |
| detect > core | 组装通用文件 |
| detect > stacks | 注入语言模板 |
| detect > vis | 匹配开源策略 |
| stacks > actions | 部署流水线 |
| core > remote | 同步规则与标签 | emphasis |

@steps id=arch-steps
| step-cli | CLI 调度器 | 接收用户或 Agent 指令，驱动本地应用与远端同步。 | system-arch | cli |
| step-detect | 智能探测器 | 扫描清单文件识别 Rust、Bun、uv，探测远端可见性。 | system-arch | detect |
| step-core | 通用基线 Core | 分发提交规范、Issue 与 PR 模板、标签字典与忽略基线。 | system-arch | core |
| step-stacks | 技术栈 Provider | 差异化注入 CI/CD 流水线与语言特化配置文件。 | system-arch | stacks |
| step-vis | 可见性 Provider | 注入开源 MIT 协议或商业专有保密版权声明。 | system-arch | vis |
| step-remote | GitHub 远端配置 | 同步 Ruleset 分支保护、清理非标标签、配置 Actions 权限。 | system-arch | remote |

## 发版流程如何实现功能与发布物理隔离？ {#release-workflow}

@sequence id=release-flow title="Release PR 自动化全生命周期流转"
| actor dev | 开发者 | frontend |
| actor main | main 分支 | backend |
| actor bot | Release 机器人 | cloud |
| actor pr | 发版 PR | backend |
| actor release | GitHub Release | cloud |
| phase | 业务开发阶段 |
| dev | main | 提交功能 PR (约定式提交) |
| main | bot | 触发 release 扫描 |
| phase | 发版 PR 维护阶段 |
| bot | pr | 自动生成版本与更新日志 | emphasis |
| dev | pr | 审查版本变更内容 |
| phase | 审查与发布阶段 |
| dev | pr | 确认无误，点击 Merge |
| pr | main | 合并发版 PR |
| main | release | 自动创建 Tag 与发布版本 | emphasis |
| release | dev | 编译挂载跨平台安装包 | return |

@steps id=release-steps
| step-feat | 业务开发阶段 | 日常提交遵循约定式提交规范，功能代码通过常规 PR 合入主干。 | release-flow | dev |
| step-bot | 发版 PR 维护 | 机器人监听主分支推送，自动扫描未发版提交并维护唯一的发版 PR。 | release-flow | bot |
| step-diff | 纯净版本差异 | 发版 PR 中严格仅有版本清单与 CHANGELOG 的改动，零业务代码污染。 | release-flow | pr |
| step-merge | 人工合并发版 | 维护者随时审查版本内容，准备发版时只需点击 Merge。 | release-flow | dev |
| step-build | 跨平台构建分发 | PR 合并自动生成 Git Tag，触发矩阵编译并挂载 Release 附件。 | release-flow | release |

## 三大技术栈与公私有策略如何差异化适配？ {#comparison}

| 比较维度 | Rust (`rust`) | Bun (`bun`) | uv (`uv`) |
| --- | --- | --- | --- |
| 项目特征探测 | `Cargo.toml` | `package.json` | `pyproject.toml` |
| 代码分析工具 | `cargo fmt` + `clippy` {good:原生双检} | `Biome` {good:毫秒极速} | `Ruff` {good:百倍提速} |
| 单测测试矩阵 | Ubuntu, macOS, Windows | Ubuntu, macOS, Windows | Ubuntu, macOS, Windows |
| 发版驱动引擎 | **`release-plz`** {good:同步锁文件} | `release-please` | `release-please` |
| 二进制产物构建 | 5 平台编译 (`taiki-e`) | 4 平台单文件可执行文件 | Wheel 与 sdist 压缩包 |
| 公开仓库发布 (Public) | GitHub Release + crates.io | GitHub Release + npm | GitHub Release + PyPI |
| 私有仓库发布 (Private) | 仅内部 Release {good:绝不外泄} | 仅内部 Release {good:绝不外泄} | 仅内部 Release {good:绝不外泄} |
| 许可证类型 | MIT (Public) / 专有保密 (Private) | MIT (Public) / 专有保密 (Private) | MIT (Public) / 专有保密 (Private) |

## CI/CD 质量门禁与安全策略清单 {#quality-gates}

- [x] 所有 GitHub Actions 必须显式固定为 40 位 Commit SHA，杜绝供应链投毒。
- [x] 所有技术栈流水线必须配置 `gate` 统一检查，与 Ruleset 分支保护完全对齐。
- [x] Concurrency Group 必须绑定 PR 编号与分支 Ref，保障并发取消实时生效。
- [x] 密钥泄露扫描（Gitleaks）必须作为独立作业强制接入门禁检查。
- [x] 远端同步必须自动打通 `Allow GitHub Actions to create and approve pull requests` 权限。
- [x] 标签治理默认安全清除非标与冗余标签，自动化机器人按需动态建标。
