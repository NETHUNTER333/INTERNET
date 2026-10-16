import type { BiasRating } from '@/types';
import { BIAS_LABELS, BIAS_COLORS, BIAS_ORDER } from '@/data/sources';

interface CoverageBarProps {
  coverage: Record<BiasRating, number>;
  totalSources: number;
  showLabels?: boolean;
}

export function CoverageBar({ coverage, totalSources, showLabels = false }: CoverageBarProps) {
  const segments = BIAS_ORDER.filter((b) => coverage[b] > 0);

  if (segments.length === 0 || totalSources === 0) {
    return (
      <div className="border-2 border-brutal-black bg-brutal-gray px-2 py-1 text-xs font-mono">
        No coverage data
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex border-2 border-brutal-black h-6 overflow-hidden">
        {segments.map((bias) => {
          const width = (coverage[bias] / totalSources) * 100;
          return (
            <div
              key={bias}
              className={`${BIAS_COLORS[bias]} flex items-center justify-center text-[10px] font-bold text-brutal-black transition-all`}
              style={{ width: `${width}%` }}
              title={`${BIAS_LABELS[bias]}: ${coverage[bias]} source${coverage[bias] > 1 ? 's' : ''}`}
            >
              {width > 12 ? coverage[bias] : ''}
            </div>
          );
        })}
      </div>
      {showLabels && (
        <div className="flex flex-wrap gap-1">
          {segments.map((bias) => (
            <span
              key={bias}
              className={`${BIAS_COLORS[bias]} brutal-tag text-[10px]`}
            >
              {BIAS_LABELS[bias]} ({coverage[bias]})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
