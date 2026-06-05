'use client';

interface ProgressBarProps {
  value: number;       // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'slate';
  showLabel?: boolean;
  labelLeft?: string;
  labelRight?: string;
  className?: string;
  animate?: boolean;
}

const variants = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  slate: 'bg-slate-400',
};

const sizes = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
};

export function ProgressBar({
  value, max = 100, size = 'md', variant = 'blue',
  showLabel = false, labelLeft, labelRight, className = '', animate = false,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  // 自动选择颜色（基于百分比）
  const autoVariant =
    variant === 'blue' && pct >= 90 ? 'red' :
    variant === 'blue' && pct >= 70 ? 'yellow' :
    variant;

  const variantClass = variants[autoVariant] || variants.blue;

  return (
    <div className={className}>
      {showLabel && (labelLeft || labelRight) && (
        <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
          <span>{labelLeft}</span>
          <span>{labelRight || `${pct.toFixed(0)}%`}</span>
        </div>
      )}
      <div className={`w-full ${sizes[size]} bg-slate-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${variantClass} rounded-full ${animate ? 'transition-all duration-500' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** 双进度条 — 常用于日预算+总预算 */
export function DualProgressBar({
  topValue, topMax, topLabel, topColor = 'blue',
  bottomValue, bottomMax, bottomLabel, bottomColor = 'slate',
}: {
  topValue: number; topMax: number; topLabel: string; topColor?: ProgressBarProps['variant'];
  bottomValue: number; bottomMax: number; bottomLabel: string; bottomColor?: ProgressBarProps['variant'];
}) {
  return (
    <div className="space-y-1">
      <ProgressBar value={topValue} max={topMax} size="sm" variant={topColor} showLabel labelLeft={topLabel} />
      <ProgressBar value={bottomValue} max={bottomMax} size="sm" variant={bottomColor} showLabel labelLeft={bottomLabel} />
    </div>
  );
}
