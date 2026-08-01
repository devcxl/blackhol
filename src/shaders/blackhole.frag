precision highp float;

varying vec2 vUv;

uniform vec3 uCameraPos;
uniform mat4 uInvProjViewMatrix;
uniform float uTime;
uniform vec2 uResolution;
uniform int uMaxSteps;
uniform float uRS;
uniform float uDiskHalfThickness;
uniform float uInnerDiskRadius;
uniform float uOuterDiskRadius;
uniform float uDiskTempInner;
uniform float uDiskTempOuter;

const float STEP_SIZE = 0.1;
const float EPSILON = 0.001;

float schwarzschildDeflection(float r, float rs) {
  return 1.5 * rs / r;
}

vec3 blackbodyToRGB(float tempK) {
  float t = tempK / 1000.0;
  float r, g, b;
  if (t <= 2.0) {
    r = 1.0;
    g = 0.08 * (t - 1.0);
    b = 0.0;
  } else if (t <= 4.0) {
    r = 1.0;
    g = 0.1 + 0.4 * ((t - 2.0) / 2.0);
    b = 0.05 * ((t - 2.0) / 2.0);
  } else if (t <= 7.0) {
    r = 1.0 - 0.1 * ((t - 4.0) / 3.0);
    g = 0.5 + 0.4 * ((t - 4.0) / 3.0);
    b = 0.05 + 0.75 * ((t - 4.0) / 3.0);
  } else {
    r = 0.9 - 0.2 * ((t - 7.0) / 3.0);
    g = 0.9 - 0.1 * ((t - 7.0) / 3.0);
    b = 0.8 + 0.2 * ((t - 7.0) / 3.0);
  }
  return vec3(clamp(r, 0.0, 1.0), clamp(g, 0.0, 1.0), clamp(b, 0.0, 1.0));
}

float diskTemperature(float r) {
  if (r < uInnerDiskRadius) return uDiskTempInner;
  if (r > uOuterDiskRadius) return uDiskTempOuter;
  float t = (r - uInnerDiskRadius) / (uOuterDiskRadius - uInnerDiskRadius);
  return uDiskTempInner + t * (uDiskTempOuter - uDiskTempInner);
}

bool hitDisk(vec3 pos) {
  float r = length(pos.xz);
  return abs(pos.y) < uDiskHalfThickness &&
         r >= uInnerDiskRadius &&
         r <= uOuterDiskRadius;
}

vec3 sampleStarfield(vec3 dir) {
  float phi = atan(dir.z, dir.x);
  float theta = acos(dir.y);
  float hash = fract(sin(phi * 127.1 + theta * 311.7) * 43758.5453);
  float brightness = smoothstep(0.995, 1.0, hash);
  return vec3(brightness * 0.8);
}

void main() {
  vec4 ndc = vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
  vec4 worldPos = uInvProjViewMatrix * ndc;
  vec3 rayDir = normalize(worldPos.xyz / worldPos.w - uCameraPos);

  vec3 rayOrigin = uCameraPos;
  float t = 0.0;
  vec3 accumulatedColor = vec3(0.0);
  float accumulatedAlpha = 0.0;

  for (int i = 0; i < 64; i++) {
    if (i >= uMaxSteps) break;

    vec3 pos = rayOrigin + rayDir * t;
    float r = length(pos);

    if (r < uRS) {
      gl_FragColor = vec4(accumulatedColor, 1.0);
      return;
    }

    float deflection = schwarzschildDeflection(r, uRS);
    vec3 deflectionDir = -normalize(pos);
    rayDir = normalize(rayDir + deflection * deflectionDir);

    if (hitDisk(pos)) {
      float tempK = diskTemperature(length(pos.xz));
      vec3 diskColor = blackbodyToRGB(tempK);
      float doppler = 1.0;
      accumulatedColor = mix(accumulatedColor, diskColor * doppler, 0.5);
      accumulatedAlpha += 0.3;
    }

    if (r > 1.4 * uRS && r < 1.6 * uRS) {
      float ringBrightness = smoothstep(1.6, 1.5, r / uRS) * smoothstep(1.4, 1.5, r / uRS);
      accumulatedColor += vec3(ringBrightness * 0.2);
    }

    t += STEP_SIZE;
  }

  vec3 starColor = sampleStarfield(rayDir);
  vec3 finalColor = mix(starColor, accumulatedColor, clamp(accumulatedAlpha, 0.0, 1.0));
  gl_FragColor = vec4(finalColor, 1.0);
}
