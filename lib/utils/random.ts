// ============================================================
// 随机数引擎 — 基于 seedrandom，可复现
// ============================================================

import seedrandom from 'seedrandom';

let rng: seedrandom.PRNG;

export function initRandom(seed?: string) {
  rng = seedrandom(seed || Date.now().toString(36));
}

export function resetRandom(seed: string) {
  rng = seedrandom(seed);
}

/** 返回 [0, 1) */
export function random(): number {
  if (!rng) initRandom();
  return rng();
}

/** 返回 [min, max) */
export function randomRange(min: number, max: number): number {
  return min + random() * (max - min);
}

/** 返回 min 到 max 的整数（含两端） */
export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

/** 正态分布抽样（Box-Muller） */
export function randomNormal(mean: number = 0, stddev: number = 1): number {
  let u = 0, v = 0;
  while (u === 0) u = random();
  while (v === 0) v = random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stddev;
}

/** 返回有噪声的值：base × (1 + noise) */
export function withNoise(base: number, noisePercent: number = 0.15): number {
  return base * (1 + randomNormal(0, noisePercent / 3));
}

/** 从加权选项中随机选一个 */
export function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** Sigmoid 函数 */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/** 二项分布：n 次试验，每次概率 p，返回成功次数 */
export function binomial(n: number, p: number): number {
  if (n <= 0 || p <= 0) return 0;
  if (p >= 1) return n;
  // 对于大 n 使用正态近似
  if (n * p > 10 && n * (1 - p) > 10) {
    const result = Math.round(randomNormal(n * p, Math.sqrt(n * p * (1 - p))));
    return Math.max(0, Math.min(n, result));
  }
  // 小 n 直接模拟
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (random() < p) count++;
  }
  return count;
}

/** 钳制值 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
