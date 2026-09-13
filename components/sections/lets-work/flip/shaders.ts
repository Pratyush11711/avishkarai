/**
 * Simplified Lusion flip-particle shaders.
 * Orthographic panel space: x right, y down (matches DOM).
 */
export const FLIP_VERTEX = /* glsl */ `
  attribute vec2 instancedPos;
  attribute vec2 instancedInfo;

  uniform vec2 u_tankOffset;
  uniform vec2 u_tankActualSize;
  uniform vec2 u_sectionSize;
  uniform float u_radius;
  uniform float u_opacity;

  void main() {
    float angle = instancedInfo.x;
    float s = sin(angle);
    float c = cos(angle);
    mat2 rot = mat2(c, -s, s, c);

    vec2 norm = (instancedPos - u_tankOffset) / u_tankActualSize;
    vec2 center = vec2(norm.x * u_sectionSize.x, (1.0 - norm.y) * u_sectionSize.y);

    float particleSize = 1.0 + min(1.0, abs(instancedInfo.y) * 0.01);
    float scale = u_radius * particleSize * (u_sectionSize.x / u_tankActualSize.x) * 2.0 * u_opacity;

    vec2 offset = rot * position.xy * scale;
    vec2 pos = center + offset;

    gl_Position = vec4(
      (pos.x / u_sectionSize.x) * 2.0 - 1.0,
      -((pos.y / u_sectionSize.y) * 2.0 - 1.0),
      0.0,
      1.0
    );
  }
`;

export const FLIP_FRAGMENT = /* glsl */ `
  uniform vec3 u_color;

  void main() {
    gl_FragColor = vec4(u_color, 1.0);
  }
`;
