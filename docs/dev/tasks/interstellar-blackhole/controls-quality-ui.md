---
task: controls-quality-ui
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
  - id: AC-4.1
    description: OrbitControls（drei）集成：鼠标拖拽旋转视角、滚轮缩放、禁止平移
  - id: AC-4.2
    description: 初始 autoRotate 状态开启，速度适中
  - id: AC-4.3
    description: src/utils/quality.ts 设备探测（mobile/userAgent/DPR）纯函数有单测
  - id: AC-4.4
    description: useQualityTier hook 注入画质档位到 React context
  - id: AC-4.5
    description: Overlay 组件显示标题文字 + 交互提示（拖拽旋转 / 滚轮缩放）
  - id: AC-4.6
    description: LoadingScreen 组件：shader 编译/初始化期间显示加载态
---

# Task: controls-quality-ui

交互控制、性能画质分级、用户界面覆盖层。

## 产出

- 更新 `src/components/BlackHoleScene.tsx` — 添加 OrbitControls
- `src/utils/quality.ts` — 设备探测 + 画质分级纯函数
- `src/hooks/useQualityTier.ts` — 画质档位 hook + context
- `src/components/Overlay.tsx` — 标题 + 操作提示
- `src/components/LoadingScreen.tsx` — 加载态

## 实现要点

- OrbitControls：autoRotate=true, enablePan=false, minDistance/maxDistance 限制缩放范围
- 画质检测：`navigator.userAgentData.mobile` || UA 含 `Mobi` + `devicePixelRatio` 阈值
- QualityContext 向下传递 `MAX_STEPS` 等参数，BlackHoleRenderer 消费
- Overlay 使用绝对定位 CSS，置于 Canvas 之上，不干扰交互
