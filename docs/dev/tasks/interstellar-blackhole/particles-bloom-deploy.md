---
task: particles-bloom-deploy
depends_on: [accretion-disk-starfield, controls-quality-ui]
parallel_group: null
test_commands:
  - npm test -- run
  - npm run build
verify_commands:
  - npm run build
  - npm run lint
tdd:
  mode: strict
  applicable: true
acceptance:
  - id: AC-5.1
    description: AccretionParticles 组件渲染 Three.js Points，粒子按开普勒轨道绕黑洞运动
  - id: AC-5.2
    description: 粒子颜色与内盘温度一致（白蓝高温），半径随轨道衰减（螺旋吸入）
  - id: AC-5.3
    description: EffectComposer + UnrealBloomPass 对场景应用 Bloom 辉光
  - id: AC-5.4
    description: Bloom threshold 仅对高亮区域（盘面内边缘、光子环）生效
  - id: AC-5.5
    description: wrangler.toml 或 Cloudflare Pages 构建配置（build: npm run build, output: dist）
  - id: AC-5.6
    description: npm run build 成功，产物 dist/ 可部署
---

# Task: particles-bloom-deploy

吸积盘粒子流、Bloom 后期辉光、Cloudflare Pages 部署配置。

## 产出

- `src/components/AccretionParticles.tsx` — 吸积盘粒子流 Points
- `src/components/PostProcessing.tsx` — EffectComposer + UnrealBloomPass
- 更新 `src/components/BlackHoleScene.tsx` — 集成粒子和后期
- `wrangler.toml` 或 `.cloudflare/` 配置 — Pages 部署设置

## 实现要点

- 粒子轨道：内边缘 3RS，外边缘按温度衰减半径，开普勒速度 `v ∝ 1/sqrt(r)`
- 粒子生命期：从外盘螺旋向内盘，接近内边缘时消失并重生
- Bloom：threshold 过滤低亮度区域，strength 适中，radius 小半径防过度扩散
- 部署：Cloudflare Pages 连接 GitHub 仓库，自动构建
