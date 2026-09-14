import fs from "node:fs";
import path from "node:path";
import { resolveShader } from "@vgpu/wgsl/runtime";

const root = path.resolve("components/hero/triangle-led-front/shaders");
const entries = [
  "direct-triangle-raycast.wgsl",
  "floor-noise.wgsl",
  "led-emitters.wgsl",
  "themes/dark/main-scene-floor.wgsl",
];

for (const rel of entries) {
  const entry = path.join(root, rel);
  const resolved = await resolveShader({ entry, validate: "off" });
  const out = entry.replace(/\.wgsl$/, ".generated.ts");
  fs.writeFileSync(
    out,
    `const source = ${JSON.stringify(resolved.wgsl)};\nexport default source;\n`
  );
  console.log(rel, "->", path.relative(process.cwd(), out), resolved.wgsl.length);
}
