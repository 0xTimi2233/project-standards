# 变更日志

本项目遵循语义化版本规范，格式基于保持更新日志原则。

## [1.0.0] - 2026-10-20

### 新增

- 新增基于 TypeScript 与 Bun 运行时的统一命令行工具 `bin/standards.ts`。
- 新增 `manifest.json` 声明式资产配置，解耦同步策略（`overwrite`、`create-only`、`merge-lines`）与分发引擎。
- 新增项目级安全策略文件 `SECURITY.md`，明确版本维护范围与漏洞披露时效承诺。
- 新增跨语言通用贡献指南 `CONTRIBUTING.md` 与完成定义。
- 新增自动化单元测试集，覆盖基线分发与 `.gitignore` 幂等合并逻辑。

### 变更

- 重构 `README.md`，全面适配标准自述文件规范与新版 TypeScript 命令行指令。
- 优化命令行终端输出：收敛为纯英文、无表情符号的高信噪比格式，专为 Agent 与自动化环境设计。

### 移除

- 移除 `Justfile` 及其对 `just` 工具链的隐式依赖。
- 移除 `scripts/*.sh` 脚本及其对系统 `jq`、`comm` 等外部工具链的依赖。
- 移除本地 Git 提交模板自动绑定逻辑。
