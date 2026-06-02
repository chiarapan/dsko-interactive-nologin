export function compressKDist(k_dist = [], breakIndices = [], compressionFactor = 0.001) {
  // Ensure breakIndices is always an array
  breakIndices = Array.isArray(breakIndices) ? breakIndices : [];

  if (!k_dist.length) return [];

  const adjusted = [k_dist[0]];

  for (let i = 1; i < k_dist.length; i++) {
    const delta = k_dist[i] - k_dist[i - 1];
    if (breakIndices.includes(i)) {
      adjusted.push(adjusted[i - 1] + delta * compressionFactor);
    } else {
      adjusted.push(adjusted[i - 1] + delta);
    }
  }

  return adjusted;
}
