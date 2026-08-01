---
task: scaffold
depends_on: []
parallel_group: null
test_commands:
  - npm run dev
verify_commands:
  - npm run build
  - npm run lint
tdd:
  mode: strict
  applicable: false
acceptance:
  - id: AC-1.1
    description: Vite + React 18 + TypeScript 项目初始化，dev server 正常启动
  - id: AC-1.2
    description: @react-three/fiber, @react-three/drei, @react-three/postprocessing 依赖安装
  - id: AC-1.3
    description: 根 App 组件渲染空 R3F Canvas
  - id: AC-1.4
    description: Vitest + ESLint + Prettier 配置就绪
  - id: AC-1.5
    description: package.json scripts（dev, build, test, lint）正常
---

# Task: scaffold

搭建 Vite + React 18 + TypeScript 项目脚手架，安装所有 3D 渲染依赖。

## 产出

- `package.json` — 项目依赖与脚本
- `tsconfig.json` — TypeScript 配置
- `vite.config.ts` — Vite 配置（含 glsl 插件，支持导入 .frag/.vert）
- `eslint.config.js` / `.prettierrc` — 代码规范
- `vitest.config.ts` — 测试配置
- `src/main.tsx` — 入口
- `src/App.tsx` — 根组件，渲染空 Canvas
- `index.html` — HTML 入口
