import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Count GL work without touching component code.
await page.addInitScript(() => {
  window.__gl = { instanced: 0, arrays: 0, elements: 0, programFails: 0, logs: [] };
  const proto = WebGL2RenderingContext.prototype;

  const wrap = (name, key) => {
    const original = proto[name];
    proto[name] = function (...args) {
      window.__gl[key]++;
      return original.apply(this, args);
    };
  };
  wrap("drawElementsInstanced", "instanced");
  wrap("drawArrays", "arrays");
  wrap("drawElements", "elements");

  const linkProgram = proto.linkProgram;
  proto.linkProgram = function (program) {
    linkProgram.call(this, program);
    if (!this.getProgramParameter(program, this.LINK_STATUS)) {
      window.__gl.programFails++;
      window.__gl.logs.push(String(this.getProgramInfoLog(program)).slice(0, 300));
    }
  };
});

page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 300)));

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

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
await page.waitForTimeout(500);

const before = await page.evaluate(() => ({ ...window.__gl, logs: undefined }));
await page.waitForTimeout(2000);
const after = await page.evaluate(() => window.__gl);

console.log("draw calls in 2s:", {
  instanced: after.instanced - before.instanced,
  arrays: after.arrays - before.arrays,
  elements: after.elements - before.elements,
});
console.log("program link failures:", after.programFails);
if (after.logs.length) console.log(after.logs);

await browser.close();
