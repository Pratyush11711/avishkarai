"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Color,
  DoubleSide,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  ShaderMaterial,
  Vector2,
} from "three";
import { flipSim } from "./flip-sim";
import { FLIP_SHAPE_COUNT, FLIP_SHAPE_GEOMETRIES } from "./geometries";
import { FLIP_FRAGMENT, FLIP_VERTEX } from "./shaders";
import { buildTankConfig, pixelRectToTank, pixelToTank } from "./tank-config";
import { useFlipDriver } from "./useFlipDriver";

const PRESSURE_ITERATION = 60;
const NUM_PARTICLES_ITERS = 4;
const OVER_RELAXATION = 1;
const FLIP_RATIO = 0;
const PARTICLE_COLOR = "#ffffff";

type ShapeMesh = {
  geometry: InstancedBufferGeometry;
  posAttr: InstancedBufferAttribute;
  infoAttr: InstancedBufferAttribute;
};

function createShapeMeshes(numParticles: number): ShapeMesh[] {
  const perShape = Math.floor(numParticles / FLIP_SHAPE_COUNT);
  const meshes: ShapeMesh[] = [];

  for (let s = 0; s < FLIP_SHAPE_COUNT; s++) {
    const base = FLIP_SHAPE_GEOMETRIES[s];
    const geo = new InstancedBufferGeometry();
    for (const key in base.attributes) {
      geo.setAttribute(key, base.attributes[key].clone());
    }
    if (base.index) geo.setIndex(base.index.clone());

    const posSlice = flipSim.particlePosOut.subarray(
      s * perShape * 2,
      (s + 1) * perShape * 2
    );
    const infoSlice = flipSim.particleInfo.subarray(
      s * perShape * 2,
      (s + 1) * perShape * 2
    );

    const posAttr = new InstancedBufferAttribute(posSlice, 2);
    posAttr.setUsage(DynamicDrawUsage);
    const infoAttr = new InstancedBufferAttribute(infoSlice, 2);
    infoAttr.setUsage(DynamicDrawUsage);
    geo.setAttribute("instancedPos", posAttr);
    geo.setAttribute("instancedInfo", infoAttr);
    geo.instanceCount = perShape;

    meshes.push({ geometry: geo, posAttr, infoAttr });
  }
  return meshes;
}

interface FlipSceneProps {
  layout: { width: number; height: number };
  pointerRef: React.RefObject<{
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    isDown: boolean;
    isMobile: boolean;
  }>;
  active: boolean;
  scrollHintRef: React.RefObject<HTMLElement | null>;
  sectionRef: React.RefObject<HTMLElement | null>;
  shapeMeshes: ShapeMesh[];
}

