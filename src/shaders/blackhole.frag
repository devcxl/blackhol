precision highp float;

varying vec2 vUv;

uniform vec3 uCameraPos;
uniform mat4 uInvProjViewMatrix;
uniform float uTime;
uniform float uRS;
uniform float uInnerDiskRadius;
uniform float uOuterDiskRadius;
uniform float uDiskTempInner;
uniform float uDiskTempOuter;

// 视觉剪影半径：临界碰撞参数 b_crit = √27/2 · rs ≈ 2.6·rs，
// 即屏幕上黑洞阴影的视觉边缘半径
const float BCRIT = 2.6;

vec3 blackbodyToRGB(float tempK) {
  float t = tempK / 1000.0;
  float r, g, b;
  if (t <= 2.0) {
    r = 1.0; g = 0.08 * (t - 1.0); b = 0.0;
  } else if (t <= 4.0) {
    r = 1.0; g = 0.1 + 0.4 * ((t - 2.0) / 2.0); b = 0.05 * ((t - 2.0) / 2.0);
  } else if (t <= 7.0) {
    r = 1.0 - 0.1 * ((t - 4.0) / 3.0); g = 0.5 + 0.4 * ((t - 4.0) / 3.0); b = 0.05 + 0.75 * ((t - 4.0) / 3.0);
  } else {
    r = 0.9 - 0.2 * ((t - 7.0) / 3.0); g = 0.9 - 0.1 * ((t - 7.0) / 3.0); b = 0.8 + 0.2 * ((t - 7.0) / 3.0);
  }
  return vec3(clamp(r, 0.0, 1.0), clamp(g, 0.0, 1.0), clamp(b, 0.0, 1.0));
}

// 温度沿半径平滑过渡
float diskTemperature(float r) {
  float t = smoothstep(uInnerDiskRadius, uOuterDiskRadius, r);
  return mix(uDiskTempInner, uDiskTempOuter, t);
}

// 相机拉远后盘特征缩小到亚像素级，按相机距离等比加宽软化带（LOD）
float diskSoftScale() {
  return 1.0 + max(length(uCameraPos) - 18.0, 0.0) * 0.05;
}

// 多普勒聚束：物质运动方向与光传播方向（相机方向）同向 → 蓝移更亮。
// 相对论多普勒非对称：蓝移侧增强强于红移侧减弱；
// 高光软压缩避免亮侧过曝成片
float dopplerFactor(vec3 pos, vec3 rayDir) {
  vec3 orbitDir = normalize(cross(pos, vec3(0.0, 1.0, 0.0)));
  float cosTheta = dot(orbitDir, rayDir);
  float beta = 0.4;
  float d;
  if (cosTheta >= 0.0) d = 1.0 + cosTheta * beta;
  else d = 1.0 - abs(cosTheta) * beta * 0.72;
  float delta = d - 1.0;
  return 1.0 + delta / (1.0 + abs(delta) * 1.5);
}

// 3D 方向空间哈希星空：直接对方向向量做网格哈希，避免 2D 球坐标映射在
// 极角接缝（φ=±π）处产生可见的垂直接缝线
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

