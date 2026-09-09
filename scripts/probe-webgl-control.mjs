import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 400, height: 300 } });

await page.setContent(
  '<body style="margin:0;background:#0000ff">' +
    '<canvas id="c" width="400" height="300" style="width:400px;height:300px"></canvas>' +
    "</body>"
);

console.log(
  await page.evaluate(() => {
    const gl = document.getElementById("c").getContext("webgl2", { alpha: true });
    if (!gl) return "no webgl2";
    gl.clearColor(0, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return "cleared green";
  })
);

await page.waitForTimeout(500);
await page.screenshot({ path: "f:/avishkarai2/scripts/webgl-control.png" });

// Sample the middle pixel of the screenshot via a second canvas read.
console.log(
  "center pixel:",
  await page.evaluate(() => {
    const gl = document.getElementById("c").getContext("webgl2");
    const px = new Uint8Array(4);
    gl.readPixels(200, 150, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return Array.from(px);
  })
);

await browser.close();
