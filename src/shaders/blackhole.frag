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

const float STEP_SIZE = 0.08;
const float MAX_T = 200.0;

float schwarzschildDeflection(float r, float rs) {
  return 1.5 * rs / max(r, 0.01);
}

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

float diskTemperature(float r) {
  if (r < uInnerDiskRadius) return uDiskTempInner;
  if (r > uOuterDiskRadius) return uDiskTempOuter;
  float t = (r - uInnerDiskRadius) / (uOuterDiskRadius - uInnerDiskRadius);
  return uDiskTempInner + t * (uDiskTempOuter - uDiskTempInner);
}

bool hitDisk(vec3 pos) {
  float r = length(pos.xz);
  return abs(pos.y) < uDiskHalfThickness && r >= uInnerDiskRadius && r <= uOuterDiskRadius;
}

float dopplerFactor(vec3 pos, vec3 rayDir) {
  vec3 orbitDir = normalize(cross(pos, vec3(0.0, 1.0, 0.0)));
  float cosTheta = dot(orbitDir, rayDir);
  float beta = 0.3;
  if (cosTheta >= 0.0) return 1.0 + cosTheta * beta;
  return 1.0 - abs(cosTheta) * beta * 0.7;
}

float hash21(vec2 p) {
  float h = dot(p, vec2(127.1, 311.7));
  return fract(sin(h) * 43758.5453);
}

float starNoise(vec2 uv) {
  vec2 i = floor(uv * 500.0);
  vec2 f = fract(uv * 500.0);
  float h = hash21(i);
  float brightness = smoothstep(0.98, 0.985, h);
  brightness *= (1.0 - length(f - 0.5) * 2.0);
  return brightness;
}

vec3 sampleStarfield(vec3 dir) {
  float phi = atan(dir.z, dir.x);
  float theta = acos(clamp(dir.y, -1.0, 1.0));
  float u = phi / 6.28318 + 0.5;
  float v = theta / 3.14159;
  float star1 = starNoise(vec2(u, v));
  float star2 = starNoise(vec2(u + 0.3, v + 0.6));
  float star3 = starNoise(vec2(u + 0.7, v + 0.2));
  float brightness = star1 + star2 * 0.6 + star3 * 0.3;
  return vec3(brightness * 0.9, brightness * 0.85, brightness);
}

void main() {
  vec4 ndc = vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
  vec4 worldPos = uInvProjViewMatrix * ndc;
  vec3 rayOrigin = uCameraPos;
  vec3 rayDir = normalize(worldPos.xyz / worldPos.w - uCameraPos);

  float t = 0.1;
  vec3 accumulatedColor = vec3(0.0);
  float samples = 0.0;
  bool hitEventHorizon = false;

  for (int i = 0; i < 64; i++) {
    if (i >= uMaxSteps) break;

    vec3 pos = rayOrigin + rayDir * t;
    float r = length(pos);

    if (r < uRS) {
      hitEventHorizon = true;
      break;
    }

    float deflection = schwarzschildDeflection(r, uRS);
    vec3 deflectionDir = -normalize(pos);
    rayDir = normalize(rayDir + deflection * deflectionDir);

    if (hitDisk(pos)) {
      float tempK = diskTemperature(length(pos.xz));
      vec3 diskColor = blackbodyToRGB(tempK);
      float doppler = dopplerFactor(pos, -rayDir);
      accumulatedColor += diskColor * doppler * 0.4;
      samples += 0.4;
    }

    float photonRingR = r / uRS;
    if (photonRingR > 1.4 && photonRingR < 1.7) {
      float ringIntensity = (1.0 - abs(photonRingR - 1.55) / 0.15);
      ringIntensity = pow(ringIntensity, 4.0);
      accumulatedColor += vec3(ringIntensity * 0.3);
    }

    t += STEP_SIZE;
    if (t > MAX_T) break;
  }

  if (hitEventHorizon) {
    gl_FragColor = vec4(accumulatedColor, 1.0);
  } else {
    vec3 starColor = sampleStarfield(rayDir);
    vec3 finalColor = mix(starColor, accumulatedColor / max(samples, 1.0), clamp(samples, 0.0, 1.0));
    gl_FragColor = vec4(finalColor, 1.0);
  }
}
