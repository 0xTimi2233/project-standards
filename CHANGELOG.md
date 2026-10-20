# 变更日志

本项目遵循语义化版本规范，格式基于保持更新日志原则。

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
