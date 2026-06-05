// ============================================================
// 音效系统 — Web Audio API 合成音效（无需外部文件）
// ============================================================

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  // 恢复被浏览器暂停的上下文
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** 转化达成 — 上升叮咚 */
export function playConversion() {
  playTone(880, 0.15, 'sine', 0.12);
  setTimeout(() => playTone(1100, 0.15, 'sine', 0.1), 80);
}

/** 任务完成 — 三连音 */
export function playMissionComplete() {
  playTone(523, 0.12, 'sine', 0.15);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.15), 120);
  setTimeout(() => playTone(784, 0.25, 'sine', 0.18), 240);
}

/** 成就解锁 — 华丽上升 */
export function playAchievement() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(n, 0.2, 'sine', 0.15), i * 100);
  });
}

/** 日预算耗尽 — 低沉警告 */
export function playBudgetWarning() {
  playTone(330, 0.3, 'triangle', 0.12);
  setTimeout(() => playTone(294, 0.3, 'triangle', 0.12), 350);
}

/** 客户接单 — 清脆确认 */
export function playClientAccept() {
  playTone(660, 0.1, 'square', 0.08);
  setTimeout(() => playTone(880, 0.2, 'square', 0.1), 100);
}

/** 客户失败 — 下降音 */
export function playClientFail() {
  playTone(440, 0.15, 'sawtooth', 0.08);
  setTimeout(() => playTone(330, 0.3, 'sawtooth', 0.08), 150);
}

/** 模拟速度切换 */
export function playSpeedChange() {
  playTone(600, 0.05, 'sine', 0.05);
}

/** 弹窗打开 */
export function playPopup() {
  playTone(1000, 0.08, 'sine', 0.06);
}

/** 按钮点击 */
export function playClick() {
  playTone(800, 0.04, 'sine', 0.04);
}
