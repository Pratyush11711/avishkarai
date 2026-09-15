import { surface, type Gpu, type Surface } from "vgpu";
import { installStirInput } from "./pointer-input";
import {
  createFluid,
  destroyFluid,
  prepareFluid,
  renderFluid,
  resizeFluid,
  stepFluid,
  type Fluid,
} from "./simulation";

const FIXED_STEP = 1 / 60;

interface RendererOptions {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  playing?: boolean;
}

function fixedStepCount(accumulator: number, elapsed: number) {
  let next = accumulator + Math.min(elapsed, 1 / 30);
  let steps = 0;
  while (next >= FIXED_STEP && steps < 2) {
    next -= FIXED_STEP;
    steps++;
  }
  return { steps, accumulator: steps === 2 ? 0 : next };
}

export function createRenderer(options: RendererOptions) {
  let disposed = false;
  let playing = options.playing !== false;
  let gpu: Gpu | undefined;
  let canvasSurface: Surface | undefined;
  let fluid: Fluid | undefined;
  let input: ReturnType<typeof installStirInput> | undefined;
  let animationFrame = 0;
  let accumulator = 0;
  let previous = 0;

  const tick = (now: number) => {
    if (disposed) return;
    if (!playing) {
      animationFrame = 0;
      previous = now;
      return;
    }
    if (!document.hidden && fluid && input && canvasSurface) {
      const fixed = fixedStepCount(accumulator, (now - previous) / 1000);
      accumulator = fixed.accumulator;
      for (let i = 0; i < fixed.steps; i++) {
        stepFluid(fluid, input);
      }
      renderFluid(fluid, canvasSurface);
    }
    previous = now;
    animationFrame = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (disposed || !playing || animationFrame) return;
    previous = performance.now();
    animationFrame = requestAnimationFrame(tick);
  };

  function setPlaying(next: boolean) {
    if (playing === next) return;
    playing = next;
    if (playing) startLoop();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    input?.dispose();
    input = undefined;
    if (fluid) {
      try {
        destroyFluid(fluid);
      } catch {
        /* gpu.dispose still releases buffers */
      }
      fluid = undefined;
    }
    canvasSurface?.dispose();
    canvasSurface = undefined;
    gpu?.dispose();
    gpu = undefined;
  }

  const initialize = async () => {
    const { init } = await import("vgpu");
    if (disposed) return;
    const nextGpu = await init();
    if (disposed) {
      nextGpu.dispose();
      return;
    }
    gpu = nextGpu;
    canvasSurface = surface(gpu, options.canvas, { dpr: [1, 2] });
    fluid = createFluid(gpu);
    input = installStirInput(options.host);
    await prepareFluid(fluid, canvasSurface);
    if (disposed) return;
    canvasSurface.onResize(() => {
      if (disposed || !fluid || !canvasSurface) return;
      resizeFluid(fluid, canvasSurface);
    });
    startLoop();
  };

  const ready = initialize();

  return { ready, dispose, setPlaying };
}
