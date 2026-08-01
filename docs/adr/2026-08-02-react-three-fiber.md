# ADR-003: @react-three/fiber vs 原生 Three.js

| 字段 | 值 |
|------|-----|
| 日期 | 2026-08-02 |
| 状态 | Accepted |
| 决策者 | devcxl |
| 相关 | 技术方案 §1 |

## 背景

项目需要 React + Three.js 结合。有两个方式：
- **@react-three/fiber (R3F)**：声明式 React 渲染 Three.js 场景
- **原生 Three.js**：在 React `useEffect` 中手动管理 Three.js 实例

## 决策

**采用 @react-three/fiber + drei + postprocessing 生态。**

## 选项

### 选项 A：原生 Three.js + React useEffect（否决）

- 需要手动管理 renderer/scene/camera 生命周期
- OrbitControls 需要自行集成
- 后期处理管线需要手动搭建
- React 状态与 Three.js 对象之间需要手动 bridge

### 选项 B：@react-three/fiber（采用）

- 声明式 `<Canvas><mesh>...</mesh></Canvas>` 组件树
- drei 提供现成的 OrbitControls、ScreenQuad、shaderMaterial 扩展
- @react-three/postprocessing 提供 EffectComposer + Bloom 零配置
- React 状态（如画质档位）自然注入场景
- Three.js 对象在 re-render 时自动 diff 更新

## 后果

- 正面：开发效率高，减少 WebGL 样板代码
- 负面：R3F 对自定义 shader 的全屏 quad 渲染需要一定封装（不如原生 Three.js 直接），但 drei 的 `shaderMaterial` + fullscreen Plane 可解决
- 中性：R3F 内部仍使用 Three.js，无性能开销

## 为什么不用原生 Three.js？

本项目的 React 状态管理需求明显（画质分级、交互状态、加载态），R3F 将 Three.js 场景声明式集成到 React 中，消除了手动桥接代码。原生方案会引入额外复杂度而收益为零。
