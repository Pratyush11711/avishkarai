/**
 * GLSL for the GPU-simulated particle field.
 *
 * Two passes:
 *   1. `SIMULATION_FRAGMENT` advances particle state in an off-screen texture
 *      (RG = position, BA = velocity) driven by a curl-noise flow field.
 *   2. `PARTICLE_VERTEX` / `PARTICLE_FRAGMENT` read that texture per instance
 *      and draw the four shapes procedurally.
 *
 * Space convention: positions are 0..1 across the *panel*, with y running top
 * to bottom to match the DOM and the CPU fallback. That is upside-down relative
 * to usual GL convention, so "push down" means increasing y.
 */

export const FULLSCREEN_VERTEX = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Curl noise: take a scalar potential and use its perpendicular gradient. The
 * result is divergence-free, which is what stops particles from bunching into
 * sinks the way a raw noise vector field does.
 */
const NOISE_CHUNK = /* glsl */ `
  float hash21(vec2 p) {
    p = fract(p * vec2(127.31, 311.7));
    p += dot(p, p + 34.19);
    return fract(p.x * p.y);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // Two octaves is plenty: the field reads as drifting sand, not turbulence.
  float potential(vec2 p) {
    return valueNoise(p) * 0.65 + valueNoise(p * 2.13 + 11.7) * 0.35;
  }

  vec2 curlNoise2D(vec2 p) {
    const float e = 0.045;
    float dx = potential(p + vec2(e, 0.0)) - potential(p - vec2(e, 0.0));
    float dy = potential(p + vec2(0.0, e)) - potential(p - vec2(0.0, e));
    // Perpendicular gradient, normalised by the sample distance.
    return vec2(dy, -dx) / (2.0 * e);
  }
`;

/** CPU twin lives in `field.ts` as `fieldEdge` — keep the two in step. */
const WAVE_MASK_CHUNK = /* glsl */ `
  float maskHeight(float x) {
    return 0.44
      + 0.055 * sin(x * 6.1 + 1.3)
      + 0.035 * sin(x * 12.7 + 3.9)
      + 0.022 * sin(x * 23.3 + 0.7);
  }
`;

export const SIMULATION_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D uPrevState;
  uniform sampler2D uSeed;

  uniform float uTime;
  uniform float uDelta;
  uniform float uAspect;

  uniform float uNoiseScale;
  uniform float uFlowSpeed;
  uniform float uFlowStrength;
  uniform float uDamping;

  uniform vec2 uMouse;
  uniform float uMouseRadius;
  uniform float uMouseStrength;

  uniform float uHomePull;
  uniform float uPullDown;

  varying vec2 vUv;

  ${NOISE_CHUNK}
  ${WAVE_MASK_CHUNK}

  void main() {
    vec4 state = texture2D(uPrevState, vUv);
    vec2 seed = texture2D(uSeed, vUv).xy;

    vec2 pos = state.xy;
    vec2 vel = state.zw;

    // Sample the flow in square space so features aren't stretched by the
    // panel's aspect ratio, then convert the result back.
    vec2 square = vec2(pos.x * uAspect, pos.y);
    vec2 flow = curlNoise2D(square * uNoiseScale + uTime * uFlowSpeed);
    flow.x /= uAspect;
    flow *= uFlowStrength;

    // Cursor repulsion, circular in screen space rather than in normalised space.
    vec2 toMouse = vec2((pos.x - uMouse.x) * uAspect, pos.y - uMouse.y);
    float dist = length(toMouse);
    float influence = smoothstep(uMouseRadius, 0.0, dist);
    vec2 mouseForce = vec2(0.0);
    if (dist > 1e-5) {
      vec2 dir = toMouse / dist;
      dir.x /= uAspect;
      mouseForce = dir * influence * uMouseStrength;
    }

    // Without this the flow field slowly homogenises the density gradient and
    // the wave stops reading as settled sand.
    vec2 home = (seed - pos) * uHomePull;

    vec2 target = flow + mouseForce + home;
    vel = mix(vel, target, uDamping);

    // Soft ceiling along the wave line.
    float edge = maskHeight(pos.x);
    if (pos.y < edge) {
      vel.y += (edge - pos.y) * uPullDown;
    }
    if (pos.y > 1.02) {
      vel.y -= (pos.y - 1.02) * uPullDown;
    }

    pos += vel * uDelta;

    // Wrap sideways so the field never thins at the edges.
    if (pos.x < -0.02) pos.x += 1.04;
    if (pos.x > 1.02) pos.x -= 1.04;

    // Safety net: anything that escapes the band restarts at its seed.
    if (pos.y < edge - 0.2 || pos.y > 1.2) {
      pos = seed;
      vel = vec2(0.0);
    }

    gl_FragColor = vec4(pos, vel);
  }
