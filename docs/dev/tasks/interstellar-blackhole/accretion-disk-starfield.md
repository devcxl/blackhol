---
task: accretion-disk-starfield
depends_on: [render-core]
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
  - id: AC-3.1
    description: 吸积盘在 shader 中实现：光线与盘面薄几何相交检测（r ∈ [INNER_DISK, OUTER_DISK] 且 |y| < halfThickness）
  - id: AC-3.2
    description: 内盘白蓝 → 外盘暖橙的温度梯度配色，基于 diskRadius 插值 blackbodyToRGB
  - id: AC-3.3
    description: 多普勒双峰明暗：朝向观察者侧更亮，背向侧更暗
  - id: AC-3.4
    description: 引力透镜产生盘面双像：上像与下像均可见
  - id: AC-3.5
    description: shader 中 sampleStarfield(rayDir) 程序化生成星空背景（噪声/随机函数）
  - id: AC-3.6
    description: 星空在黑洞附近被透镜弯曲（因 raymarch 末端 rayDir 已偏转，自然成立）
---

# Task: accretion-disk-starfield

在 shader 中实现吸积盘（温度梯度 + 多普勒双峰 + 双像）和程序化星空背景采样。

## 产出

- 更新 `src/shaders/blackhole.frag` — 添加盘面相交检测、色温映射、多普勒因子、星空采样
- 更新 `src/utils/temperature.ts` — 盘面温度分布验证（test 更新）
- 更新 `src/utils/doppler.ts` — 多普勒因子验证（test 更新）

## 实现要点

- 盘面相交：检测光线步进过程中是否穿过盘面几何（|y| < thickness, r ∈ [inner, outer]）
- 温度梯度：基于盘面半径的幂律温度衰减，映射到 blackbodyToRGB
- 多普勒因子：基于物质旋转方向与视线方向的夹角
- 双像：引力透镜自然产生（光线弯曲使上方光线和下方光线分别打到盘面上下两侧）
- 星空采样：在 raymarch 光线逃逸后，用 rayDir 的球坐标驱动 hash/noise 生成离散星点