function FlipScene({
  layout,
  pointerRef,
  active,
  shapeMeshes,
}: FlipSceneProps) {
  const uniformsRef = useRef({
    u_tankOffset: { value: new Vector2() },
    u_tankActualSize: { value: new Vector2() },
    u_sectionSize: { value: new Vector2(1, 1) },
    u_radius: { value: 0.05 },
    u_opacity: { value: 1 },
    u_color: { value: new Color(PARTICLE_COLOR) },
  });

  const materials = useMemo(
    () =>
      shapeMeshes.map(
        () =>
          new ShaderMaterial({
            uniforms: uniformsRef.current,
            vertexShader: FLIP_VERTEX,
            fragmentShader: FLIP_FRAGMENT,
            depthWrite: false,
            depthTest: false,
            side: DoubleSide,
          })
      ),
    [shapeMeshes]
  );

  useFrame((_, delta) => {
    if (!active || layout.width < 1) return;

    const { width, height } = layout;
    const config = buildTankConfig(width, height);
    const u = uniformsRef.current;

    u.u_tankOffset.value.set(flipSim.h, flipSim.h);
    u.u_tankActualSize.value.set(
      flipSim.tankInnerWidth,
      flipSim.tankInnerHeight
    );
    u.u_sectionSize.value.set(width, height);
    u.u_radius.value = config.particleRadius;
    u.u_opacity.value = 1;

    const ptr = pointerRef.current;
    const dt = Math.max(1 / 120, delta);
    const prevTank = pixelToTank(
      ptr.prevX,
      ptr.prevY,
      width,
      height,
      flipSim.tankInnerWidth,
      flipSim.tankInnerHeight,
      flipSim.h
    );
    const currTank = pixelToTank(
      ptr.x,
      ptr.y,
      width,
      height,
      flipSim.tankInnerWidth,
      flipSim.tankInnerHeight,
      flipSim.h
    );

    const velX = (currTank.x - prevTank.x) / dt;
    const velY = (currTank.y - prevTank.y) / dt;

    // Off-screen by default — no cursor interaction until pointer is pressed.
    let mx = -1e3;
    let my = -1e3;
    let strength = 0;
    let simVelX = 0;
    let simVelY = 0;

    if (ptr.isDown && !ptr.isMobile) {
      flipSim.isFlushing = true;
      flipSim.emitterPosA.set(prevTank.x, prevTank.y);
      flipSim.emitterPosB.set(currTank.x, currTank.y);
    } else if (ptr.isDown && ptr.isMobile) {
      mx = currTank.x;
      my = currTank.y;
      strength = (150 / width) * 0.35;
      simVelX = velX;
      simVelY = velY;
      flipSim.isFlushing = false;
      flipSim.emitterPosB.set(1, config.tankHeight * 0.5);
      flipSim.emitterPosA.copy(flipSim.emitterPosB);
    } else {
      flipSim.isFlushing = false;
      flipSim.emitterPosB.set(1, config.tankHeight * 0.5);
      flipSim.emitterPosA.copy(flipSim.emitterPosB);
    }

    flipSim.simulate(
      dt,
      config.gravity,
      FLIP_RATIO,
      PRESSURE_ITERATION,
      NUM_PARTICLES_ITERS,
      OVER_RELAXATION,
      true,
      true,
      mx,
      my,
      strength,
      simVelX,
      simVelY
    );

    for (const m of shapeMeshes) {
      m.posAttr.needsUpdate = true;
      m.infoAttr.needsUpdate = true;
    }
  });

  return (
    <>
      {shapeMeshes.map((entry, i) => (
        <instancedMesh
          key={i}
          frustumCulled={false}
          args={[entry.geometry, materials[i], entry.geometry.instanceCount]}
        />
      ))}
    </>
  );
}

interface FlipParticleFieldProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  scrollHintRef: React.RefObject<HTMLElement | null>;
  onUnsupported?: () => void;
}

export function FlipParticleField({
  sectionRef,
  scrollHintRef,
  onUnsupported,
}: FlipParticleFieldProps) {
  const { pointerRef, layout, active, measure } = useFlipDriver(
    sectionRef,
    scrollHintRef
  );
  const [shapeMeshes, setShapeMeshes] = useState<ShapeMesh[]>([]);

  useEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (layout.width < 1 || layout.height < 1) return;

    const config = buildTankConfig(layout.width, layout.height);
    flipSim.init(
      1,
      config.tankWidth,
      config.tankHeight,
      config.cellSize,
      config.particleRadius,
      config.numParticles
    );

    const hint = scrollHintRef.current;
    const section = sectionRef.current;
    if (hint && section) {
      const sr = section.getBoundingClientRect();
      const hr = hint.getBoundingClientRect();
      const collider = pixelRectToTank(
        {
          x: hr.left - sr.left,
          y: hr.top - sr.top,
          w: hr.width,
          h: hr.height,
        },
        layout.width,
        layout.height,
        flipSim.tankInnerWidth,
        flipSim.tankInnerHeight,
        flipSim.h
      );
      flipSim.addColliderRect(collider, -1, -1, -1, -1);
    }

    setShapeMeshes(createShapeMeshes(config.numParticles));
  }, [layout.width, layout.height, scrollHintRef, sectionRef]);

  if (layout.width < 1 || shapeMeshes.length === 0) return null;

  return (
    <div className="lwt-flip-canvas" aria-hidden="true">
      <Canvas
        key={`${layout.width}x${layout.height}`}
        className="lwt-canvas"
        frameloop={active ? "always" : "demand"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        orthographic
        camera={{
          left: 0,
          right: layout.width,
          top: 0,
          bottom: layout.height,
          near: 0.1,
          far: 100,
          position: [layout.width / 2, layout.height / 2, 10],
        }}
        onCreated={({ gl }) => {
          if (!gl.capabilities.isWebGL2) onUnsupported?.();
        }}
      >
        <FlipScene
          layout={layout}
          pointerRef={pointerRef}
          active={active}
          scrollHintRef={scrollHintRef}
          sectionRef={sectionRef}
          shapeMeshes={shapeMeshes}
        />
      </Canvas>
    </div>
  );
}
