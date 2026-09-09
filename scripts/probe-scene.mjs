import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 400)));
page.on("console", (m) => {
  if (m.type() === "error") console.log("[error]", m.text().slice(0, 400));
});

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

await page.waitForFunction(() => !!window.__lwt, null, { timeout: 15000 }).catch(() => {
  console.log("!! window.__lwt never appeared — FieldMesh did not mount");
});
await page.waitForTimeout(2500);

const info = await page.evaluate(() => {
  const d = window.__lwt;
  if (!d) return { missing: true };
  const nodes = [];
  d.scene.traverse((o) => {
    nodes.push({
      type: o.type,
      visible: o.visible,
      frustumCulled: o.frustumCulled,
      matType: o.material ? o.material.type : null,
      instanced: o.geometry ? !!o.geometry.isInstancedBufferGeometry : null,
      instanceCount: o.geometry ? o.geometry.instanceCount : null,
      layers: o.layers ? o.layers.mask : null,
    });
  });
  return {
    frames: d.frames,
    render: { ...d.gl.info.render },
    autoClear: d.gl.autoClear,
    clearAlpha: d.gl.getClearAlpha(),
    nodes,
  };
});
console.log(JSON.stringify(info, null, 1));

await page.screenshot({ path: "f:/avishkarai2/scripts/scene.png" });
await browser.close();
