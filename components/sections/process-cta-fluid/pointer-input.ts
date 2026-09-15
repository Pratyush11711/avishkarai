export interface StirInput {
  active: boolean;
  from: [number, number];
  to: [number, number];
  velocity: [number, number];
  consumeStep(): void;
  dispose(): void;
}

export function installStirInput(host: HTMLElement): StirInput {
  let hovering = false;
  let from: [number, number] = [0.5, 0.5];
  let to: [number, number] = [0.5, 0.5];
  let velocity: [number, number] = [0, 0];
  let lastTime = 0;
  let decay = 0;

  const point = (event: PointerEvent): [number, number] => {
    const r = host.getBoundingClientRect();
    return [
      Math.max(0, Math.min(1, (event.clientX - r.left) / Math.max(1, r.width))),
      Math.max(
        0,
        Math.min(1, 1 - (event.clientY - r.top) / Math.max(1, r.height))
      ),
    ];
  };

  const enter = (event: PointerEvent) => {
    if (!event.isPrimary) return;
    hovering = true;
    from = to = point(event);
    lastTime = event.timeStamp;
    velocity = [0, 0];
    decay = 2;
  };

  const move = (event: PointerEvent) => {
    if (!event.isPrimary) return;
    hovering = true;
    const next = point(event);
    if (lastTime === 0) {
      from = to = next;
      lastTime = event.timeStamp;
      return;
    }
    const dt = Math.max(
      0.004,
      Math.min(0.05, (event.timeStamp - lastTime) / 1000)
    );
    from = to;
    to = next;
    velocity = [
      Math.max(-2.5, Math.min(2.5, (to[0] - from[0]) / dt)),
      Math.max(-2.5, Math.min(2.5, (to[1] - from[1]) / dt)),
    ];
    lastTime = event.timeStamp;
    decay = 2;
  };

  const leave = () => {
    hovering = false;
    lastTime = 0;
    decay = 2;
  };

  host.addEventListener("pointerenter", enter);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerleave", leave);
  host.addEventListener("pointercancel", leave);

  return {
    get active() {
      return hovering || decay > 0;
    },
    get from() {
      return from;
    },
    get to() {
      return to;
    },
    get velocity() {
      return velocity;
    },
    consumeStep() {
      from = to;
      if (!hovering && decay > 0) {
        velocity = [velocity[0] * 0.45, velocity[1] * 0.45];
        decay--;
      }
    },
    dispose() {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointercancel", leave);
      hovering = false;
    },
  };
}
