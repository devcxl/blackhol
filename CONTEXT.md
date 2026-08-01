# CONTEXT — 领域术语（权威词汇表）

> 术语权威：发现新术语或冲突时暂停并确认，由 flow_control 更新。

## 黑洞可视化

| 术语 | 定义 |
|------|------|
| 黑洞（black hole） | 引力极强、连光线也无法逃脱的天体；本项目中指 Gargantua 风格的巨型黑洞视觉表现 |
| 事件视界（event horizon） | 黑洞不可逃逸边界；渲染中光线落入视界半径（r_s）内即被吸收，呈现纯黑圆 |
| 光子环（photon ring） | 光子稳定轨道（r = 1.5 r_s）附近的极亮细环，黑洞剪影边缘的辉光 |
| 吸积盘（accretion disk） | 围绕黑洞高速旋转的高温气体盘；本项目为 shader 内隐式薄盘几何 |
| 引力透镜（gravitational lensing） | 光线在强引力场中弯曲的现象；本项目中使背景星空与吸积盘产生扭曲、双像与爱因斯坦环 |
| 爱因斯坦环（Einstein ring） | 观察者、黑洞、背景光源近乎共线时，背景光被弯曲成环的效应 |
| 多普勒双峰（Doppler beaming） | 盘面物质高速运动导致朝向观察者一侧更亮、背向一侧更暗的非对称明暗 |
| 温度梯度（temperature gradient） | 吸积盘内盘高温（白蓝）向外盘低温（暖橙）的颜色渐变 |
| raymarching（光线步进） | 在 fragment shader 中逐像素沿光线采样场景的技术；本项目用 Schwarzschild 度规近似计算光线弯曲 |
| Schwarzschild 度规 | 静态球对称黑洞的时空度量；本项目中光线弯曲的近似的物理基础 |
| 双像（double image） | 吸积盘经透镜在黑洞上方与下方呈现的两重像 |
| 粒子流（particle stream） | 吸积盘内的物质碎屑，沿轨道向视界螺旋吸入的粒子轨迹 |
