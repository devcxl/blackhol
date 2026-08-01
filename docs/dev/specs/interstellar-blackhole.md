# 技术方案：星际穿越风格黑洞

> 基于 PRD `docs/prd/interstellar-blackhole.md` 的设计方案

## 1. 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | React 18 + TypeScript | PRD 指定 |
| 构建 | Vite 5+ | 零配置 HMR，ESBuild 快速构建 |
| 3D 引擎 | @react-three/fiber (@R3F) + @react-three/drei + @react-three/postprocessing | 声明式 Three.js 封装，无需手写 WebGL 管线 |
| 自定义 shader | GLSL (fragment shader raymarching) | 引力透镜必须逐像素光线追踪 |
| 测试 | Vitest + @testing-library/react | Vite 原生集成，React 测试标准方案 |
| 测试-纯逻辑 | Vitest 单测（.test.ts） | 色温映射、多普勒因子、Schwarzschild 参数计算 |
| 测试-渲染 | 通过 `tdd_checkpoint` 视觉回归 | Shader 输出精度依赖 GPU，非纯逻辑不可单测 |
| Lint | ESLint + Prettier | 标准 |

## 2. 项目结构

```
src/
  components/
    BlackHoleScene.tsx       — R3F Canvas 入口，场景配置
    BlackHoleRenderer.tsx    — 全屏 quad + raymarching shaderMaterial
    StarfieldParticles.tsx   — 背景星空粒子（Points + 透镜坐标变换）
    AccretionParticles.tsx   — 吸积盘粒子流（Points + 螺旋轨道）
    PostProcessing.tsx       — EffectComposer + Bloom
    Overlay.tsx              — 标题文字 + 交互提示（DOM overlay）
    LoadingScreen.tsx        — 加载态
  shaders/
    blackhole.vert           — 全屏 quad 顶点着色器
    blackhole.frag           — raymarching 片段着色器（Schwarzschild 度规）
  utils/
    schwarzschild.ts         — 光线步进积分、事件视界检测（纯函数，可单测）
    doppler.ts               — 多普勒因子计算（纯函数）
    temperature.ts           — 黑体辐射色温映射（纯函数）
    quality.ts               — 设备探测 + 画质分级
    constants.ts             — 物理常量（G, c, r_s）、渲染默认值
  hooks/
    useQualityTier.ts        — 画质档位 hook
  App.tsx                    — 根组件
  main.tsx                   — 入口
  index.html
```

## 3. 架构：Render-to-Texture 全屏 Quad 渲染

```
 ┌─────────────────────────────────────────┐
 │  App                                    │
 │  └── BlackHoleScene (Canvas)            │
 │      ├── camera (PerspectiveCamera)      │
 │      ├── OrbitControls (drei)           │
 │      ├── BlackHoleRenderer              │
 │      │    └── <mesh> fullscreen quad    │
 │      │         └── shaderMaterial       │
 │      │             ├── uCameraPos       │
 │      │             ├── uInvProjMatrix   │
 │      │             ├── uTime            │
 │      │             ├── uResolution      │
 │      │             ├── uQuality(步数)    │
 │      │             └── [frag → raymarch]│
 │      ├── StarfieldParticles <points>    │
 │      ├── AccretionParticles <points>    │
 │      └── EffectComposer                 │
 │           └── UnrealBloomPass           │
 └─────────────────────────────────────────┘
```

**数据流**：
1. `useFrame` 每帧更新 uniform（cameraPos, invProjMatrix, time）
2. Fragment shader 对每个像素发射世界空间光线
3. 光线在 Schwarzschild 度规中步进（RK4 / Euler 积分）
4. 检测击中事件视界（→ 黑色）、吸积盘（→ 色温映射）、或逃逸（→ 背景星空采样）
5. 输出颜色到 render target
6. EffectComposer 对 render target 应用 Bloom
7. 最终输出到 Canvas

## 4. Shader 设计

### 4.1 顶点着色器 (`blackhole.vert`)
- 全屏 quad：2 triangles covering clip space [-1, 1]
- 输出 `vUv` 用于 fragment 计算

### 4.2 片段着色器 (`blackhole.frag`) — 核心

光线步进循环（伪代码）：
```glsl
vec3 rayOrigin = cameraPos;
vec3 rayDir = normalize(pixelWorldDir);

// Schwarzschild raymarch
for (int i = 0; i < MAX_STEPS; i++) {
    vec3 pos = rayOrigin + rayDir * t;
    float r = length(pos);
    
    if (r < EVENT_HORIZON_RADIUS) {
        return vec3(0.0); // 落入视界
    }
    
    // 引力偏转光线方向（一阶近似）
    float deflection = 1.5 * RS / r; // 弯曲角
    rayDir = normalize(rayDir + deflection * (-pos / r));
    
    // 检测吸积盘相交
    float distToDisk = abs(pos.y) - DISK_HALF_THICKNESS;
    if (distToDisk < 0.0 && r > INNER_DISK_RADIUS && r < OUTER_DISK_RADIUS) {
        float doppler = computeDoppler(pos, rayDir);
        float temp = computeTemperature(r);
        return blackbodyToRGB(temp) * doppler;
    }
    
    t += stepSize;
}

// 未命中 → 背景星空（采样星空环境贴图或程序化星空）
return sampleStarfield(rayDir);
```

