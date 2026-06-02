import { useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';

export function useCorrelationTips(
  corrMatrix,
  selectedParams = [],
  filterMode = 'all',
  threshold = 0.0,
  maxThreshold = 1.0,
  t
) {

  return useMemo(() => {
    if (!corrMatrix || selectedParams.length === 0) return [];

    const seen = new Set();
    const strongPos = [], strongNeg = [], moderate = [], weak = [];

    corrMatrix.forEach(row => {
      const a = row.param;
      Object.entries(row).forEach(([b, val]) => {
        if (!selectedParams.includes(a) && !selectedParams.includes(b)) return;
        if (a === b || b === 'param') return;

        const numVal = typeof val === 'number' && isFinite(val) ? val : NaN;
        if (isNaN(numVal)) return;

        const abs = Math.abs(numVal);
        const passesFilter =
          (filterMode === 'strong' && abs >= 0.8) ||
          (filterMode === 'moderate' && abs >= 0.2 && abs < 0.8) ||
          (filterMode === 'weak' && abs < 0.2) ||
          (filterMode === 'all' && abs >= threshold && abs <= maxThreshold);

        if (!passesFilter) return;

        const key = [a, b].sort().join('|');
        if (seen.has(key)) return;
        seen.add(key);

        if (abs >= 0.8) {
          numVal > 0 ? strongPos.push([a, b, numVal]) : strongNeg.push([a, b, numVal]);
        } else if (abs < 0.2) {
          weak.push([a, b, numVal]);
        } else {
          moderate.push([a, b, numVal]);
        }
      });
    });

    const tips = [];

    if (strongNeg.length) {
      const sortedNeg = strongNeg.slice().sort(([, , a], [, , b]) => a - b);

      if (strongNeg.length <= 2) {
        sortedNeg.forEach(([a, b, v]) => {
          tips.push({
            text: t('strong_negative_correlation_tip', {
              paramA: a,
              paramB: b,
              value: v.toFixed(2),
            }),
            severity: "warning",
          });
        });
      } else {
        const [a, b, v] = sortedNeg[0];
        tips.push({
          text: t('strong_negative_correlation_summary', {
            paramA: a,
            paramB: b,
            value: v.toFixed(2),
            count: strongNeg.length - 1,
          }),
          severity: "warning",
        });
      }
    }

    const totalConsidered = strongPos.length + strongNeg.length + moderate.length + weak.length;
    if (totalConsidered > 0 && strongNeg.length === 0 && strongPos.length === 0) {
      tips.push({
        text: t('no_strong_correlations_tip'),
        severity: "info",
      });
    }

    if (moderate.length) {
      tips.push({
        text: t('moderate_correlation_count_tip', {
          count: moderate.length,
        }),
        severity: "info",
      });
    }

    if (weak.length) {
      tips.push({
        text: t('weak_correlation_tip', {
          count: weak.length,
        }),
        severity: "info",
      });
    }
    return tips;
  }, [corrMatrix, selectedParams, filterMode, threshold, maxThreshold, t]);
}
