/**
 * Decides whether this machine gets the GPU-simulated field or the static one.
 *
 * Ping-pong FBOs mean two extra full render passes per frame, so anything that
 * looks like a phone, a low-core laptop, or a machine without renderable float
 * textures is sent down the LOW_POWER path instead.
 */

export type FieldMode = "fluid" | "static";

function hasRenderableFloatTextures() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;

    const supported =
      !!gl.getExtension("EXT_color_buffer_float") ||
      !!gl.getExtension("EXT_color_buffer_half_float");

    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return supported;
  } catch {
    return false;
  }
}

export function detectFieldMode(): FieldMode {
  if (typeof window === "undefined") return "static";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "static";
  }

  // Touch-first devices: the simulation isn't worth the battery, and there is
  // no cursor to react to anyway.
  if (window.matchMedia("(pointer: coarse)").matches) return "static";

  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores < 4) return "static";

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memory === "number" && memory <= 4) return "static";

  return hasRenderableFloatTextures() ? "fluid" : "static";
}
