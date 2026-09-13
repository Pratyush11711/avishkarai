"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";

type Piece = {
  p: [number, number, number];
  e: [number, number, number];
  s: number;
  c: string;
  t: number;
};

const PIECES: Piece[] = [
  { p: [0.02, 0.12, 0.08], e: [0.62, 0.85, 0.28], s: 1.38, c: "#1652ff", t: 0 },
  { p: [0.62, 0.48, -0.22], e: [0.95, -0.35, 0.55], s: 1.08, c: "#f2f2f4", t: 0.28 },
  { p: [-0.58, 0.38, 0.12], e: [0.18, 0.72, -0.48], s: 0.98, c: "#101012", t: 0 },
  { p: [0.18, -0.42, 0.32], e: [-0.42, 0.28, 0.78], s: 1.16, c: "#0c3dff", t: 0 },
  { p: [-0.38, -0.12, -0.38], e: [0.55, 0.22, 0.12], s: 0.86, c: "#ececf0", t: 0.18 },
  { p: [0.72, -0.18, 0.18], e: [0.28, 1.05, 0.38], s: 0.78, c: "#0d0d10", t: 0 },
  { p: [-0.12, 0.58, -0.12], e: [1.15, 0.38, -0.18], s: 0.72, c: "#2a62ff", t: 0 },
  { p: [0.38, 0.04, 0.52], e: [0.12, -0.55, 0.32], s: 0.66, c: "#f6f6f8", t: 0.42 },
  { p: [-0.72, -0.28, 0.22], e: [0.7, -0.2, 0.5], s: 0.7, c: "#141418", t: 0 },
];

function Jack({ piece, index }: { piece: Piece; index: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const group = ref.current;
    if (!group) return;
    const t = state.clock.elapsedTime;
    group.rotation.x = piece.e[0] + Math.sin(t * 0.22 + index) * 0.12;
    group.rotation.y = piece.e[1] + t * (0.08 + index * 0.012);
    group.rotation.z = piece.e[2] + Math.cos(t * 0.18 + index * 0.4) * 0.08;
  });

  return (
    <group ref={ref} position={piece.p} scale={piece.s}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.155, 0.7, 8, 16]} />
        <JackMaterial piece={piece} />
      </mesh>
      <mesh castShadow>
        <capsuleGeometry args={[0.155, 0.7, 8, 16]} />
        <JackMaterial piece={piece} />
      </mesh>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.155, 0.7, 8, 16]} />
        <JackMaterial piece={piece} />
      </mesh>
    </group>
  );
}

function JackMaterial({ piece }: { piece: Piece }) {
  return (
    <meshPhysicalMaterial
      color={piece.c}
      roughness={piece.t > 0 ? 0.08 : 0.18}
      metalness={0.04}
      clearcoat={1}
      clearcoatRoughness={0.16}
      transmission={piece.t}
      thickness={piece.t > 0 ? 0.55 : 0}
      ior={1.45}
      envMapIntensity={1.15}
    />
  );
}

function Cluster() {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.x * 0.4, 3.2, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * 0.22, 3.2, dt);
  });

  return (
    <group ref={group} position={[0, 0.05, 0]}>
      {PIECES.map((piece, i) => (
        <Jack key={i} piece={piece} index={i} />
      ))}
    </group>
  );
}

export function HeroCrossField({ playing }: { playing: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [sized, setSized] = useState(false);

  useEffect(() => {
    setMounted(true);
    const node = hostRef.current;
    if (!node) return;

    const apply = (width: number, height: number) => {
      setSized(width > 8 && height > 8);
    };

    apply(node.clientWidth, node.clientHeight);
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (box) apply(box.width, box.height);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="lh-cross-host">
      {mounted && sized ? (
        <Canvas
          className="lh-cross-canvas"
          dpr={[1, 1.6]}
          frameloop={playing ? "always" : "demand"}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          camera={{ position: [0, 0.12, 4.6], fov: 32, near: 0.1, far: 24 }}
        >
          <color attach="background" args={["#050505"]} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 3]} intensity={1.35} />
          <directionalLight position={[-3, 1, -2]} intensity={0.35} color="#6ea0ff" />
          <Cluster />
          <ContactShadows
            position={[0, -1.35, 0]}
            opacity={0.45}
            scale={8}
            blur={2.4}
            far={3}
          />
        </Canvas>
      ) : (
        <div className="lh-visual-fallback" />
      )}
    </div>
  );
}

export default HeroCrossField;
