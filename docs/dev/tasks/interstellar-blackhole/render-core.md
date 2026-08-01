---
task: render-core
depends_on: [scaffold]
parallel_group: null
test_commands:
  - npm test -- run
verify_commands:
  - npm run build
  - npm run lint
tdd:
  mode: strict
  applicable: true
acceptance:
  - id: AC-2.1
    description: blackhole.vert 全屏 quad 顶点着色器编写完毕
  - id: AC-2.2
    description: blackhole.frag raymarching 片段着色器实现光线步进循环 + Schwarzschild 偏转
  - id: AC-2.3
    description: BlackHoleRenderer 组件加载全屏 quad shaderMaterial，传入 camera 的 world-space ray
  - id: AC-2.4
    description: 光线落入事件视界（r < RS）渲染为纯黑色
  - id: AC-2.5
    description: 光子环（r = 1.5 RS 附近的高亮细环）可见
  - id: AC-2.6
    description: src/utils/schwarzschild.ts 纯函数（isInsideEventHorizon, schwarzschildDeflection, diskIntersection）有单测通过
  - id: AC-2.7
    description: src/utils/doppler.ts 多普勒因子计算有单测通过
  - id: AC-2.8
    description: src/utils/temperature.ts 色温映射（temperatureAtRadius, blackbodyToRGB）有单测通过
---

# Task: render-core

核心渲染管线：GLSL raymarching shader + 纯逻辑工具函数。

## 产出

- `src/shaders/blackhole.vert` — 全屏 quad 顶点着色器
- `src/shaders/blackhole.frag` — raymarching 片段着色器（Schwarzschild 光线步进）
- `src/components/BlackHoleScene.tsx` — Canvas + 场景配置入口
- `src/components/BlackHoleRenderer.tsx` — 全屏 quad mesh + shaderMaterial
- `src/utils/schwarzschild.ts` — 纯函数（isInsideEventHorizon, deflection, diskIntersection）
- `src/utils/doppler.ts` — 多普勒因子
- `src/utils/temperature.ts` — 色温映射
- `src/utils/constants.ts` — 物理常量

## Shader 实现要点

- Fragment shader 接收 camera world-space ray（通过 inverse projection 重建）
- 光线步进沿 Schwarzschild 度规偏转方向
- 命中视界 → 黑色；未命中 → 背景色（#000 占位，后续任务接星空采样）
- 光子环：r ≈ 1.5 RS 处积累亮度（光线绕转多次后逃逸）

## 测试策略

- `schwarzschild.test.ts`：验证 event horizon 命中、偏转角计算、盘面相交检测
- `doppler.test.ts`：验证朝向/背向的多普勒明暗因子
- `temperature.test.ts`：验证黑体色温 → sRGB 映射的边界值
