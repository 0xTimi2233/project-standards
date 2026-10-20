# 变更日志

本项目遵循语义化版本规范，格式基于保持更新日志原则。

## [0.1.1] - 2026-10-20

### 修复

- 在 dist 配置中添加 `allow-dirty = ["ci"]`，支持流水线保留自定义的 Action 依赖锁定。
- 修复发布脚本解析工作区文件名时的字符截断问题，并补充单元测试。

### 优化

- 引入轻量级 `smol-toml`，在版本探测流程中实现纯 TypeScript 原生结构化解析。

## [0.1.0] - 2026-10-20

### 新增

- 新增基于 TypeScript 与 Bun 运行时的统一命令行工具 `scripts/standards.ts`。
- 新增跨技术栈通用的自动化打标发版脚本 `scripts/release.ts`，自动探测版本号、校验工作区并推送标准 Tag。
- 新增 `manifest.json` 声明式资产配置，解耦同步策略（`overwrite`、`create-only`、`merge-lines`）与分发引擎。
- 新增项目级安全策略文件 `SECURITY.md`，明确版本维护范围与漏洞披露时效承诺。
- 新增跨语言通用贡献指南 `CONTRIBUTING.md` 与完成定义。
- 新增标准开源许可证 `LICENSE`（MIT）。
- 新增完整的企业级 GitHub Actions 流水线体系（`ci.yml`、`checks.yml`、`security.yml`、`cache-cleanup.yml`、`release.yml`），所有 Action 均遵循不可篡改 Commit SHA 与版本注释锁定。
- 新增自动化单元测试集，覆盖基线分发与 `.gitignore` 幂等合并逻辑。

### 变更

- 重构 `README.md`，全面适配标准自述文件规范与新版 TypeScript 命令行指令。
- 优化命令行终端输出：收敛为纯英文、无表情符号的高信噪比格式，专为 Agent 与自动化环境设计。
- 升级 Issue 模板：统一采用 `.yml` 后缀确保原生生效以屏蔽 Blank Issue，并在 `config.yml` 引入 GitHub Discussions 导流。
- 升级代码工具链：引入 `@biomejs/biome` 统一格式化与静态检查，在 `tsconfig.json` 配置 `@/*` 路径别名。
- 闭环分支保护门禁：在规则集配置中强制要求必须通过「合并门禁」状态检查。

### 移除

- 移除 `Justfile` 及其对 `just` 工具链的隐式依赖。
- 移除旧版 `scripts/*.sh` 脚本及其对系统 `jq`、`comm` 等外部工具链的依赖。
- 移除本地 Git 提交模板自动绑定逻辑。