// 3D 值噪声：银河雾带与盘面湍流调制
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash13(i);
  float n100 = hash13(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash13(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash13(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash13(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash13(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash13(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash13(i + vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
    mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
    f.z);
}

vec3 sampleStarfield(vec3 dir) {
  vec3 col = vec3(0.0);
  for (int layer = 0; layer < 4; layer++) {
    // 无理数倍率破坏网格周期性（整数倍率会在屏幕上产生可辨的规则星点结构）
    float scale = 61.7 + 43.3 * float(layer);
    vec3 cell = floor(dir * scale);
    vec3 f = fract(dir * scale);
    float h = hash13(cell);
    // 星星稀疏度随层增加、亮度随层递增（远景星暗密、近景星亮疏）
    float threshold = 0.972 + 0.015 * float(layer);
    float star = smoothstep(threshold, threshold + 0.02, h);
    // 星点尺寸多样化：按 cell 哈希缩放平滑半径，形成自然的恒星大小分布
    float size = 0.7 + 0.5 * hash13(cell + 3.1);
    float core = 1.0 - length(f - 0.5) * 2.0;
    star *= smoothstep(0.0, 0.05 / size, core);
  float brightness = star * (0.35 + 0.45 * float(layer));
  // 色温变化：偏蓝的炽热星与偏暖的红矮星混合
  float tintH = hash13(cell + 7.7);
  vec3 tint = mix(vec3(0.65, 0.72, 1.0), vec3(1.0, 0.92, 0.78), tintH);
  col += tint * brightness * 0.08;
  }
  return col;
}

// 银河雾带：沿银河轴大圆分布的柔和雾气，非线性拉伸对比度让尘埃
// 结构可辨；背景不再死黑，增加空间纵深
float milkyWay(vec3 dir) {
  vec3 axis = normalize(vec3(0.35, 0.85, 0.2));
  float band = exp(-abs(dot(dir, axis)) * 2.2);
  float n1 = vnoise(dir * 2.0 + vec3(11.0, 3.0, 5.0));
  float n2 = vnoise(dir * 4.5 + vec3(4.0, 9.0, 2.0)) * 0.5;
  float n3 = vnoise(dir * 9.0 + vec3(7.0, 1.0, 6.0)) * 0.25;
  float n = n1 + n2 + n3 - 0.8;
  return max(n * band, 0.0) * 2.0;
}

// 绕轴旋转（罗德里格斯公式）
vec3 rotateAround(vec3 v, vec3 axis, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
}

// ACES Filmic tone mapping（近似）：把 HDR 累积色压缩到 [0,1]，
// 避免内盘白热/光子环过曝成纯白
vec3 acesFilmic(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

// 盘亮度样本：交点处解析计算颜色与权重。
// 纹理三要素：螺旋密度波（对数螺旋臂）、差速剪切纹理（开普勒角速度
// 随半径衰减，纹理沿轨道剪切拉伸成丝状）、外缘非均匀物质扰动
vec3 diskSample(vec3 hitPos, float rho, vec3 lightDir, float soft) {
  float theta = atan(hitPos.z, hitPos.x);
  float inner = smoothstep(uInnerDiskRadius - 0.35 * soft, uInnerDiskRadius, rho);
  // 外缘起伏：吸积盘外缘并非完美圆，物质扰动使边缘呈三叶形态
  float outerR = uOuterDiskRadius * (1.0 + 0.05 * sin(theta * 3.0 + 1.0));
  float outer = 1.0 - smoothstep(outerR - 1.6 * soft, outerR, rho);
  float w = max(inner * outer, 0.0);
  if (w < 0.01) return vec3(0.0);
  // 螺旋坐标拉伸：θ' = θ - k·ln(rho)，噪声在 (θ', ln rho) 空间采样，
  // 方形噪声 cell 在物理空间被拉成沿对数螺旋方向的长丝——
  // 吸积盘密度波的天然形态。
  // 频率与屏幕分辨率匹配：横带上约 20 个纹理 cell（每个 ~50px）
  float k = 1.2;
  float ang = uTime * 0.5 / pow(max(rho, 1.5), 0.75);
  float th = theta - ang - k * log(rho);
  float lr = log(rho);
  float shear = vnoise(vec3(th * 5.5, lr * 7.5, 7.3)) * 0.72
    + vnoise(vec3(th * 11.0, lr * 13.0, 2.9)) * 0.28;
  float turb = 0.5 + 0.5 * shear;
  // 螺旋臂整体增强：沿同一螺旋坐标的相干低频调制
  float arm = 0.8 + 0.2 * (0.5 + 0.5 * sin(th * 2.0 - uTime * 0.1));
  // 温度扰动：盘面温度随密度波起伏，冷热斑块增强物质感
  float tempK = diskTemperature(rho) * (0.85 + 0.3 * shear);
  vec3 col = blackbodyToRGB(tempK);
  float doppler = dopplerFactor(hitPos, lightDir);
  // 表面亮度 ∝ r^-1.5：内缘白热、向外渐暗。
  // 上限压低到 0.2：高亮平台会洗白纹理，纹理必须在中间调可见
  float rhoEff = max(rho, uInnerDiskRadius * 1.08);
  float brightness = 0.36 * pow(uInnerDiskRadius * 1.08 / rhoEff, 1.5);
  brightness = clamp(brightness, 0.04, 0.2);
  return col * doppler * brightness * turb * arm * w;
}

void main() {
  vec4 ndc = vec4(vUv * 2.0 - 1.0, 0.0, 1.0);
  vec4 worldPos = uInvProjViewMatrix * ndc;
  vec3 cam = uCameraPos;
  vec3 dir = normalize(worldPos.xyz / worldPos.w - cam);

  float soft = diskSoftScale();
  float bCrit = BCRIT * uRS;

  // ---- 光线几何（解析模型）：直线入射线 → 近拱点 → 解析偏转 → 直线出射线 ----
  // 近拱点（光线离黑洞最近的点，近似）
  float tMin = -dot(cam, dir);
  vec3 closest = cam + dir * tMin;
  // 碰撞参数 = 近拱点到黑洞的距离（单位方向下 |cross(cam,dir)| 等价）
  float b = length(closest);

  vec3 diskAcc = vec3(0.0);
  vec3 background = vec3(0.0);
  float edgeVis = smoothstep(bCrit, bCrit + 0.4 * uRS, b);

  // ---- 近侧盘（入射线与盘平面 y=0 的交点）：
  // 屏幕上剪影下方的盘横带；盘交点在近拱点之前才算（否则被黑洞遮挡） ----
  float t1 = -cam.y / dir.y;
  vec3 hit1 = cam + dir * t1;
  float rho1 = length(hit1.xz);
  if (dir.y < -1e-4 && t1 > 0.0 && t1 < tMin) {
    // 掠射增亮：edge-on 时投影压缩使盘面单位像素亮度升高；
    // 上限收紧防止横带中心过曝成纯白板条
    float graze = clamp(0.18 / max(abs(dir.y), 0.18), 0.5, 1.0);
    diskAcc += diskSample(hit1, rho1, -dir, soft) * graze;
  }

  if (b < bCrit - 0.3 * uRS) {
    // ---- 视界剪影：纯黑（近侧盘横带已在前面积累，保留剪影前景的盘亮度） ----
    gl_FragColor = vec4(acesFilmic(diskAcc), 1.0);
    return;
  }

  // ---- 解析偏转角：弱场项 2·rs/b + 近临界增强项。
  // 增强项让 b 接近临界时偏转达到 ~3.6 rad（模拟光子球附近的强绕行），
  // b 大时迅速退化为弱场值。φ(b) 单调连续 → 屏幕像完全平滑 ----
  float phi = 2.0 * uRS / max(b, 0.5 * uRS)
    + 2.9 * exp(-max(b - bCrit, 0.0) * 1.1 / uRS);
  // 绕行越多（偏转越大）的高阶像越暗（物理 demagnification）；
  // 衰减系数 0.55 让下方双像保持可读
  float bendAtten = exp(-max(phi - 2.2, 0.0) * 0.55);

  // ---- 出射线：偏转后方向 ----
  vec3 axis = cross(dir, closest) / max(b, 1e-5);
  vec3 dir2 = rotateAround(dir, axis, phi);

  // ---- 远侧盘像（出射线与盘平面 y=0 的交点）：上方拱形 + 下方双像 ----
  if (dir2.y < -1e-4) {
    float s2 = -closest.y / dir2.y;
    if (s2 > 0.0) {
      vec3 hit2 = closest + dir2 * s2;
      float rho2 = length(hit2.xz);
      diskAcc += diskSample(hit2, rho2, -dir2, soft) * bendAtten;
    }
  }

  // ---- 光子环：紧贴剪影的解析亮环（b 略大于临界）。
  // 物理上这些光子在光子球附近绕行，形成剪影边缘的极亮细环。
  // 衰减系数 4.5 让环极细（半宽 ~0.15·rs），与下方的盘双像分离 ----
  float ring = exp(-max(b - bCrit, 0.0) * 8.0 / uRS) * 0.5;
  // 剪影边缘 AA：临界附近平滑过渡
  ring *= edgeVis;
  diskAcc += vec3(1.0, 0.92, 0.75) * ring;

  // ---- 背景：偏转后的方向采样星空与银河。
  // b 接近临界时 φ 的导数大，偏转后方向在屏幕上剧烈变化，
  // 星空被透镜拉伸成弧（爱因斯坦环），自然出现 ----
  vec3 starColor = sampleStarfield(dir2) * edgeVis;
  float band = exp(-abs(dot(dir2, normalize(vec3(0.35, 0.85, 0.2)))) * 2.2);
  float nebula = milkyWay(dir2) * 0.16 * edgeVis;
  vec3 nebulaColor = mix(vec3(0.78, 0.7, 0.58), vec3(0.5, 0.56, 0.85), band) * nebula;
  background = starColor + nebulaColor;

  // 盘是自发光物体与背景相加
  gl_FragColor = vec4(acesFilmic(diskAcc + background), 1.0);
}
