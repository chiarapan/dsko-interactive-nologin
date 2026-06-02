export const getConvergenceTipsText = (t) => ({
  highStd: {
    text: t('optimization_warning'),
    severity: "warning", 
  },
  lowStd: {
    text: t('convergence_warning'),
    severity: "info", 
  },
  meanHigherThanBest: {
    text: t('cost_gap_warning'),
    severity: "warning",
  },
  meanDiffersFromMedian: {
    text: t('skewed_distribution_warning'),
    severity: "info",
  },
  stagnated: (stagnationBlock, t) => ({
  text: t('stagnation_warning', {
    start: stagnationBlock.startIteration,
    end: stagnationBlock.startIteration + stagnationBlock.count - 1,
  }),
  severity: "warning",
}),
});




export const getCorrelationTipsText = (t) => ({
  veryStrongNegative: {
    text: t('very_strong_negative_correlation'),
    severity: "warning",
  },
  veryStrongPositive: {
    text: t('very_strong_positive_correlation'),
    severity: "info",
  },
  // weakCorrelation: {
  //   text: t('weak_correlation'),
  //   severity: "info",
  // },
});

