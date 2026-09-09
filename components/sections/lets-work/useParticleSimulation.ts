"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FULLSCREEN_VERTEX, SIMULATION_FRAGMENT } from "./shaders";

/**
 * Classic GPGPU ping-pong: particle state lives in a floating-point texture,
 * and each frame a full-screen quad reads the previous texture and writes the
 * next one. Keeps the whole simulation on the GPU so particle count is bound by
 * fill rate rather than by JavaScript.
 *
 * Texel layout: RG = position (panel space, 0..1), BA = velocity.
 */

export interface SimulationUniforms {
  delta: number;
  time: number;
  aspect: number;
  mouseX: number;
  mouseY: number;
  mouseStrength: number;
  flowStrength: number;
}

export interface SimulationTuning {
  /** Spatial frequency of the flow field. Higher = tighter eddies. */
  noiseScale: number;
  /** How fast the flow field itself evolves. */
  flowSpeed: number;
  /** How quickly velocity chases the target force. Higher = snappier. */
  damping: number;
  /** Cursor influence radius, in panel heights. */
  mouseRadius: number;
  /** Restoring pull toward each particle's seed position. */
  homePull: number;
  /** Restoring force applied when a particle crosses the wave line. */
  pullDown: number;
}

export const DEFAULT_TUNING: SimulationTuning = {
  noiseScale: 2.2,
  flowSpeed: 0.05,
  damping: 0.09,
  mouseRadius: 0.17,
  homePull: 0.55,
  pullDown: 1.4,
};

/** Float render targets first; half-float is the fallback, then nothing. */
export function pickStateTextureType(
  renderer: THREE.WebGLRenderer
): THREE.TextureDataType | null {
  const ctx = renderer.getContext();
  if (ctx.getExtension("EXT_color_buffer_float")) return THREE.FloatType;
  if (ctx.getExtension("EXT_color_buffer_half_float")) return THREE.HalfFloatType;
  return null;
}

export function useParticleSimulation(
  textureSize: number,
  seedData: Float32Array,
  tuning: SimulationTuning = DEFAULT_TUNING
) {
  const gl = useThree((state) => state.gl);

  const sim = useMemo(() => {
    const type = pickStateTextureType(gl);
    if (!type) return null;

    const createTarget = () =>
      new THREE.WebGLRenderTarget(textureSize, textureSize, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type,
        depthBuffer: false,
        stencilBuffer: false,
        generateMipmaps: false,
      });

    const seedTexture = new THREE.DataTexture(
      seedData,
      textureSize,
      textureSize,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    seedTexture.minFilter = THREE.NearestFilter;
    seedTexture.magFilter = THREE.NearestFilter;
    seedTexture.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: SIMULATION_FRAGMENT,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uPrevState: { value: seedTexture },
        uSeed: { value: seedTexture },
        uTime: { value: 0 },
        uDelta: { value: 1 / 60 },
        uAspect: { value: 1.6 },
        uNoiseScale: { value: tuning.noiseScale },
        uFlowSpeed: { value: tuning.flowSpeed },
        uFlowStrength: { value: 0 },
        uDamping: { value: tuning.damping },
        uMouse: { value: new THREE.Vector2(-1, -1) },
        uMouseRadius: { value: tuning.mouseRadius },
        uMouseStrength: { value: 0 },
        uHomePull: { value: tuning.homePull },
        uPullDown: { value: tuning.pullDown },
      },
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    scene.add(quad);

    return {
      targets: [createTarget(), createTarget()] as const,
      seedTexture,
      material,
      scene,
      camera,
      quad,
      index: 0,
      initialised: false,
    };
  }, [gl, textureSize, seedData, tuning]);

  useEffect(() => {
    if (!sim) return;
    return () => {
      sim.targets[0].dispose();
      sim.targets[1].dispose();
      sim.seedTexture.dispose();
      sim.material.dispose();
      sim.quad.geometry.dispose();
    };
  }, [sim]);

  return useMemo(() => {
    if (!sim) {
      return { supported: false as const, step: () => null };
    }

    /** Seeds both targets so the first read never returns uninitialised memory. */
    const prime = () => {
      const previous = gl.getRenderTarget();
      sim.material.uniforms.uPrevState.value = sim.seedTexture;
      sim.material.uniforms.uDelta.value = 0;
      for (const target of sim.targets) {
        gl.setRenderTarget(target);
        gl.render(sim.scene, sim.camera);
      }
      gl.setRenderTarget(previous);
      sim.material.uniforms.uDelta.value = 1 / 60;
      sim.initialised = true;
    };

    const step = (uniforms: SimulationUniforms) => {
      if (!sim.initialised) prime();

      const read = sim.targets[sim.index];
      const write = sim.targets[sim.index ^ 1];
      const u = sim.material.uniforms;

      u.uPrevState.value = read.texture;
      u.uTime.value = uniforms.time;
      u.uDelta.value = uniforms.delta;
      u.uAspect.value = uniforms.aspect;
      u.uFlowStrength.value = uniforms.flowStrength;
      u.uMouseStrength.value = uniforms.mouseStrength;
      (u.uMouse.value as THREE.Vector2).set(uniforms.mouseX, uniforms.mouseY);

      const previous = gl.getRenderTarget();
      gl.setRenderTarget(write);
      gl.render(sim.scene, sim.camera);
      gl.setRenderTarget(previous);

      sim.index ^= 1;
      return write.texture;
    };

    (window as unknown as Record<string, unknown>).__lwtSim = { sim, gl };

    return { supported: true as const, step };
  }, [gl, sim]);
}
