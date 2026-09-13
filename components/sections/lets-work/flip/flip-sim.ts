import { Vector2 } from "three";
import { clamp, mix, normalizeAngle } from "./math-utils";

export const FLUID_CELL = 0;
export const AIR_CELL = 1;
export const SOLID_CELL = 2;
export const EMIT_RATE = 2000;

export interface ColliderRect {
  x: number;
  y: number;
  w: number;
  h: number;
  l: number;
  r: number;
  b: number;
  t: number;
  hw: number;
  hh: number;
  cx: number;
  cy: number;
}

const _v0 = new Vector2();
const _v1 = new Vector2();
const _v2 = new Vector2();

/**
 * CPU FLIP fluid simulation — ported from Lusion hoisted.CUO_IjfL.js (FlipSim).
 */
export class FlipSim {
  isFlushing = false;
  hasInitialized = false;
  emitterPosA = new Vector2(1, 1);
  emitterPosB = new Vector2(1, 1);
  colliderRectList: ColliderRect[] = [];

  density = 0;
  fNumX = 0;
  fNumY = 0;
  h = 0;
  fInvSpacing = 0;
  fNumCells = 0;
  tankInnerWidth = 0;
  tankInnerHeight = 0;

  u!: Float32Array;
  v!: Float32Array;
  du!: Float32Array;
  dv!: Float32Array;
  prevU!: Float32Array;
  prevV!: Float32Array;
  p!: Int8Array;
  s!: Int8Array;
  cellType!: Int8Array;
  particleDensity!: Float32Array;

  particleRadius = 0;
  pInvSpacing = 0;
  pNumX = 0;
  pNumY = 0;
  pNumCells = 0;
  particleRestDensity = 0;
  numCellParticles!: Uint32Array;
  firstCellParticle!: Uint32Array;

  numParticles = 0;
  particlePosOut!: Float32Array;
  particlePos!: Float32Array;
  particleInfo!: Float32Array;
  particleDir!: Float32Array;
  particlePrevPos!: Float32Array;
  particleVel!: Float32Array;
  cellParticleIds!: Uint32Array;
  particleStatuses!: Uint8Array;

