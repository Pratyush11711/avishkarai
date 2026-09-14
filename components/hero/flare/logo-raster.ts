import { logoPixelSize } from "./pipeline";

const LOGO_SRC = "/avishkar-logo.png";

/** Ink bounds of the 2000×2000 lockup, plus 24px pad. */
const LOGO_CROP = { x: 63, y: 766, width: 1859, height: 407 };

function loadImage(src: string, signal?: AbortSignal): Promise<HTMLImageElement> {
  if (signal?.aborted) {
    throw new DOMException("Logo rasterization aborted.", "AbortError");
  }

  const image = new Image();
  let abort: (() => void) | undefined;

  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () =>
      reject(new Error("Could not decode the Avishkar AI logo."));
    abort = () => {
      image.onload = null;
      image.onerror = null;
      image.src = "";
      reject(new DOMException("Logo rasterization aborted.", "AbortError"));
    };
    signal?.addEventListener("abort", abort, { once: true });
  });

  if (signal?.aborted) abort?.();
  else image.src = src;

  return loaded
    .catch((error) => {
      throw error;
    })
    .then(() => image)
    .finally(() => {
      image.onload = null;
      image.onerror = null;
      if (abort) signal?.removeEventListener("abort", abort);
    });
}

export async function rasterizeLogo(
  size: number,
  signal?: AbortSignal,
  canvasWidth: number = size
): Promise<HTMLCanvasElement> {
  if (signal?.aborted) {
    throw new DOMException("Logo rasterization aborted.", "AbortError");
  }

  const [width, height] = logoPixelSize(size, canvasWidth);
  const pad = 3;
  const canvas = document.createElement("canvas");
  canvas.width = width + pad * 2;
  canvas.height = height + pad * 2;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create the logo raster canvas.");

  const image = await loadImage(LOGO_SRC, signal);
  if (signal?.aborted) {
    throw new DOMException("Logo rasterization aborted.", "AbortError");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    LOGO_CROP.x,
    LOGO_CROP.y,
    LOGO_CROP.width,
    LOGO_CROP.height,
    pad,
    pad,
    width,
    height
  );
  return canvas;
}
