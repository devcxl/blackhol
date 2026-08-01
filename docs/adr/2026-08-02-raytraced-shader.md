# ADR-001: 自定义 GPU Shader Raymarching

| 字段 | 值 |
|------|-----|
| 日期 | 2026-08-02 |
| 状态 | Accepted |
| 决策者 | devcxl |
| 相关 | PRD §3 |

## 背景

渲染类电影《星际穿越》的黑洞效果需要模拟：
1. 光线在强引力场中的弯曲（引力透镜）
2. 吸积盘被透镜扭曲产生的双像
3. 事件视界光路消失

## 决策

**采用自定义 GPU fragment shader raymarching（Schwarzschild 度规近似）而非 Three.js 原生网格/粒子渲染。**

## 选项

### 选项 A：Three.js 原生 Mesh + 贴图（否决）

- 用弯曲的网格几何体模拟吸积盘、球体模拟事件视界
- 无法实现引力透镜（光路弯曲是逐像素的——这要求重排像素，mesh rasterization 做不到）
- 不可能产生背景星空扭曲和吸积盘双像

### 选项 B：自定义 Shader Raymarching（采用）

- Fragment shader 对每个屏幕像素在世界空间中步进光线
- 每步计算 Schwarzschild 度规对光线方向的偏转
- 检测击中吸积盘、事件视界或逃逸
- Three.js 仅做场景管理（相机、后期 Bloom）

## 后果

- 正面：可实现引力透镜、盘面双像、光子环等核心视觉特征
- 负面：shader 代码复杂度高，调试困难（无 GPU 断点）；需要将可测试的纯逻辑提取到 TypeScript
- 负面：移动端 GPU 性能压力大，必须实施降级策略

## 为什么不用更简单的方案？

渲染精确的引力透镜效果**不可能是**传统 rasterization 能解决的问题——光线弯曲意味着相邻像素的光源位置可能跨越场景的不同区域，这只能由 per-pixel ray tracing 实现。因此不存在"更简单"的替代方案。
