"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  APPEAR_DURATION,
  FIELD_TOP,
  buildField,
  clamp01,
} from "./field";
import { PARTICLE_FRAGMENT, PARTICLE_VERTEX } from "./shaders";
import { DEFAULT_TUNING, useParticleSimulation } from "./useParticleSimulation";
import type { FieldDriver } from "./useFieldDriver";

/**
 * The flow field is dialled up as the panel is scrolled, so the sand is nearly
 * still when it appears and is fully churning by the time the panel releases.
 */
const FLOW_STRENGTH_MIN = 0.012;
const FLOW_STRENGTH_MAX = 0.05;
const MOUSE_STRENGTH_MAX = 0.75;
/** How much a fast-moving shape brightens. */
const SPEED_GAIN = 6;

interface FieldData {
  count: number;
  textureSize: number;
  seed: Float32Array;
  refs: Float32Array;
  shapes: Float32Array;
  sizes: Float32Array;
  rotations: Float32Array;
  rotationSpeeds: Float32Array;
  delays: Float32Array;
}

function createFieldData(count: number): FieldData {
  const particles = buildField(count);
  const actual = particles.length;
  const textureSize = Math.ceil(Math.sqrt(actual));
  const texels = textureSize * textureSize;

  const seed = new Float32Array(texels * 4);
  const refs = new Float32Array(actual * 2);
  const shapes = new Float32Array(actual);
  const sizes = new Float32Array(actual);
  const rotations = new Float32Array(actual);
  const rotationSpeeds = new Float32Array(actual);
  const delays = new Float32Array(actual);

  for (let i = 0; i < texels; i++) {
    // Spare texels reuse a real particle so the sim never sees garbage.
    const p = particles[i % actual];
    seed[i * 4] = p.x;
    seed[i * 4 + 1] = p.y;
    seed[i * 4 + 2] = 0;
    seed[i * 4 + 3] = 0;
  }

  for (let i = 0; i < actual; i++) {
    const p = particles[i];
    const col = i % textureSize;
    const row = Math.floor(i / textureSize);
    refs[i * 2] = (col + 0.5) / textureSize;
    refs[i * 2 + 1] = (row + 0.5) / textureSize;
    shapes[i] = p.shape;
    sizes[i] = p.size;
    rotations[i] = p.rot;
    rotationSpeeds[i] = p.rotSpeed;
    delays[i] = p.delay;
  }

  return {
    count: actual,
    textureSize,
    seed,
    refs,
    shapes,
    sizes,
    rotations,
    rotationSpeeds,
    delays,
  };
}

