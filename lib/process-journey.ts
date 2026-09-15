/** Four unique finals — ink, brand blue, pale tint, cyan. No two cards share a stop. */
export const PROCESS_STOPS = ["#0a0e27", "#3040ff", "#eef0ff", "#4fd8ff"] as const;

export type RGB = { r: number; g: number; b: number };

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function mixRgb(a: RGB, b: RGB, t: number): RGB {
  const u = t < 0 ? 0 : t > 1 ? 1 : t;
  return {
    r: a.r + (b.r - a.r) * u,
    g: a.g + (b.g - a.g) * u,
    b: a.b + (b.b - a.b) * u,
  };
}

const STOP_RGB: RGB[] = PROCESS_STOPS.map(hexToRgb);

/** Lead-in tones — never another card's final. */
const LEAD_IN: RGB[] = [
  { r: 4, g: 6, b: 18 },
  mixRgb(STOP_RGB[0], STOP_RGB[1], 0.22),
  mixRgb(STOP_RGB[1], STOP_RGB[2], 0.18),
  mixRgb(STOP_RGB[2], STOP_RGB[3], 0.2),
];

export function cssRgb(c: RGB) {
  return `rgb(${c.r | 0} ${c.g | 0} ${c.b | 0})`;
}

export function luminance(c: RGB) {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

/** Card i always resolves to PROCESS_STOPS[i]. */
export function cardBg(index: number, t: number): RGB {
  const to = STOP_RGB[index] ?? STOP_RGB[STOP_RGB.length - 1];
  const from = LEAD_IN[index] ?? to;
  return mixRgb(from, to, t);
}

export function paintProcessCard(el: HTMLElement, index: number, t: number) {
  const bg = cardBg(index, t);
  const light = luminance(bg) > 0.38;
  el.style.setProperty("--process-bg", cssRgb(bg));
  el.style.setProperty("--process-ink", light ? "#12131a" : "#ffffff");
  el.style.setProperty(
    "--process-ink-muted",
    light ? "rgba(18,19,26,0.56)" : "rgba(255,255,255,0.62)"
  );
  el.style.setProperty(
    "--process-body",
    light ? "#3a3d52" : "rgba(255,255,255,0.78)"
  );
  el.style.setProperty(
    "--process-numeral",
    light ? "rgba(18,19,26,0.12)" : "rgba(255,255,255,0.16)"
  );
  el.style.setProperty(
    "--process-tag-bg",
    light ? "rgba(18,19,26,0.06)" : "rgba(255,255,255,0.12)"
  );
  el.style.setProperty("--process-tag-ink", light ? "#12131a" : "#ffffff");
  el.style.setProperty(
    "--process-tag-border",
    light ? "rgba(18,19,26,0.12)" : "rgba(255,255,255,0.22)"
  );
}

export function mixJourneyRgb(t: number): RGB {
  const n = STOP_RGB.length - 1;
  const x = (t < 0 ? 0 : t > 1 ? 1 : t) * n;
  const i = Math.min(n - 1, Math.floor(x));
  return mixRgb(STOP_RGB[i], STOP_RGB[i + 1], x - i);
}
