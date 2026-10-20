# 变更日志

本项目遵循语义化版本规范，格式基于保持更新日志原则。

## [0.3.0](https://github.com/0xTimi2233/project-standards/compare/v0.2.1...v0.3.0) (2026-10-20)


### Features

* **baseline:** 完善通用忽略规则，沉淀 Renovate 基线并支持仓库属性同步 ([481bf10](https://github.com/0xTimi2233/project-standards/commit/481bf10e9e9750fe0bf6be1d142cbe7b31f1b58b))
* **baseline:** 完善通用忽略规则，沉淀 Renovate 基线并支持仓库属性同步 ([078b44e](https://github.com/0xTimi2233/project-standards/commit/078b44e44a5af6ec503807fde5e9328a46f4d393))
* **baseline:** 将 Renovate 非主版本与摘要更新收敛为单一 PR ([#7](https://github.com/0xTimi2233/project-standards/issues/7)) ([cbfc611](https://github.com/0xTimi2233/project-standards/commit/cbfc61150feadd46980ac1c5ee98b8c2169be4e8))
* **core:** 支持多技术栈 Provider 架构与声明式 Release PR 自动化 ([#25](https://github.com/0xTimi2233/project-standards/issues/25)) ([cd1dfb2](https://github.com/0xTimi2233/project-standards/commit/cd1dfb2026e3cf390bb2b274845d1c997f3399b9))
* **github:** 禁用空白 issue 并规范表单英中文案 ([9d19181](https://github.com/0xTimi2233/project-standards/commit/9d19181332774f57e406dc451018776ce55937fb))
* **just:** sync-labels 改为对齐语义 ([5227d05](https://github.com/0xTimi2233/project-standards/commit/5227d057938d46b1df4fdfb1f524cd9174903fd8))
* **release:** 彻底采用标准结构化解析并对齐 dist 动态发布流水线 ([#15](https://github.com/0xTimi2233/project-standards/issues/15)) ([3198f99](https://github.com/0xTimi2233/project-standards/commit/3198f99c91f312a9442137d449d5e028654b01dc))
* **repo:** 初始化工程规范基线仓库 ([6dac045](https://github.com/0xTimi2233/project-standards/commit/6dac0451e042e63f3ae1689a6909e6a03c322bd4))
* **standards:** 增加分支保护规则集与一键工程基线迁移脚本 ([#1](https://github.com/0xTimi2233/project-standards/issues/1)) ([ad1cfc8](https://github.com/0xTimi2233/project-standards/commit/ad1cfc8f8c4b5a4909bdb5b22d1ec7fb2000f1c8))
* **standards:** 完善标品生态（Discussions 导流、Biome、路径别名与 CI/CD 流水线） ([#9](https://github.com/0xTimi2233/project-standards/issues/9)) ([3969887](https://github.com/0xTimi2233/project-standards/commit/3969887c159812eb8d1045d69e4d433adb4d80e0))
* **workflows:** 重构为标品 CI/CD 体系并统一 yml 后缀与 Discussions 自动启用 ([#11](https://github.com/0xTimi2233/project-standards/issues/11)) ([0d7ea25](https://github.com/0xTimi2233/project-standards/commit/0d7ea25c7c7c004c495f711555f051bd73ef998b))


### Bug Fixes

* **ci:** 全面采用官方原生 Actions 消除脚本依赖并闭环分支合并门禁 ([#13](https://github.com/0xTimi2233/project-standards/issues/13)) ([83ebbdb](https://github.com/0xTimi2233/project-standards/commit/83ebbdbf17020e625571ae02df162d43061443ac))
* **ci:** 在 dist 配置中添加 allow-dirty 允许自定义工作流 ([#16](https://github.com/0xTimi2233/project-standards/issues/16)) ([1b2e9f7](https://github.com/0xTimi2233/project-standards/commit/1b2e9f7f6202a37ea0b62ff3a4574a9f37ee5268))
* **ci:** 在 release 工作流的构建任务中添加 setup-bun 步骤 ([#23](https://github.com/0xTimi2233/project-standards/issues/23)) ([b2d6801](https://github.com/0xTimi2233/project-standards/commit/b2d6801aa814b854956bfa398a5d52fcbb859c8f))
* **github:** 修正 ready-for-agent 标签描述用词 ([9dffeb5](https://github.com/0xTimi2233/project-standards/commit/9dffeb5316f0804f488960577c3b4b15747b7e7c))
* **readme:** 将文件跳转链接修复为仓库相对路径 ([#4](https://github.com/0xTimi2233/project-standards/issues/4)) ([0e782a7](https://github.com/0xTimi2233/project-standards/commit/0e782a7b4353a7bacf097e1531447edbf9b4b203))
* **release:** 修复工作区文件名解析错误并补充单元测试 ([#21](https://github.com/0xTimi2233/project-standards/issues/21)) ([4021df3](https://github.com/0xTimi2233/project-standards/commit/4021df3f23150587d5de47ff3b5e17e30f3aa2cf))
* **release:** 完善发布脚本的元数据更新与前置校验逻辑 ([#19](https://github.com/0xTimi2233/project-standards/issues/19)) ([08e1dbc](https://github.com/0xTimi2233/project-standards/commit/08e1dbc5696e72279583a63674024d72eab76258))
* **scripts:** 适配免费私有仓库并增加 Ruleset 权限降级处理 ([#5](https://github.com/0xTimi2233/project-standards/issues/5)) ([7753656](https://github.com/0xTimi2233/project-standards/commit/7753656ab8ae106a5f5d771d37bc3a2f7419a953))
* **settings:** 自动配置 GitHub Actions 创建 PR 权限 ([#28](https://github.com/0xTimi2233/project-standards/issues/28)) ([5aefd28](https://github.com/0xTimi2233/project-standards/commit/5aefd28761014150b9f0d2034818632d92131a19))
* **workflow:** 显式声明 shell: bash 保障 Windows runner 正确解析环境变量 ([#30](https://github.com/0xTimi2233/project-standards/issues/30)) ([c7829e9](https://github.com/0xTimi2233/project-standards/commit/c7829e936bde83f1eca915afcff6f27b6c0aa5f8))


### Reverts

* **dist:** 移除 dist 配置文件并恢复极简两阶段发布流水线 ([#24](https://github.com/0xTimi2233/project-standards/issues/24)) ([c631337](https://github.com/0xTimi2233/project-standards/commit/c63133702b798ef6921bffeb75520ee9c60dc194))

## [0.2.1](https://github.com/0xTimi2233/project-standards/compare/v0.2.0...v0.2.1) (2026-10-20)


### Bug Fixes

* **workflow:** 显式声明 shell: bash 保障 Windows runner 正确解析环境变量 ([#30](https://github.com/0xTimi2233/project-standards/issues/30)) ([c7829e9](https://github.com/0xTimi2233/project-standards/commit/c7829e936bde83f1eca915afcff6f27b6c0aa5f8))

## [0.2.0](https://github.com/0xTimi2233/project-standards/compare/v0.1.0...v0.2.0) (2026-10-20)

### Features

* **core:** 支持多技术栈 Provider 架构与声明式 Release PR 自动化 ([#25](https://github.com/0xTimi2233/project-standards/issues/25)) ([cd1dfb2](https://github.com/0xTimi2233/project-standards/commit/cd1dfb2026e3cf390bb2b274845d1c997f3399b9))
* **release:** 彻底采用标准结构化解析并对齐 dist 动态发布流水线 ([#15](https://github.com/0xTimi2233/project-standards/issues/15)) ([3198f99](https://github.com/0xTimi2233/project-standards/commit/3198f99c91f312a9442137d449d5e028654b01dc))

### Bug Fixes

* **ci:** 在 dist 配置中添加 allow-dirty 允许自定义工作流 ([#16](https://github.com/0xTimi2233/project-standards/issues/16)) ([1b2e9f7](https://github.com/0xTimi2233/project-standards/commit/1b2e9f7f6202a37ea0b62ff3a4574a9f37ee5268))
* **ci:** 在 release 工作流的构建任务中添加 setup-bun 步骤 ([#23](https://github.com/0xTimi2233/project-standards/issues/23)) ([b2d6801](https://github.com/0xTimi2233/project-standards/commit/b2d6801aa814b854956bfa398a5d52fcbb859c8f))
* **release:** 修复工作区文件名解析错误并补充单元测试 ([#21](https://github.com/0xTimi2233/project-standards/issues/21)) ([4021df3](https://github.com/0xTimi2233/project-standards/commit/4021df3f23150587d5de47ff3b5e17e30f3aa2cf))
* **release:** 完善发布脚本的元数据更新与前置校验逻辑 ([#19](https://github.com/0xTimi2233/project-standards/issues/19)) ([08e1dbc](https://github.com/0xTimi2233/project-standards/commit/08e1dbc5696e72279583a63674024d72eab76258))
* **settings:** 自动配置 GitHub Actions 创建 PR 权限 ([#28](https://github.com/0xTimi2233/project-standards/issues/28)) ([5aefd28](https://github.com/0xTimi2233/project-standards/commit/5aefd28761014150b9f0d2034818632d92131a19))

### Reverts

* **dist:** 移除 dist 配置文件并恢复极简两阶段发布流水线 ([#24](https://github.com/0xTimi2233/project-standards/issues/24)) ([c631337](https://github.com/0xTimi2233/project-standards/commit/c63133702b798ef6921bffeb75520ee9c60dc194))

## [0.1.0] - 2026-10-20

### 新增

* 新增基于 TypeScript 与 Bun 运行时的统一命令行工具 `scripts/standards.ts`。
* 新增跨技术栈通用的自动化打标发版脚本 `scripts/release.ts`，自动探测版本号、校验工作区并推送标准 Tag。
* 新增 `manifest.json` 声明式资产配置，解耦同步策略（`overwrite`、`create-only`、`merge-lines`）与分发引擎。
* 新增项目级安全策略文件 `SECURITY.md`，明确版本维护范围与漏洞披露时效承诺。
* 新增跨语言通用贡献指南 `CONTRIBUTING.md` 与完成定义。
* 新增标准开源许可证 `LICENSE`（MIT）。
* 新增完整的企业级 GitHub Actions 流水线体系（`ci.yml`、`checks.yml`、`security.yml`、`cache-cleanup.yml`、`release.yml`），所有 Action 均遵循不可篡改 Commit SHA 与版本注释锁定。
* 新增自动化单元测试集，覆盖基线分发与 `.gitignore` 幂等合并逻辑。

### 变更

* 重构 `README.md`，全面适配标准自述文件规范与新版 TypeScript 命令行指令。
* 优化命令行终端输出：收敛为纯英文、无表情符号的高信噪比格式，专为 Agent 与自动化环境设计。
* 升级 Issue 模板：统一采用 `.yml` 后缀确保原生生效以屏蔽 Blank Issue，并在 `config.yml` 引入 GitHub Discussions 导流。
* 升级代码工具链：引入 `@biomejs/biome` 统一格式化与静态检查，在 `tsconfig.json` 配置 `@/*` 路径别名。
* 闭环分支保护门禁：在规则集配置中强制要求必须通过「合并门禁」状态检查。

### 移除

* 移除 `Justfile` 及其对 `just` 工具链的隐式依赖。
* 移除旧版 `scripts/*.sh` 脚本及其对系统 `jq`、`comm` 等外部工具链的依赖。
* 移除本地 Git 提交模板自动绑定逻辑。
