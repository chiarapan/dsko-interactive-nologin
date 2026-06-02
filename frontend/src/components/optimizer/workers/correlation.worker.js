
/**
 * Builds a correlation matrix using ranked Pearson correlation.
 * @param {Array<Object>} data - Array of data rows (objects with parameter keys)
 * @param {string[]} excludeKeys - Keys to exclude from correlation
 * @returns {Array<Object>} - Correlation matrix
 */

function rank(arr) {
  const sorted = arr.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
  const ranks = Array(arr.length);
  for (let i = 0; i < sorted.length; i++) {
    ranks[sorted[i].idx] = i + 1;
  }
  return ranks;
}

function pearson(x, y) {
  const avgX = x.reduce((a, b) => a + b) / x.length;
  const avgY = y.reduce((a, b) => a + b) / y.length;
  const cov = x.reduce((sum, xi, i) => sum + (xi - avgX) * (y[i] - avgY), 0);
  const stdX = Math.sqrt(x.reduce((sum, xi) => sum + (xi - avgX) ** 2, 0));
  const stdY = Math.sqrt(y.reduce((sum, yi) => sum + (yi - avgY) ** 2, 0));
  return stdX && stdY ? cov / (stdX * stdY) : 0;
}

/* eslint-disable no-restricted-globals */


self.onmessage = function (e) {
  const { data, excludeKeys } = e.data;
  if (!data || data.length === 0) return;

  const isNumeric = (val) => !isNaN(parseFloat(val)) && isFinite(val);
  const keys = Object.keys(data[0]).filter(
    (k) =>
      !(excludeKeys || []).some((ex) => k.toLowerCase().includes(ex)) &&
      isNumeric(data[0][k])
  );

  const values = keys.map((k) => data.map((row) => +row[k]));

  const result = keys.map((keyA, i) => {
    const row = { param: keyA };
    keys.forEach((keyB, j) => {
      const x = rank(values[i]);
      const y = rank(values[j]);
      row[keyB] = pearson(x, y);
    });
    return row;
  });

  postMessage(result);
};
