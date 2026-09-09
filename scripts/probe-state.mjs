import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 400)));

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const top = await page.evaluate(
  () => window.scrollY + document.querySelector(".lwt").getBoundingClientRect().top
);
let cur = 0;
while (cur < top + 800) {
  const step = Math.min(900, top + 800 - cur);
  await page.mouse.wheel(0, step);
  cur += step;
  await page.waitForTimeout(50);
}
await page.waitForFunction(() => !!window.__lwtSim, null, { timeout: 15000 });
await page.waitForTimeout(2500);

console.log(
  JSON.stringify(
    await page.evaluate(() => {
      const { sim, gl } = window.__lwtSim;
      const out = {};

      // Seed data straight from the CPU array.
      const seed = sim.seedTexture.image.data;
      out.seedHead = Array.from(seed.slice(0, 12)).map((v) => +v.toFixed(4));

      const readTarget = (target, label) => {
        const buf = new Float32Array(4 * 4 * 4);
        try {
          gl.readRenderTargetPixels(target, 0, 0, 4, 4, buf);
        } catch (e) {
          out[label + "Error"] = String(e).slice(0, 200);
          return;
        }
        out[label] = Array.from(buf.slice(0, 12)).map((v) =>
          Number.isFinite(v) ? +v.toFixed(4) : String(v)
        );
        let nan = 0;
        for (const v of buf) if (!Number.isFinite(v)) nan++;
        out[label + "NonFinite"] = nan + "/" + buf.length;
      };

      readTarget(sim.targets[0], "targetA");
      readTarget(sim.targets[1], "targetB");

      out.textureType = sim.targets[0].texture.type;
      out.FloatType = 1015;
      out.HalfFloatType = 1016;
      out.uniforms = {
        aspect: sim.material.uniforms.uAspect.value,
        delta: sim.material.uniforms.uDelta.value,
        flow: sim.material.uniforms.uFlowStrength.value,
        mouse: [sim.material.uniforms.uMouse.value.x, sim.material.uniforms.uMouse.value.y],
        mouseStrength: sim.material.uniforms.uMouseStrength.value,
      };
      return out;
    }),
    null,
    1
  )
);

await browser.close();
