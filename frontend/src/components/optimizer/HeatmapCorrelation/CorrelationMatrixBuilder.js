import { rank, pearson } from './utils/statistics';

/**
 * Builds a correlation matrix using ranked Pearson correlation.
 * @param {Array<Object>} data - Array of data rows (objects with parameter keys)
 * @param {string[]} excludeKeys - Keys to exclude from correlation
 * @returns {Array<Object>} - Correlation matrix
 */
export function buildCorrelationMatrix(data, excludeKeys = ['costs','cost', 'calc_dir']) {
  if (!data || data.length === 0) return [];

  const isNumeric = (val) => !isNaN(parseFloat(val)) && isFinite(val);

  const keys = Object.keys(data[0]).filter(
    k =>
      !excludeKeys.some(ex => k.toLowerCase().includes(ex)) &&
      isNumeric(data[0][k])
  );

  const values = keys.map(k => data.map(row => +row[k]));

  return keys.map((keyA, i) => {
    const row = { param: keyA };
    keys.forEach((keyB, j) => {
      const x = rank(values[i]);
      const y = rank(values[j]);
      row[keyB] = pearson(x, y);
    });
    return row;
  });
}
