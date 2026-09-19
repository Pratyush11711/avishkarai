"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type RippleDistortionProps = {
  imageSrc: string;
  frequency?: number;
  amplitude?: number;
  speed?: number;
  antialias?: boolean;
  className?: string;
};

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float time;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float frequency;
uniform float amplitude;
uniform float speed;
uniform vec2 uScale;

varying vec2 vUv;

void main() {
  vec2 uv = (vUv - 0.5) * uScale + 0.5;
  float dist = distance(uv, uMouse);
  float falloff = exp(-dist * 1.4);
  float ripple = sin(dist * frequency - time * speed) * amplitude * falloff;
  vec2 dir = uv - uMouse;
  float dirLen = max(length(dir), 0.0001);
  vec2 distortedUv = uv + (dir / dirLen) * ripple;
  gl_FragColor = texture2D(uTexture, distortedUv);
}
`;

export default function RippleDistortion({
  imageSrc,
  frequency = 18,
  amplitude = 0.032,
  speed = 2.6,
  antialias = true,
  className = "",
}: RippleDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      antialias,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.replaceChildren(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const uniforms = {
      time: { value: 0 },
      uTexture: { value: null as THREE.Texture | null },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      frequency: { value: frequency },
      amplitude: { value: 0 },
      speed: { value: speed },
      uScale: { value: new THREE.Vector2(1, 1) },
    };
    const mouse = new THREE.Vector2(0.5, 0.5);
    let targetAmp = 0;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      toneMapped: false,
    });
    scene.add(new THREE.Mesh(geometry, material));

    let raf = 0;
    let hovering = false;
    let visible = true;
    let disposed = false;

    const renderOnce = () => {
      if (disposed) return;
      renderer.render(scene, camera);
    };

    const tick = () => {
      if (disposed) return;
      uniforms.uMouse.value.lerp(mouse, 0.06);
      uniforms.amplitude.value += (targetAmp - uniforms.amplitude.value) * 0.045;
      uniforms.time.value += 0.008;

      const stillSettling = Math.abs(uniforms.amplitude.value - targetAmp) > 0.00015;
      if ((hovering && visible) || stillSettling) {
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
        return;
      }

      uniforms.amplitude.value = 0;
      renderOnce();
      raf = 0;
    };

    const start = () => {
      if (raf || disposed) return;
      raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      renderer.setSize(rect.width, rect.height, false);

      const texture = uniforms.uTexture.value;
      const img = texture?.image as { width: number; height: number } | undefined;
      if (!img?.width || !img.height) return;

      const imageAspect = img.width / img.height;
      const screenAspect = rect.width / rect.height;
      if (imageAspect > screenAspect) {
        uniforms.uScale.value.set(screenAspect / imageAspect, 1);
      } else {
        uniforms.uScale.value.set(1, imageAspect / screenAspect);
      }
      renderOnce();
    };

    const loader = new THREE.TextureLoader();
    loader.load(imageSrc, (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.colorSpace = THREE.NoColorSpace;
      uniforms.uTexture.value = texture;
      resize();
    });

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height
      );
    };
    const onEnter = () => {
      hovering = true;
      targetAmp = amplitude;
      start();
    };
    const onLeave = () => {
      hovering = false;
      targetAmp = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && hovering) start();
      },
      { rootMargin: "80px" }
    );
    io.observe(container);

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerenter", onEnter);
    container.addEventListener("pointerleave", onLeave);
    resize();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointerleave", onLeave);
      uniforms.uTexture.value?.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [imageSrc, frequency, amplitude, speed, antialias]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    />
  );
}
