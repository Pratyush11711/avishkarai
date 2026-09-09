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
await page.waitForFunction(() => !!window.__lwt, null, { timeout: 15000 });
await page.waitForTimeout(2000);

console.log(
  JSON.stringify(
    await page.evaluate(async () => {
      const d = window.__lwt;
      const material = d.material.current;
      const canvas = d.gl.domElement;
      const ctx = d.gl.getContext();

      const fragTail = material.fragmentShader.trim().slice(-160);
      const vertHasBypass = material.vertexShader.includes("mix(0.55, 0.95");

      // Read the framebuffer inside an rAF, before the compositor wipes it.
      const scan = await new Promise((resolve) => {
        requestAnimationFrame(() => {
          const w = ctx.drawingBufferWidth;
          const h = ctx.drawingBufferHeight;
          const px = new Uint8Array(w * h * 4);
          ctx.readPixels(0, 0, w, h, ctx.RGBA, ctx.UNSIGNED_BYTE, px);
          let nonZero = 0;
          let maxAlpha = 0;
          let sample = null;
          for (let i = 0; i < px.length; i += 4) {
            if (px[i] || px[i + 1] || px[i + 2] || px[i + 3]) {
              nonZero++;
              if (!sample) sample = [px[i], px[i + 1], px[i + 2], px[i + 3]];
            }
            if (px[i + 3] > maxAlpha) maxAlpha = px[i + 3];
          }
          resolve({ w, h, nonZero, maxAlpha, sample });
        });
      });

      return {
        fragTail,
        vertHasBypass,
        blending: material.blending,
        transparent: material.transparent,
        depthTest: material.depthTest,
        visible: material.visible,
        canvasSize: [canvas.width, canvas.height],
        scan,
      };
    }),
    null,
    1
  )
);

await browser.close();
