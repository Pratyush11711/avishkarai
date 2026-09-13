import {
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  PlaneGeometry,
} from "three";

/** Lusion plus-sign mesh (12 verts, indexed). */
export function createPlusGeometry(): BufferGeometry {
  const geo = new BufferGeometry();
  geo.setAttribute(
    "position",
    new BufferAttribute(
      new Float32Array([
        0.0714286, -0.5, 0, -0.0714286, -0.5, 0, 0.5, -0.0714286, 0, 0.0714286,
        -0.0714286, 0, -0.0714286, -0.0714286, 0, -0.5, -0.0714286, 0, 0.5,
        0.0714286, 0, 0.0714286, 0.0714286, 0, -0.0714286, 0.0714286, 0, -0.5,
        0.0714286, 0, 0.0714286, 0.5, 0, -0.0714286, 0.5, 0,
      ]),
      3
    )
  );
  geo.setIndex(
    new BufferAttribute(
      new Uint8Array([
        4, 5, 9, 0, 4, 3, 8, 7, 3, 7, 2, 3, 7, 6, 2, 11, 10, 7, 7, 8, 11, 3, 4,
        8, 0, 1, 4, 4, 9, 8,
      ]),
      1
    )
  );
  return geo;
}

export const FLIP_SHAPE_GEOMETRIES = [
  createPlusGeometry(),
  new PlaneGeometry(0.8, 0.8),
  new CircleGeometry(0.4, 10),
  new CircleGeometry(0.5, 3),
] as const;

export const FLIP_SHAPE_COUNT = FLIP_SHAPE_GEOMETRIES.length;
