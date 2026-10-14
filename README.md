# 工程规范基线

跨语言、跨技术栈通用的工程元数据规范与基线配置。

## 规范接入

目标项目缺失工程规范时，通过 [Justfile](Justfile) 执行对齐操作。

在目标项目根目录下执行全流程接入：

```bash
just -f ~/templates/project-standards/Justfile apply $(pwd)
```

查看细粒度命令与参数说明，请直接查阅 [Justfile](Justfile) 或执行：

```bash
just -f ~/templates/project-standards/Justfile --list
```

## 规范资产清单

### Git 提交规范

定义文件：[.gitmessage](.gitmessage)  
遵循 Conventional Commits 规范，统一采用 `<type>(<scope>): <中文简述>` 结构。

### 分支保护规则集

定义文件：[.github/ruleset.json](.github/ruleset.json)  
作用于默认分支，强制禁止删除分支与强制推送，要求必须通过 PR 合并并解决所有审查讨论。为保证跨技术栈通用性，规则集默认不包含状态检查门禁，具体项目在接入 CI 后按需在自身 Ruleset 中扩展。

### GitHub 协作模板

- 全局配置：[.github/ISSUE_TEMPLATE/config.yaml](.github/ISSUE_TEMPLATE/config.yaml)，禁用空白 Issue 提交
- 缺陷报告表单：[.github/ISSUE_TEMPLATE/bug_report.yaml](.github/ISSUE_TEMPLATE/bug_report.yaml)
- 功能支持表单：[.github/ISSUE_TEMPLATE/feature_support.yaml](.github/ISSUE_TEMPLATE/feature_support.yaml)
- 合并请求模板：[.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)

### 标准标签集合

定义文件：[.github/labels.json](.github/labels.json)  
基于人机协同流转设计，提供与 GitHub 默认标签正交的精简集合：

| 标签 | 含义说明 |
| :--- | :--- |
| `type/bug` | 系统缺陷、逻辑错误或运行异常 |
| `type/feat` | 新增功能特性与能力支持 |
| `status/ready-for-agent` | 上下文与验收标准明确，智能体可直接领跑实现 |
| `status/needs-human` | 执行受阻挂起，需要人类进行决策、授权或方向确认 |
| `status/wontfix` | 不予支持、不予采纳或超出当前项目规划边界 |

### 通用忽略规则

定义文件：[.gitignore](.gitignore)  
定义系统缓存、IDE 配置、依赖目录与构建产物忽略项，初始化时幂等增量合并。

### 依赖自动化配置

定义文件：[renovate.json](renovate.json)  
统一声明 Mend Renovate 配置基线，内置上海时区、语义化提交与安全自动合并规则。

### 远端仓库属性规范

提供 `sync-settings` 命令，同步开启平台原生自动合并与分支自动回收。

