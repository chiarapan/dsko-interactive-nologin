import { useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';

export function useCorrelationSummary(corrMatrix) {
    const { t, tWithHtml } = useLanguage();
  
  return useMemo(() => {
    if (!corrMatrix) return [];

    const seen = new Set();
    const strongPos = [], strongNeg = [], moderate = [], weak = [];

    const parsePair = (text) => {
      const match = text.match(/^(.+?) vs (.+?) → ([\d.+eE-]+)$/);
      if (!match) return null;
      return { paramA: match[1], paramB: match[2], corr: parseFloat(match[3]) };
    };

    corrMatrix.forEach(row => {
      const a = row.param;
      Object.entries(row).forEach(([b, val]) => {
        if (a === b || b === 'param') return;
        const numVal = typeof val === 'number' && isFinite(val) ? val : NaN;
        if (isNaN(numVal)) return;

        const key = [a, b].sort().join('|');
        if (seen.has(key)) return;
        seen.add(key);

        const entry = `${a} vs ${b} → ${numVal.toFixed(2)}`;

        if (Math.abs(numVal) >= 0.8) {
          numVal > 0 ? strongPos.push(entry) : strongNeg.push(entry);
        } else if (Math.abs(numVal) < 0.2) {
          weak.push(entry);
        } else {
          moderate.push(entry);
        }
      });
    });

    const getStrongest = (arr, type = 'abs') => {
      const sorted = arr.slice().sort((a, b) => {
        const ca = parsePair(a)?.corr ?? 0;
        const cb = parsePair(b)?.corr ?? 0;
        if (type === 'abs') return Math.abs(cb) - Math.abs(ca);
        if (type === 'closestToZero') return Math.abs(ca) - Math.abs(cb);
        return cb - ca;
      });
      return parsePair(sorted[0]);
    };

    const summary = [];
    if (!strongPos.length && !strongNeg.length) {
  summary.push(t('no_strong_correlations'));
}

if (moderate.length) {
  const ex = getStrongest(moderate);
  summary.push(t('moderate_correlation_summary', {
    count: moderate.length,
    paramA: ex.paramA,
    paramB: ex.paramB,
    corr: ex.corr.toFixed(2),
  }));
}

if (weak.length) {
  const ex = getStrongest(weak, 'closestToZero');
  summary.push(t('weak_correlation_summary', {
    count: weak.length,
    paramA: ex.paramA,
    paramB: ex.paramB,
    corr: ex.corr.toFixed(2),
  }));
}
    return summary;
  }, [corrMatrix]);
}
