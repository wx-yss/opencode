- To regenerate the JavaScript SDK, run `./packages/sdk/js/script/build.ts`.
- ALWAYS USE PARALLEL TOOLS WHEN APPLICABLE.
- The default branch in this repo is `dev`.
- Local `main` ref may not exist; use `dev` or `origin/dev` for diffs.
- Prefer automation: execute requested actions without confirmation unless blocked by missing info or safety/irreversibility.

## 自定义分支构建与替换

本仓库 fork 到 `wx-yss/opencode`（remote `mine`），自定义分支 `yss-custom` 用于携带本地修改。

**一键构建安装：** 终端执行 `opencode-build`（由 garden 项目 `$GARDEN/bin/opencode-build` 提供，自动编译并替换系统二进制）。

手动步骤（备查）：
```bash
bun ./packages/opencode/script/build.ts --single --skip-install  # 编译
rm ~/.opencode/bin/opencode                                       # 必须先删
cp packages/opencode/dist/opencode-darwin-arm64/bin/opencode ~/.opencode/bin/opencode
```

- `--single`：只编译当前平台（darwin-arm64）
- `--skip-install`：跳过跨平台原生依赖下载，大幅提速
- **不能直接 `cp` 覆盖**，必须 `rm` 后再 `cp`，否则 macOS 缓存旧签名导致二进制 hang 住

### 数据库共用

自定义分支 channel 名会生成独立数据库（如 `opencode-yss-custom.db`），与官方 `opencode.db` 隔离导致历史 session 丢失。启动时设置环境变量共用同一库：

```bash
export OPENCODE_DISABLE_CHANNEL_DB=1
```

### 上游同步

```bash
git fetch origin
git merge origin/dev
```

### 编译与同步

改源码后需要编译替换系统二进制时，执行 `opencode-build`（`$GARDEN/bin/opencode-build`，自动 `bun build.ts --single --skip-install` → rm → cp）。

需要同步上游版本时，执行 `opencode-sync`（`$GARDEN/bin/opencode-sync`，合并最新发布 tag → yss-custom → 打 tag → 调 opencode-build）。

手动等效：
```bash
cd $OPENCODE_SRC
git fetch origin --tags
git merge vX.Y.Z -m "chore: 合并上游版本 vX.Y.Z → yss-custom"
git tag "upstream/vX.Y.Z"
opencode-build
```

## Style Guide

### General Principles

- Keep things in one function unless composable or reusable
- Avoid `try`/`catch` where possible
- Avoid using the `any` type
- Use Bun APIs when possible, like `Bun.file()`
- Rely on type inference when possible; avoid explicit type annotations or interfaces unless necessary for exports or clarity
- Prefer functional array methods (flatMap, filter, map) over for loops; use type guards on filter to maintain type inference downstream
- In `src/config`, follow the existing self-export pattern at the top of the file (for example `export * as ConfigAgent from "./agent"`) when adding a new config module.

Reduce total variable count by inlining when a value is only used once.

```ts
// Good
const journal = await Bun.file(path.join(dir, "journal.json")).json()

// Bad
const journalPath = path.join(dir, "journal.json")
const journal = await Bun.file(journalPath).json()
```

### Destructuring

Avoid unnecessary destructuring. Use dot notation to preserve context.

```ts
// Good
obj.a
obj.b

// Bad
const { a, b } = obj
```

### Variables

Prefer `const` over `let`. Use ternaries or early returns instead of reassignment.

```ts
// Good
const foo = condition ? 1 : 2

// Bad
let foo
if (condition) foo = 1
else foo = 2
```

### Control Flow

Avoid `else` statements. Prefer early returns.

```ts
// Good
function foo() {
  if (condition) return 1
  return 2
}

// Bad
function foo() {
  if (condition) return 1
  else return 2
}
```

### Schema Definitions (Drizzle)

Use snake_case for field names so column names don't need to be redefined as strings.

```ts
// Good
const table = sqliteTable("session", {
  id: text().primaryKey(),
  project_id: text().notNull(),
  created_at: integer().notNull(),
})

// Bad
const table = sqliteTable("session", {
  id: text("id").primaryKey(),
  projectID: text("project_id").notNull(),
  createdAt: integer("created_at").notNull(),
})
```

## Testing

- Avoid mocks as much as possible
- Test actual implementation, do not duplicate logic into tests
- Tests cannot run from repo root (guard: `do-not-run-tests-from-root`); run from package dirs like `packages/opencode`.

## Type Checking

- Always run `bun typecheck` from package directories (e.g., `packages/opencode`), never `tsc` directly.
