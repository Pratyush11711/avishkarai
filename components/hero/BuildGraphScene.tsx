"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

const NODE_COUNT = 55;
const EDGE_PROBABILITY = 0.12;

function generateGraph() {
  const nodes: THREE.Vector3[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 4
      )
    );
  }

  const edges: [number, number][] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      const dist = nodes[i].distanceTo(nodes[j]);
      if (dist < 3 && Math.random() < EDGE_PROBABILITY) {
        edges.push([i, j]);
      }
    }
  }

  return { nodes, edges };
}

function buildPaths(nodes: THREE.Vector3[], edges: [number, number][]) {
  const paths: number[][] = [];
  const adj: Record<number, number[]> = {};
  edges.forEach(([a, b]) => {
    if (!adj[a]) adj[a] = [];
    if (!adj[b]) adj[b] = [];
    adj[a].push(b);
    adj[b].push(a);
  });

  for (let p = 0; p < 8; p++) {
    const start = Math.floor(Math.random() * NODE_COUNT);
    const path = [start];
    let cur = start;
    for (let step = 0; step < 6; step++) {
      const neighbors = (adj[cur] || []).filter((n) => !path.includes(n));
      if (neighbors.length === 0) break;
      cur = neighbors[Math.floor(Math.random() * neighbors.length)];
      path.push(cur);
    }
    if (path.length >= 3) paths.push(path);
  }

  if (paths.length === 0 && edges.length > 0) {
    const seed = [edges[0][0], edges[0][1]];
    if (seed.length >= 2) paths.push(seed);
  }

  return paths;
}

interface GraphState {
  nodes: THREE.Vector3[];
  edges: [number, number][];
  paths: number[][];
}

interface SceneProps {
  graph: GraphState;
  scrollProgress: React.MutableRefObject<number>;
}

function GraphScene({ graph, scrollProgress }: SceneProps) {
  const { nodes, edges, paths } = graph;
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const pulseRef = useRef({
    pathIdx: 0,
    t: 0,
    active: false,
    timer: 0,
    pauseTime: 3 + Math.random() * 3,
  });

  const { size } = useThree();

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / size.width - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / size.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [size]);

  // Instanced spheres for nodes
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const nodeColors = useMemo(() => {
    const colors = new Float32Array(NODE_COUNT * 3);
    for (let i = 0; i < NODE_COUNT; i++) {
      const c = new THREE.Color("#c6c6c6");
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return colors;
  }, []);

  const colorAttr = useRef<THREE.InstancedBufferAttribute | null>(null);

  useEffect(() => {
    if (!instancedRef.current) return;
    nodes.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.06);
      dummy.updateMatrix();
      instancedRef.current!.setMatrixAt(i, dummy.matrix);
    });
    instancedRef.current.instanceMatrix.needsUpdate = true;
  }, [nodes, dummy]);

  useFrame((_, delta) => {
    if (!groupRef.current || !instancedRef.current) return;

    // Camera drift
    const targetX = mouseRef.current.x * 0.25;
    const targetY = mouseRef.current.y * 0.15;
    groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.03;
    groupRef.current.rotation.x += (targetY - groupRef.current.rotation.x) * 0.03;

    // Scroll scale
    const sp = scrollProgress.current;
    const scale = 1 - sp * 0.3;
    groupRef.current.scale.setScalar(scale);
    groupRef.current.position.z = -sp * 2;

    // Pulse animation
    const pulse = pulseRef.current;
    pulse.timer += delta;

    if (!pulse.active && pulse.timer >= pulse.pauseTime) {
      if (paths.length === 0) {
        pulse.timer = 0;
      } else {
        pulse.active = true;
        pulse.t = 0;
        pulse.pathIdx = Math.floor(Math.random() * paths.length);
        pulse.timer = 0;
        pulse.pauseTime = 3 + Math.random() * 3;
      }
    }

    if (pulse.active) {
      const path = paths[pulse.pathIdx];
      if (!path || path.length < 2) {
        pulse.active = false;
        return;
      }
      pulse.t += delta * 0.8;
      const totalEdges = path.length - 1;
      const progress = pulse.t;

      // Reset all node colors
      const baseColor = new THREE.Color("#c6c6c6");
      for (let i = 0; i < NODE_COUNT; i++) {
        nodeColors[i * 3] = baseColor.r;
        nodeColors[i * 3 + 1] = baseColor.g;
        nodeColors[i * 3 + 2] = baseColor.b;
      }

      // Light up nodes along the path based on progress
      const phosphor = new THREE.Color("#d1ffca");
      const dimPhosphor = new THREE.Color("#fff100").multiplyScalar(0.5);
      path.forEach((nodeIdx, i) => {
        const nodeProgress = progress - i * 0.4;
        if (nodeProgress > 0 && nodeProgress <= 1.5) {
          const intensity = Math.max(0, 1 - nodeProgress);
          const c = dimPhosphor.clone().lerp(phosphor, intensity);
          nodeColors[nodeIdx * 3] = c.r;
          nodeColors[nodeIdx * 3 + 1] = c.g;
          nodeColors[nodeIdx * 3 + 2] = c.b;
        }
      });

      if (colorAttr.current) {
        colorAttr.current.needsUpdate = true;
      }

      if (progress > totalEdges * 0.4 + 2) {
        pulse.active = false;
        // Reset
        const bc = new THREE.Color("#c6c6c6");
        for (let i = 0; i < NODE_COUNT; i++) {
          nodeColors[i * 3] = bc.r;
          nodeColors[i * 3 + 1] = bc.g;
          nodeColors[i * 3 + 2] = bc.b;
        }
        if (colorAttr.current) colorAttr.current.needsUpdate = true;
      }
    }

    instancedRef.current.instanceMatrix.needsUpdate = false;
  });

  const edgeColor = "#c6c6c6";

  return (
    <group ref={groupRef}>
      {/* Edges */}
      {edges.map(([a, b], i) => (
        <Line
          key={i}
          points={[nodes[a], nodes[b]]}
          color={edgeColor}
          lineWidth={0.5}
          transparent
          opacity={0.6}
        />
      ))}

      {/* Nodes */}
      <instancedMesh
        ref={instancedRef}
        args={[undefined, undefined, NODE_COUNT]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial vertexColors />
        <instancedBufferAttribute
          ref={colorAttr}
          attach="geometry-attributes-color"
          args={[nodeColors, 3]}
        />
      </instancedMesh>
    </group>
  );
}

interface BuildGraphSceneProps {
  scrollProgress: React.MutableRefObject<number>;
}

export function BuildGraphScene({ scrollProgress }: BuildGraphSceneProps) {
  const graph = useMemo(() => {
    const { nodes, edges } = generateGraph();
    const paths = buildPaths(nodes, edges);
    return { nodes, edges, paths };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <GraphScene graph={graph} scrollProgress={scrollProgress} />
    </Canvas>
  );
}
