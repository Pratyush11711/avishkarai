import { fit } from "./math-utils";

export interface TankConfig {
  tankWidth: number;
  tankHeight: number;
  cellSize: number;
  particleRadius: number;
  gravity: number;
  numParticles: number;
  particleWidth: number;
}

/** Lusion FlipAnimation.reInitTank sizing (shaped mode). */
export function buildTankConfig(
  viewportWidth: number,
  viewportHeight: number
): TankConfig {
  const aspect = viewportHeight / Math.max(viewportWidth, 1);
  const tankWidth = 2;
  const tankHeight = tankWidth * aspect;
  const particleWidth = Math.ceil(fit(viewportWidth, 320, 2560, 20, 90));
  const cellSize = tankWidth / particleWidth;
  const gravity = Math.ceil(fit(viewportWidth, 320, 2560, -15, -3));
  const particleRadius = 0.2 * cellSize;
  const gridW = Math.ceil(fit(viewportWidth, 320, 2560, 20, 80));
  const gridH = Math.ceil((gridW * viewportHeight) / Math.max(viewportWidth, 1));
  const numParticles = Math.ceil((gridW * gridH) / 4) * 4;

  return {
    tankWidth,
    tankHeight,
    cellSize,
    particleRadius,
    gravity,
    numParticles,
    particleWidth,
  };
}

/** Map section pixel coords to FlipSim tank space. */
export function pixelToTank(
  px: number,
  py: number,
  sectionW: number,
  sectionH: number,
  tankInnerW: number,
  tankInnerH: number,
  tankOffset: number
) {
  const x = (px / sectionW) * tankInnerW + tankOffset;
  const y = ((sectionH - py) / sectionH) * tankInnerH + tankOffset;
  return { x, y };
}

/** Map DOM rect (section-relative px) to tank collider rect. */
export function pixelRectToTank(
  rect: { x: number; y: number; w: number; h: number },
  sectionW: number,
  sectionH: number,
  tankInnerW: number,
  tankInnerH: number,
  tankOffset: number
) {
  const topLeft = pixelToTank(
    rect.x,
    rect.y + rect.h,
    sectionW,
    sectionH,
    tankInnerW,
    tankInnerH,
    tankOffset
  );
  const size = {
    w: (rect.w / sectionW) * tankInnerW,
    h: (rect.h / sectionH) * tankInnerH,
  };
  return {
    x: topLeft.x,
    y: topLeft.y,
    w: size.w,
    h: size.h,
    l: 0,
    r: 0,
    b: 0,
    t: 0,
    hw: 0,
    hh: 0,
    cx: 0,
    cy: 0,
  };
}
