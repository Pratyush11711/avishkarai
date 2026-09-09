const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);

  const host = () =>
    page.evaluate(() => {
      const h = document.querySelector("#process")?.parentElement?.parentElement;
      const p = h?.querySelector("svg path:last-of-type");
      return { d: p?.getAttribute("d") || "", fill: p?.getAttribute("fill") || "" };
    });

  const top = await page.evaluate(() => {
    const s = document.querySelector("#process");
    return s.getBoundingClientRect().top + window.scrollY;
  });

  console.log("reveal grows with scroll:");
  for (let i = 0; i <= 5; i++) {
    const y = top - 700 + i * 420;
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(800);
    const { d, fill } = await host();
    console.log(`  scrollY=${Math.round(y)}  d.len=${d.length}  fill=${fill}`);
  }

  const a = (await host()).d;
  await page.waitForTimeout(700);
  const b = (await host()).d;
  console.log("undulates while idle:", a !== b);

  for (let i = 0; i < 3; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), top - 200 + i * 760);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `scripts/v-${i}.png` });
  }
  console.log("errors:", errs);
  await browser.close();
})();