  addColliderRect = (
    rect: ColliderRect,
    padL = 0,
    padR = 0,
    padT = 0,
    padB = 0
  ) => {
    const inv = this.fInvSpacing;
    const numY = this.fNumY;
    let x0 = clamp(Math.round(rect.x * inv) - padL, 0, this.fNumX - 1);
    let y0 = clamp(Math.round(rect.y * inv) - padB, 0, this.fNumY - 1);
    let x1 = clamp(Math.round((rect.x + rect.w) * inv) + padR, 0, this.fNumX - 1);
    let y1 = clamp(Math.round((rect.y + rect.h) * inv) + padT, 0, this.fNumY - 1);
    x1 = Math.max(x0, x1);
    y1 = Math.max(y0, y1);
    this.colliderRectList.push(rect);
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        this.s[x * numY + y] = 0;
      }
    }
    rect.x = x0 / inv;
    rect.y = y0 / inv;
    rect.w = Math.max(1, x1 - x0) / inv;
    rect.h = Math.max(1, y1 - y0) / inv;
    rect.l = rect.x;
    rect.r = rect.x + rect.w;
    rect.b = rect.y;
    rect.t = rect.y + rect.h;
    rect.hw = rect.w / 2;
    rect.hh = rect.h / 2;
    rect.cx = rect.x + rect.hw;
    rect.cy = rect.y + rect.hh;
  };

  init(
    density: number,
    width: number,
    height: number,
    cellSize: number,
    particleRadius: number,
    numParticles: number
  ) {
    const wasInit = this.hasInitialized;
    this.colliderRectList.length = 0;
    this.density = density;
    this.fNumX = Math.ceil(width / cellSize) + 1;
    this.fNumY = Math.ceil(height / cellSize) + 1;
    this.h = Math.max(width / this.fNumX, height / this.fNumY);
    this.fInvSpacing = 1 / this.h;
    const numCells = this.fNumX * this.fNumY;
    this.tankInnerWidth = (this.fNumX - 2) * this.h;
    this.tankInnerHeight = (this.fNumY - 2) * this.h;

    if (!wasInit || numCells > this.cellType.length) {
      this.u = new Float32Array(numCells);
      this.v = new Float32Array(numCells);
      this.du = new Float32Array(numCells);
      this.dv = new Float32Array(numCells);
      this.prevU = new Float32Array(numCells);
      this.prevV = new Float32Array(numCells);
      this.p = new Int8Array(numCells);
      this.s = new Int8Array(numCells);
      this.cellType = new Int8Array(numCells);
      this.particleDensity = new Float32Array(numCells);
    }
    this.fNumCells = numCells;
    for (let i = 0; i < numCells; i++) {
      this.u[i] = 0;
      this.v[i] = 0;
      this.du[i] = 0;
      this.dv[i] = 0;
      this.prevU[i] = 0;
      this.prevV[i] = 0;
      this.p[i] = 0;
      this.s[i] = 0;
      this.cellType[i] = 0;
      this.particleDensity[i] = 0;
    }

    this.particleRadius = particleRadius;
    this.pInvSpacing = 1 / (2.2 * particleRadius);
    this.pNumX = Math.floor(width * this.pInvSpacing) + 1;
    this.pNumY = Math.floor(height * this.pInvSpacing) + 1;
    this.particleRestDensity = 0;

    const pCells = this.pNumX * this.pNumY;
    if (!wasInit || pCells > this.numCellParticles.length) {
      this.numCellParticles = new Uint32Array(pCells);
      this.firstCellParticle = new Uint32Array(pCells + 1);
    } else {
      this.numCellParticles.fill(0);
      this.firstCellParticle.fill(0);
      this.firstCellParticle[pCells] = 0;
    }
    this.pNumCells = pCells;

    this.particlePosOut = new Float32Array(2 * numParticles);
    this.particlePos = new Float32Array(2 * numParticles);
    this.particleInfo = new Float32Array(2 * numParticles);

    if (!wasInit || numParticles > this.particleDir.length / 2) {
      this.particleDir = new Float32Array(2 * numParticles);
      this.particlePrevPos = new Float32Array(2 * numParticles);
      this.particleVel = new Float32Array(2 * numParticles);
      this.cellParticleIds = new Uint32Array(numParticles);
      this.particleStatuses = new Uint8Array(numParticles);
    }

    for (let i = 0; i < numParticles; i++) {
      this.particlePos[i * 2] = -1e4;
      this.particlePos[i * 2 + 1] = 0;
      this.particlePosOut[i * 2] = -1e4;
      this.particlePosOut[i * 2 + 1] = 0;
      this.particleInfo[i * 2] = 0;
      this.particleInfo[i * 2 + 1] = 0;
      this.particleDir[i * 2] = 0;
      this.particleDir[i * 2 + 1] = 0;
      this.particlePrevPos[i * 2] = -1e4;
      this.particlePrevPos[i * 2 + 1] = 0;
      this.particleVel[i * 2] = 0;
      this.particleVel[i * 2 + 1] = 0;
      this.cellParticleIds[i] = 0;
      this.particleStatuses[i] = 0;
    }
    this.numParticles = numParticles;

    const fNumY = this.fNumY;
    for (let x = 0; x < this.fNumX; x++) {
      for (let y = 0; y < this.fNumY; y++) {
        let solid = 0;
        if (x > 0 && x < this.fNumX - 1 && y > 0 && y < this.fNumY - 1) {
          solid = 1;
        }
        this.s[x * fNumY + y] = solid;
      }
    }
    this.hasInitialized = true;
  }

  integrateParticles(dt: number, gravity: number) {
    for (let i = 0; i < this.numParticles; i++) {
      if (!this.particleStatuses[i]) continue;
      this.particleVel[i * 2 + 1] += dt * gravity;
      this.particlePos[i * 2] += this.particleVel[i * 2] * dt;
      this.particlePos[i * 2 + 1] += this.particleVel[i * 2 + 1] * dt;
    }
  }

  pushParticlesApart(iterations: number) {
    this.numCellParticles.fill(0);
    for (let i = 0; i < this.numParticles; i++) {
      if (!this.particleStatuses[i]) continue;
      const px = this.particlePos[i * 2];
      const py = this.particlePos[i * 2 + 1];
      const cx = clamp(Math.floor(px * this.pInvSpacing), 0, this.pNumX - 1);
      const cy = clamp(Math.floor(py * this.pInvSpacing), 0, this.pNumY - 1);
      this.numCellParticles[cx * this.pNumY + cy]++;
    }
    let sum = 0;
    for (let i = 0; i < this.pNumCells; i++) {
      sum += this.numCellParticles[i];
      this.firstCellParticle[i] = sum;
    }
    this.firstCellParticle[this.pNumCells] = sum;

    for (let i = 0; i < this.numParticles; i++) {
      if (!this.particleStatuses[i]) continue;
      const px = this.particlePos[i * 2];
      const py = this.particlePos[i * 2 + 1];
      const cx = clamp(Math.floor(px * this.pInvSpacing), 0, this.pNumX - 1);
      const cy = clamp(Math.floor(py * this.pInvSpacing), 0, this.pNumY - 1);
      const idx = cx * this.pNumY + cy;
      this.firstCellParticle[idx]--;
      this.cellParticleIds[this.firstCellParticle[idx]] = i;
    }

    const minDist = 3 * this.particleRadius;
    const minDistSq = minDist * minDist;

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < this.numParticles; i++) {
        if (!this.particleStatuses[i]) continue;
        const px = this.particlePos[i * 2];
        const py = this.particlePos[i * 2 + 1];
        const cx = Math.floor(px * this.pInvSpacing);
        const cy = Math.floor(py * this.pInvSpacing);
        const x0 = Math.max(cx - 1, 0);
        const y0 = Math.max(cy - 1, 0);
        const x1 = Math.min(cx + 1, this.pNumX - 1);
        const y1 = Math.min(cy + 1, this.pNumY - 1);

        for (let x = x0; x <= x1; x++) {
          for (let y = y0; y <= y1; y++) {
            const cell = x * this.pNumY + y;
            const start = this.firstCellParticle[cell];
            const end = this.firstCellParticle[cell + 1];
            for (let j = start; j < end; j++) {
              const other = this.cellParticleIds[j];
              if (other === i || !this.particleStatuses[other]) continue;
              const ox = this.particlePos[other * 2];
              const oy = this.particlePos[other * 2 + 1];
              let dx = ox - px;
              let dy = oy - py;
              const distSq = dx * dx + dy * dy;
              if (distSq > minDistSq || distSq === 0) continue;
              const dist = Math.sqrt(distSq);
              const push = (0.5 * (minDist - dist)) / dist;
              dx *= push;
              dy *= push;
              this.particlePos[i * 2] -= dx;
              this.particlePos[i * 2 + 1] -= dy;
              this.particlePos[other * 2] += dx;
              this.particlePos[other * 2 + 1] += dy;
            }
          }
        }
      }
    }
  }

  handleParticleCollisions(
    dt: number,
    emitterX: number,
    emitterY: number,
    emitterRadius: number,
    emitterVelX: number,
    emitterVelY: number
  ) {
    const wall = 1 / this.fInvSpacing;
    const pr = this.particleRadius;
    const emitR = emitterRadius + pr;
    const emitRSq = emitR * emitR;
    const minX = wall + pr;
    const maxX = (this.fNumX - 1) * wall - pr;
    const minY = wall + pr;
    const maxY = (this.fNumY - 1) * wall - pr;
    const flushing = this.isFlushing;

    for (let i = 0; i < this.numParticles; i++) {
      if (!this.particleStatuses[i]) continue;
      let px = this.particlePos[i * 2];
      let py = this.particlePos[i * 2 + 1];
      const dx = px - emitterX;
      const dy = py - emitterY;
      const distSq = dx * dx + dy * dy;
      if (distSq < emitRSq) {
        const dist = Math.sqrt(distSq);
        const push = (emitR - dist) / dist;
        px += dx * push;
        py += dy * push;
        this.particleVel[i * 2] = emitterVelX * 2;
        this.particleVel[i * 2 + 1] = emitterVelY * 2;
      }

      const moveX = px - this.particlePrevPos[i * 2];
      const moveY = py - this.particlePrevPos[i * 2 + 1];
      const moveLen = Math.sqrt(moveX * moveX + moveY * moveY);
      if (moveLen > 0) {
        const nx = moveX / moveLen;
        const ny = moveY / moveLen;
        const invNx = 1 / (Math.abs(nx) > 1e-4 ? nx : 1e-4);
        const invNy = 1 / (Math.abs(ny) > 1e-4 ? ny : 1e-4);
        for (const rect of this.colliderRectList) {
          if (px > rect.l && px < rect.r && py > rect.b && py < rect.t) {
            const lx = px - rect.cx;
            const ly = py - rect.cy;
            const ux = lx * invNx;
            const uy = ly * invNy;
            const hw = Math.abs(invNx) * rect.hw;
            const hh = Math.abs(invNy) * rect.hh;
            const pen = Math.max(-ux - hw, -uy - hh);
            px += nx * pen;
            py += ny * pen;
          }
        }
      }

      if (px < minX) {
        px = minX;
        this.particleVel[i * 2] = 0;
      }
      if (px > maxX) {
        px = maxX;
        this.particleVel[i * 2] = 0;
      }
      if (py < minY) {
        if (flushing) {
          px = -1e4;
          py = 0;
          this.particleStatuses[i] = 0;
        } else {
          py = minY;
          this.particleVel[i * 2 + 1] = 0;
        }
      }
      if (py > maxY) {
        py = maxY;
        this.particleVel[i * 2 + 1] = 0;
      }
      this.particlePos[i * 2] = px;
      this.particlePos[i * 2 + 1] = py;
    }

    for (let i = 0; i < this.numParticles; i++) {
      _v0.fromArray(this.particleVel, i * 2);
      const speed = _v0.length();
      if (speed > 1e-5) {
        _v2.fromArray(this.particleDir, i * 2);
        _v1.fromArray(this.particleInfo, i * 2);
        _v1.y = mix(_v1.y, 0, 1 - Math.exp(-4 * dt));
        _v0.multiplyScalar(1 / speed);
        const angle = Math.atan2(_v0.y, _v0.x);
        const prevAngle = Math.atan2(_v2.y, _v2.x);
        _v1.y += speed * normalizeAngle(angle - prevAngle);
        _v1.x += _v1.y * dt;
        _v1.toArray(this.particleInfo, i * 2);
        _v2.toArray(this.particleDir, i * 2);
      }
      this.particlePrevPos[i * 2] = this.particlePos[i * 2];
      this.particlePrevPos[i * 2 + 1] = this.particlePos[i * 2 + 1];
    }
  }

  updateParticleDensity() {
    const numY = this.fNumY;
    const h = this.h;
    const inv = this.fInvSpacing;
    const half = 0.5 * h;
    const density = this.particleDensity;
    density.fill(0);

    for (let i = 0; i < this.numParticles; i++) {
      if (!this.particleStatuses[i]) continue;
      let px = this.particlePos[i * 2];
      let py = this.particlePos[i * 2 + 1];
      px = clamp(px, h, (this.fNumX - 1) * h);
      py = clamp(py, h, (this.fNumY - 1) * h);
      let x0 = Math.floor((px - half) * inv);
      const tx = (px - half - x0 * h) * inv;
      const x1 = Math.min(x0 + 1, this.fNumX - 2);
      let y0 = Math.floor((py - half) * inv);
      const ty = (py - half - y0 * h) * inv;
      const y1 = Math.min(y0 + 1, this.fNumY - 2);
      const sx = 1 - tx;
      const sy = 1 - ty;
      if (x0 < this.fNumX && y0 < this.fNumY) density[x0 * numY + y0] += sx * sy;
      if (x1 < this.fNumX && y0 < this.fNumY) density[x1 * numY + y0] += tx * sy;
      if (x1 < this.fNumX && y1 < this.fNumY) density[x1 * numY + y1] += tx * ty;
      if (x0 < this.fNumX && y1 < this.fNumY) density[x0 * numY + y1] += sx * ty;
    }

    if (this.particleRestDensity === 0) {
      let sum = 0;
      let count = 0;
      for (let i = 0; i < this.fNumCells; i++) {
        if (this.cellType[i] === FLUID_CELL) {
          sum += density[i];
          count++;
        }
      }
      if (count > 0) this.particleRestDensity = sum / count;
    }
  }

  transferVelocities(toGrid: boolean, flipRatio: number) {
    const numY = this.fNumY;
    const h = this.h;
    const inv = this.fInvSpacing;
    const half = 0.5 * h;

    if (toGrid) {
      this.prevU.set(this.u);
      this.prevV.set(this.v);
      this.du.fill(0);
      this.dv.fill(0);
      this.u.fill(0);
      this.v.fill(0);
      for (let i = 0; i < this.fNumCells; i++) {
        this.cellType[i] = this.s[i] === 0 ? SOLID_CELL : AIR_CELL;
      }
      for (let i = 0; i < this.numParticles; i++) {
        if (!this.particleStatuses[i]) continue;
        const px = this.particlePos[i * 2];
        const py = this.particlePos[i * 2 + 1];
        const cx = clamp(Math.floor(px * inv), 0, this.fNumX - 1);
        const cy = clamp(Math.floor(py * inv), 0, this.fNumY - 1);
        const idx = cx * numY + cy;
        if (this.cellType[idx] === AIR_CELL) this.cellType[idx] = FLUID_CELL;
      }
    }

    for (let axis = 0; axis < 2; axis++) {
      const offset = axis === 0 ? 0 : half;
      const altOffset = axis === 0 ? half : 0;
      const grid = axis === 0 ? this.u : this.v;
      const prev = axis === 0 ? this.prevU : this.prevV;
      const weights = axis === 0 ? this.du : this.dv;

      for (let i = 0; i < this.numParticles; i++) {
        if (!this.particleStatuses[i]) continue;
        let px = this.particlePos[i * 2];
        let py = this.particlePos[i * 2 + 1];
        px = clamp(px, h, (this.fNumX - 1) * h);
        py = clamp(py, h, (this.fNumY - 1) * h);

        const x0 = Math.min(Math.floor((px - offset) * inv), this.fNumX - 2);
        const tx = (px - offset - x0 * h) * inv;
        const x1 = Math.min(x0 + 1, this.fNumX - 2);
        const y0 = Math.min(Math.floor((py - altOffset) * inv), this.fNumY - 2);
        const ty = (py - altOffset - y0 * h) * inv;
        const y1 = Math.min(y0 + 1, this.fNumY - 2);
        const sx = 1 - tx;
        const sy = 1 - ty;
        const w00 = sx * sy;
        const w10 = tx * sy;
        const w11 = tx * ty;
        const w01 = sx * ty;
        const i00 = x0 * numY + y0;
        const i10 = x1 * numY + y0;
        const i11 = x1 * numY + y1;
        const i01 = x0 * numY + y1;

        if (toGrid) {
          const vel = this.particleVel[i * 2 + axis];
          grid[i00] += vel * w00;
          weights[i00] += w00;
          grid[i10] += vel * w10;
          weights[i10] += w10;
          grid[i11] += vel * w11;
          weights[i11] += w11;
          grid[i01] += vel * w01;
          weights[i01] += w01;
        } else {
          const stride = axis === 0 ? numY : 1;
          const w00ok =
            this.cellType[i00] !== AIR_CELL ||
            this.cellType[i00 - stride] !== AIR_CELL
              ? 1
              : 0;
          const w10ok =
            this.cellType[i10] !== AIR_CELL ||
            this.cellType[i10 - stride] !== AIR_CELL
              ? 1
              : 0;
          const w11ok =
            this.cellType[i11] !== AIR_CELL ||
            this.cellType[i11 - stride] !== AIR_CELL
              ? 1
              : 0;
          const w01ok =
            this.cellType[i01] !== AIR_CELL ||
            this.cellType[i01 - stride] !== AIR_CELL
              ? 1
              : 0;
          const wSum = w00ok * w00 + w10ok * w10 + w11ok * w11 + w01ok * w01;
          if (wSum > 0) {
            const avg =
              (w00ok * w00 * grid[i00] +
                w10ok * w10 * grid[i10] +
                w11ok * w11 * grid[i11] +
                w01ok * w01 * grid[i01]) /
              wSum;
            const flip =
              (w00ok * w00 * (grid[i00] - prev[i00]) +
                w10ok * w10 * (grid[i10] - prev[i10]) +
                w11ok * w11 * (grid[i11] - prev[i11]) +
                w01ok * w01 * (grid[i01] - prev[i01])) /
              wSum;
            const target = this.particleVel[i * 2 + axis];
            this.particleVel[i * 2 + axis] =
              (1 - flipRatio) * avg + flipRatio * (target + flip);
          }
        }
      }

      if (toGrid) {
        for (let c = 0; c < grid.length; c++) {
          if (weights[c] > 0) grid[c] /= weights[c];
        }
        for (let x = 0; x < this.fNumX; x++) {
          for (let y = 0; y < this.fNumY; y++) {
            const solid = this.cellType[x * numY + y] === SOLID_CELL;
            if (axis === 0) {
              if (solid || (x > 0 && this.cellType[(x - 1) * numY + y] === SOLID_CELL)) {
                this.u[x * numY + y] = this.prevU[x * numY + y];
              }
            } else if (
              solid ||
              (y > 0 && this.cellType[x * numY + y - 1] === SOLID_CELL)
            ) {
              this.v[x * numY + y] = this.prevV[x * numY + y];
            }
          }
        }
      }
    }
  }

  solveIncompressibility(
    iterations: number,
    dt: number,
    overRelaxation: number,
    compensateDrift = true
  ) {
    this.p.fill(0);
    this.prevU.set(this.u);
    this.prevV.set(this.v);
    const numY = this.fNumY;
    const scale = (this.density * this.h) / dt;

    for (let iter = 0; iter < iterations; iter++) {
      for (let x = 1; x < this.fNumX - 1; x++) {
        for (let y = 1; y < this.fNumY - 1; y++) {
          if (this.cellType[x * numY + y] !== FLUID_CELL) continue;
          const idx = x * numY + y;
          const left = (x - 1) * numY + y;
          const right = (x + 1) * numY + y;
          const down = x * numY + y - 1;
          const up = x * numY + y + 1;
          const sum = this.s[idx] + this.s[left] + this.s[right] + this.s[down] + this.s[up];
          if (sum === 0) continue;
          let div = this.u[right] - this.u[idx] + this.v[up] - this.v[idx];
          if (this.particleRestDensity > 0 && compensateDrift) {
            const drift = this.particleDensity[idx] - this.particleRestDensity;
            if (drift > 0) div -= 0.5 * drift;
          }
          const pressure = (-div / sum) * overRelaxation;
          this.p[idx] += scale * pressure;
          this.u[idx] -= this.s[left] * pressure;
          this.u[right] += this.s[right] * pressure;
          this.v[idx] -= this.s[down] * pressure;
          this.v[up] += this.s[up] * pressure;
        }
      }
    }
  }

  simulate(
    dt: number,
    gravity: number,
    flipRatio: number,
    pressureIterations: number,
    particleIterations: number,
    overRelaxation: number,
    compensateDrift: boolean,
    separateParticles: boolean,
    mouseX: number,
    mouseY: number,
    mouseStrength: number,
    mouseVelX: number,
    mouseVelY: number
  ) {
    dt = Math.min(dt, 1 / 60);
    const substeps = 1;
    const subDt = dt / substeps;
    const emitBudget = Math.ceil(EMIT_RATE * dt);
    let emitted = 0;

    for (let step = 0; step < substeps; step++) {
      for (let i = 0; i < this.numParticles && emitted / substeps < emitBudget; i++) {
        if (this.particleStatuses[i] !== 0) continue;
        const t = Math.random();
        const px =
          mix(this.emitterPosA.x, this.emitterPosB.x, t) +
          (Math.random() - 0.5) * 0.01;
        const py =
          mix(this.emitterPosA.y, this.emitterPosB.y, t) +
          (Math.random() - 0.5) * 0.01;
        this.particlePos[i * 2] = px;
        this.particlePrevPos[i * 2] = px;
        this.particlePosOut[i * 2] = px;
        this.particlePos[i * 2 + 1] = py;
        this.particlePrevPos[i * 2 + 1] = py;
        this.particlePosOut[i * 2 + 1] = py;
        this.particleInfo[i * 2] = Math.random() * Math.PI * 2;
        this.particleInfo[i * 2 + 1] = 0;
        this.particleDir[i * 2] = 0;
        this.particleDir[i * 2 + 1] = -1;
        const velY = (2 + Math.pow(Math.random(), 2) * 3) * gravity * 0.1;
        this.particleVel[i * 2] = 0;
        this.particleVel[i * 2 + 1] = velY;
        this.particleStatuses[i] = 1;
        emitted++;
      }

      this.integrateParticles(subDt, gravity);
      if (separateParticles) this.pushParticlesApart(particleIterations);
      this.handleParticleCollisions(
        subDt,
        mouseX,
        mouseY,
        mouseStrength,
        mouseVelX,
        mouseVelY
      );
      this.transferVelocities(true, flipRatio);
      this.updateParticleDensity();
      this.solveIncompressibility(
        pressureIterations,
        subDt,
        overRelaxation,
        compensateDrift
      );
      this.transferVelocities(false, flipRatio);

      for (let i = 0; i < this.numParticles; i++) {
        this.particlePosOut[i * 2] =
          this.particlePos[i * 2] +
          (this.particlePosOut[i * 2] - this.particlePrevPos[i * 2]) * 0.5;
        this.particlePosOut[i * 2 + 1] =
          this.particlePos[i * 2 + 1] +
          (this.particlePosOut[i * 2 + 1] - this.particlePrevPos[i * 2 + 1]) *
            0.5;
      }
    }
  }
}

export const flipSim = new FlipSim();