**关键参数**：
- `RS`：Schwarzschild 半径
- `EVENT_HORIZON_RADIUS`：视界半径（= RS）  
- `MAX_STEPS`：由画质档位注入（高=64，低=32）
- `DISK_HALF_THICKNESS`：吸积盘半厚度
- `INNER_DISK_RADIUS`：盘内边缘（最内稳定轨道 = 3RS）
- `OUTER_DISK_RADIUS`：盘外边缘

### 4.3 纯逻辑提取到 TypeScript（可单测部分）

从 shader 中提取以下**无 GPU 依赖的纯函数**到 `src/utils/`：

| 函数 | 文件 | 逻辑 |
|------|------|------|
| `schwarzschildDeflection(r, rs)` | `schwarzschild.ts` | 给定距离和 RS，返回光线偏转角 |
| `computeDopplerFactor(pos, vel, observerDir)` | `doppler.ts` | 相对论多普勒因子 |
| `temperatureAtRadius(r, innerR, outerR)` | `temperature.ts` | 盘面径向温度分布（幂律衰减） |
| `blackbodyToRGB(tempK)` | `temperature.ts` | 黑体辐射 → sRGB 映射 |
| `isInsideEventHorizon(r, rs)` | `schwarzschild.ts` | 事件视界命中检测 |
| `diskIntersection(r, y, innerR, outerR, halfThick)` | `schwarzschild.ts` | 吸积盘相交检测 |

这些函数在 shader 中用等价 GLSL 实现，在 TypeScript 中作为参考实现被单测覆盖。

## 5. 粒子系统

### 5.1 背景星空粒子 (`StarfieldParticles`)
- 实现：Three.js `Points` + `BufferGeometry`（~2000 粒子）
- 位置：随机分布在远场球壳上（距离 >> RS）
- 视觉效果：粒子位于场景 "背景"，不参与 raymarching（仅做场景深度感）
- ⚠️ 限制：Points 是 3D 位置渲染，不会自动被透镜弯曲。实现"被透镜弯曲的星空"需要：
  - **方案 A**：在 `blackhole.frag` 的 raymarch 末尾，对 `rayDir` 采样程序化星空（纯 shader 内实现，无 Points）—— 推荐，因为透镜效果自然融合
  - **方案 B**：Points 粒子 + 在 fragment 中对 background 做后处理扭曲 —— 效果差
- **采用方案 A**：星空在 shader 内通过 `sampleStarfield(rayDir)` 程序化生成（噪声函数模拟星点分布），自然受光线弯曲影响

### 5.2 吸积盘粒子流 (`AccretionParticles`)
- 实现：Three.js `Points` + `BufferGeometry`（~500 粒子）
- 位置：粒子的 3D 世界位置由 `useFrame` 按开普勒轨道更新
- 轨道范围：内盘 (3RS) 到外盘范围
- 视觉：粒子点大小随距离衰减，颜色与盘面温度一致
- 独立渲染层（不参与 raymarching），叠加在 raymarching 盘面之上，提供动态层次感

## 6. 后期处理

- **UnrealBloomPass**（@react-three/postprocessing）：
  - `threshold`: 只对高温明亮区域（盘面内边缘、光子环）Bloom
  - `strength`: 可调（默认 1.5）
  - `radius`: 小半径（0.5）避免过度扩散

## 7. 交互

- **OrbitControls（drei）**：
  - 初始 `autoRotate: true, autoRotateSpeed: 0.3`
  - 鼠标拖拽：旋转（控制 `enableRotate: true`）
  - 滚轮：缩放（控制 `enableZoom: true, minDistance/maxDistance`）
  - 平移禁用（`enablePan: false`）

## 8. 性能降级策略

`useQualityTier` hook 在初始化时：

1. 检测 `navigator.userAgentData.mobile` 或 UA 含 `Mobi`
2. 检测 `devicePixelRatio` → 高/低
3. 综合判定 → `QualityTier`:
   - `HIGH`（桌面）：dpr ≤ 1.5、MAX_STEPS=64、stars=2000、particles=500
   - `LOW`（移动端）：dpr 0.75–1、MAX_STEPS=32、stars=800、particles=200

降级通过 React Context 注入到各组件。

## 9. 部署

- Cloudflare Pages 连接 GitHub 仓库
- 构建：`npm run build`（Vite）→ `dist/`
- Pages 配置：构建命令 `npm run build`，输出目录 `dist`
- 部署后通过 `.env` 或 Pages 环境变量传递基础 URL

## 10. 测试策略

| 层 | 方式 | 范围 |
|---|---|---|
| 纯逻辑（utils/*.ts） | Vitest 单测 | `schwarzschild.ts`, `doppler.ts`, `temperature.ts` `constants.ts` — 验证物理/数学正确性 |
| 组件渲染 | Vitest + RTL | Overlay、LoadingScreen 等纯 React 组件 |
| Shader 视觉 | 手动验证 / 视觉回归 | 黑洞渲染效果、透镜、粒子 — 无 GPU 确定性，不做自动化截图测试 |
| E2E | 可选（Playwright smoke） | 页面加载、Canvas 渲染确认 |
