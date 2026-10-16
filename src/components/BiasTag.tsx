import type { BiasRating } from '@/types';
import { BIAS_LABELS, BIAS_COLORS } from '@/data/sources';

interface BiasTagProps {
  bias: BiasRating;
  size?: 'sm' | 'md';
}

export function BiasTag({ bias, size = 'sm' }: BiasTagProps) {
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';
  return (
    <span
      className={`${BIAS_COLORS[bias]} ${sizeClass} border-2 border-brutal-black font-bold uppercase tracking-wide inline-block`}
    >
      {BIAS_LABELS[bias]}
    </span>
  );
}