`;

export const PARTICLE_VERTEX = /* glsl */ `
  precision highp float;

  attribute vec2 aRef;
  attribute float aShape;
  attribute float aSize;
  attribute float aRot;
  attribute float aRotSpeed;
  attribute float aDelay;

  uniform sampler2D uState;
  uniform vec2 uResolution;
  uniform float uFieldTop;
  uniform float uReveal;
  uniform float uTime;
  uniform float uSizeScale;
  uniform float uSpeedGain;

  varying vec2 vQuad;
  varying float vShape;
  varying float vAlpha;

  ${WAVE_MASK_CHUNK}

  void main() {
    vec4 state = texture2D(uState, aRef);
    vec2 pos = state.xy;
    float speed = length(state.zw);
    if (pos.x == 0.0 && pos.y == 0.0) { pos = vec2(aRef.x, mix(0.55, 0.95, aRef.y)); }

    float appear = clamp((uReveal - aDelay) / 0.45, 0.0, 1.0);

    // Panel space -> canvas space. The canvas starts partway down the panel.
    float yCanvas = (pos.y - uFieldTop) / (1.0 - uFieldTop);

    float size = aSize * appear * uSizeScale;
    float angle = aRot + uTime * aRotSpeed;
    float c = cos(angle);
    float s = sin(angle);
    vec2 corner = position.xy;
    vec2 rotated = vec2(corner.x * c - corner.y * s, corner.x * s + corner.y * c);
    vec2 offsetPx = rotated * size;

    vec2 ndc = vec2(pos.x * 2.0 - 1.0, 1.0 - yCanvas * 2.0);
    ndc += vec2(
      offsetPx.x / uResolution.x * 2.0,
      -offsetPx.y / uResolution.y * 2.0
    );

    // Faster shapes read brighter, and the sparse crest fades out so the field
    // still looks like sand settling rather than an even cloud.
    float depth = clamp((pos.y - maskHeight(pos.x)) * 3.0, 0.0, 1.0);
    vAlpha = appear * mix(0.55, 1.0, depth) * (0.82 + clamp(speed * uSpeedGain, 0.0, 0.35));
    vQuad = corner;
    vShape = aShape;

    gl_Position = vec4(ndc, 0.0, 1.0);
  }
`;

export const PARTICLE_FRAGMENT = /* glsl */ `
  precision highp float;

  varying vec2 vQuad;
  varying float vShape;
  varying float vAlpha;

  float boxDist(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }

  float triangleDist(vec2 p) {
    // Apex at the top, base across the bottom of the quad.
    float base = p.y - 0.42;
    vec2 side = normalize(vec2(1.0, -0.5));
    float slope = dot(vec2(abs(p.x), p.y) - vec2(0.0, -0.45), side);
    return max(base, slope);
  }

  void main() {
    float d;

    if (vShape < 0.5) {
      d = boxDist(vQuad, vec2(0.36));
    } else if (vShape < 1.5) {
      d = length(vQuad) - 0.38;
    } else if (vShape < 2.5) {
      d = min(boxDist(vQuad, vec2(0.42, 0.1)), boxDist(vQuad, vec2(0.1, 0.42)));
    } else {
      d = triangleDist(vQuad);
    }

    // Shapes are only a few pixels across, so they need real anti-aliasing.
    float aa = max(fwidth(d), 1e-5);
    float alpha = (1.0 - smoothstep(-aa, aa, d)) * vAlpha;

    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`;
