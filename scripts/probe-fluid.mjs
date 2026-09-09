import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 500)));
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") {
    console.log("[" + m.type() + "]", m.text().slice(0, 600));
  }
});

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

console.log(
  "capability:",
  await page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    return {
      webgl2: !!gl,
      colorBufferFloat: gl ? !!gl.getExtension("EXT_color_buffer_float") : false,
      cores: navigator.hardwareConcurrency,
      coarsePointer: matchMedia("(pointer: coarse)").matches,
    };
  })
);

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
await page.waitForTimeout(2000);

console.log(
  "mode:",
  await page.evaluate(() => {
    const host = document.querySelector(".lwt-canvas");
    if (!host) return "none";
    return host.tagName === "CANVAS" ? "static" : "fluid (r3f wrapper)";
  })
);

await page.screenshot({ path: "f:/avishkarai2/scripts/fluid-0.png" });

// Park the cursor in the field, then move away.
await page.mouse.move(700, 700, { steps: 20 });
await page.waitForTimeout(1000);
await page.screenshot({ path: "f:/avishkarai2/scripts/fluid-1-cursor.png" });

await page.mouse.move(1380, 150, { steps: 15 });
await page.waitForTimeout(1600);
await page.screenshot({ path: "f:/avishkarai2/scripts/fluid-2-settled.png" });

await browser.close();