function FieldMesh({
  data,
  driver,
}: {
  data: FieldData;
  driver: React.RefObject<FieldDriver>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const size = useThree((state) => state.size);
  const simulation = useParticleSimulation(data.textureSize, data.seed);

  const geometry = useMemo(() => {
    const quad = new THREE.PlaneGeometry(1, 1);
    const instanced = new THREE.InstancedBufferGeometry();
    instanced.index = quad.index;
    instanced.attributes.position = quad.attributes.position;
    instanced.attributes.uv = quad.attributes.uv;
    instanced.instanceCount = data.count;

    const attribute = (array: Float32Array, itemSize: number) =>
      new THREE.InstancedBufferAttribute(array, itemSize);

    instanced.setAttribute("aRef", attribute(data.refs, 2));
    instanced.setAttribute("aShape", attribute(data.shapes, 1));
    instanced.setAttribute("aSize", attribute(data.sizes, 1));
    instanced.setAttribute("aRot", attribute(data.rotations, 1));
    instanced.setAttribute("aRotSpeed", attribute(data.rotationSpeeds, 1));
    instanced.setAttribute("aDelay", attribute(data.delays, 1));
    // Positions come from the state texture, so bounds can't be derived.
    instanced.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);

    return instanced;
  }, [data]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uState: { value: null as THREE.Texture | null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uFieldTop: { value: FIELD_TOP },
      uReveal: { value: 0 },
      uTime: { value: 0 },
      uSizeScale: { value: 1 },
      uSpeedGain: { value: SPEED_GAIN },
    }),
    []
  );

  const pointer = useRef({ x: -1, y: -1, seeded: false });
  const elapsed = useRef(0);

  const dbgGl = useThree((s) => s.gl);
  const dbgScene = useThree((s) => s.scene);
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__lwt = {
      material: materialRef,
      geometry,
      driver,
      gl: dbgGl,
      scene: dbgScene,
      frames: 0,
    };
  }, [geometry, driver, dbgGl, dbgScene]);

  useFrame((_, rawDelta) => {
    const dbg = (window as unknown as Record<string, { frames: number }>).__lwt;
    if (dbg) dbg.frames++;
    const material = materialRef.current;
    if (!material) return;

    // A backgrounded tab or a long frame must not fling the simulation.
    const delta = Math.min(rawDelta, 1 / 30);
    elapsed.current += delta;

    const state = driver.current;
    const panelHeight = state.panelHeight || size.height / (1 - FIELD_TOP);
    const aspect = size.width / panelHeight;

    // Cursor position in the same panel space the simulation works in.
    let mouseX = -1;
    let mouseY = -1;
    if (state.pointerActive) {
      const targetX = state.pointerX / size.width;
      const targetY = (state.pointerY - state.panelTop) / panelHeight;
      if (pointer.current.seeded) {
        const follow = Math.min(1, delta * 14);
        pointer.current.x += (targetX - pointer.current.x) * follow;
        pointer.current.y += (targetY - pointer.current.y) * follow;
      } else {
        pointer.current.x = targetX;
        pointer.current.y = targetY;
        pointer.current.seeded = true;
      }
      mouseX = pointer.current.x;
      mouseY = pointer.current.y;
    } else {
      pointer.current.seeded = false;
    }

    // The field wakes up as the panel is scrolled through.
    const wake = clamp01(state.progress / 0.6);
    const flowStrength =
      FLOW_STRENGTH_MIN + (FLOW_STRENGTH_MAX - FLOW_STRENGTH_MIN) * wake;

    const texture = simulation.step({
      delta,
      time: elapsed.current,
      aspect,
      mouseX,
      mouseY,
      mouseStrength: state.pointerActive ? MOUSE_STRENGTH_MAX * (0.5 + 0.5 * wake) : 0,
      flowStrength,
    });

    const revealRaw = clamp01(0.2 + state.progress / 0.4);
    material.uniforms.uState.value = texture;
    material.uniforms.uReveal.value = 1 - Math.pow(1 - revealRaw, 3);
    material.uniforms.uTime.value = elapsed.current;
    material.uniforms.uSizeScale.value = size.width < 640 ? 0.72 : 1;
    (material.uniforms.uResolution.value as THREE.Vector2).set(
      size.width,
      size.height
    );
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={PARTICLE_VERTEX}
        fragmentShader={PARTICLE_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

interface FluidParticleFieldProps {
  driver: React.RefObject<FieldDriver>;
  active: boolean;
  /** Called if the GPU can't provide float render targets after all. */
  onUnsupported: () => void;
}

export function FluidParticleField({
  driver,
  active,
  onUnsupported,
}: FluidParticleFieldProps) {
  const data = useMemo(() => {
    const wide = typeof window !== "undefined" && window.innerWidth >= 1100;
    // Lower than the CPU field: the extra simulation pass costs more per shape.
    return createFieldData(wide ? 2400 : 1600);
  }, []);

  return (
    <Canvas
      className="lwt-canvas"
      frameloop={active ? "always" : "never"}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      orthographic
      camera={{ position: [0, 0, 1] }}
      onCreated={({ gl }) => {
        const ctx = gl.getContext();
        const renderable =
          ctx.getExtension("EXT_color_buffer_float") ||
          ctx.getExtension("EXT_color_buffer_half_float");
        if (!renderable) onUnsupported();
      }}
    >
      <FieldMesh data={data} driver={driver} />
    </Canvas>
  );
}

export { DEFAULT_TUNING };
