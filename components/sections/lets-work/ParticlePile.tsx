"use client";

import { useMemo } from "react";
import {
  Particles,
  ParticlesProvider,
  useParticlesProvider,
} from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

async function initEngine(engine: Engine) {
  await loadSlim(engine);
}

/**
 * Lusion-style micro particle heap.
 *
 * Design goals:
 *   – Hundreds of tiny (1–3 px) shapes fall under gravity and settle at the
 *     bottom of the panel, with natural air gaps left by collision physics.
 *   – The top edge of the pile is an organic wave, not a flat horizon.
 *   – On hover the particles near the cursor are flung outward at gas-like
 *     speed. Gravity immediately pulls them back down to re-settle.
 *
 * Shape mix (weighted toward plain dots so micro sizes still read):
 *   circle  ×3   → dots
 *   square  ×2   → diamonds when rotated 45°
 *   star    ×1   → sparkle accent (4-point)
 *   polygon ×1   → triangle accent
 *
 * All physics (collision distance, bounce elasticity, repulse radius) are
 * governed by the tsParticles engine — nothing is hand-positioned.
 */

function ParticlesLayer() {
  const { loaded } = useParticlesProvider();

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,

      particles: {
        // ── Count ─────────────────────────────────────────────────────────
        number: {
          value: 600,
          density: { enable: true, area: 800 },
        },

        // ── Appearance ────────────────────────────────────────────────────
        color: { value: "#ffffff" },

        opacity: {
          value: { min: 0.65, max: 1 },
        },

        shape: {
          // circle dominates so micro-dots read at 1-3 px;
          // square + star + polygon give visual variety at larger sizes
          type: ["circle", "circle", "circle", "square", "square", "star", "polygon"],
          options: {
            polygon: [{ sides: 3 }],
            star: [{ sides: 4, inset: 2 }],
          },
        },

        // KEY: micro size so hundreds of particles form a dense heap
        size: {
          value: { min: 1, max: 3.5 },
        },

        rotate: {
          value: { min: 0, max: 360 },
          random: { enable: true, minimumValue: 0 },
          direction: "random" as const,
          animation: { enable: false },
        },

        // ── Physics ───────────────────────────────────────────────────────
        move: {
          enable: true,
          // Very slow drift so they settle quickly rather than bouncing wildly
          speed: { min: 0.1, max: 1.2 },
          random: true,
          straight: false,

          gravity: {
            enable: true,
            // Standard earth gravity — particles fall at a natural rate and
            // pile up; the collision engine controls the final stacking height.
            acceleration: 9.8,
            // High cap so the post-repulse trajectory can arc realistically
            // before gravity decelerates them.
            maxSpeed: 80,
          },

          outModes: {
            // Bounce off floor — foundation of the pile effect
            bottom: "bounce" as const,
            // Escape from other edges and rain back in from the top
            top: "out" as const,
            left: "out" as const,
            right: "out" as const,
          },
        },

        // Particles collide and push each other apart, creating the uneven
        // wave silhouette and the air-gap texture inside the pile.
        collisions: {
          enable: true,
          mode: "bounce" as const,
        },
      },

      // ── Interactivity ─────────────────────────────────────────────────
      interactivity: {
        detectsOn: "window" as const,
        events: {
          onHover: { enable: true, mode: "repulse" },
        },
        modes: {
          repulse: {
            // Radius in px — wide enough to disturb a chunk of the pile
            distance: 100,
            // How long (seconds) the engine applies repulsion after the cursor
            // stops. Short = sharp kick; particles fly then gravity wins.
            duration: 0.15,
            // Factor × speed = impulse magnitude. 25 creates gaseous chaos.
            factor: 25,
            speed: 4,
            // No hard cap — let particles scatter freely so it reads as an
            // explosion rather than a polite nudge.
            maxSpeed: 300,
          },
        },
      },

      detectRetina: true,
    }),
    []
  );

  if (!loaded) return null;

  return (
    <Particles
      id="lwt-particle-pile"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options={options as any}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "auto",
      }}
    />
  );
}

export function ParticlePile() {
  return (
    <ParticlesProvider init={initEngine}>
      <ParticlesLayer />
    </ParticlesProvider>
  );
}
