/**
 * Returns the rank of elements in an array (1-based)
 * Handles ties by assigning ranks in order of appearance.
 * @param {number[]} arr
 * @returns {number[]}
 */
export function rank(arr) {
  const sorted = arr
    .map((val, idx) => ({ val, idx }))
    .sort((a, b) => a.val - b.val);

  const ranks = Array(arr.length);
  for (let i = 0; i < sorted.length; i++) {
    ranks[sorted[i].idx] = i + 1;
  }
  return ranks;
}

/**
 * Calculates the Pearson correlation coefficient between two arrays.
 * @param {number[]} x
 * @param {number[]} y
 * @returns {number}
 */
export function pearson(x, y) {
  const avgX = x.reduce((a, b) => a + b) / x.length;
  const avgY = y.reduce((a, b) => a + b) / y.length;

  const cov = x.reduce((sum, xi, i) => sum + (xi - avgX) * (y[i] - avgY), 0);
  const stdX = Math.sqrt(x.reduce((sum, xi) => sum + (xi - avgX) ** 2, 0));
  const stdY = Math.sqrt(y.reduce((sum, yi) => sum + (yi - avgY) ** 2, 0));

  return stdX && stdY ? cov / (stdX * stdY) : 0;
}
