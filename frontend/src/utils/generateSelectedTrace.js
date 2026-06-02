const colorPalette = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
  "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
  "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080"
];

/**
 * Generates the trace for selected points.
 * @param {Object} params
 * @param {Object[]} params.selectedPointsRaw - Raw selected point entries (array or array of arrays).
 * @param {string} params.selection - Either 'snap' or other selection mode.
 * @param {Set<number>} params.specialIndicesSet - Set of special k-point indices.
 * @param {Object} params.bandData - Band structure data with k_dist.
 * @returns {Object} Plotly trace object.
 */
export function generateSelectedTrace({ selectedPointsRaw = [], selection, specialIndicesSet, bandData,   kDistAdjusted = []
 }) {
  const colorMap = new Map();
  let colorIndex = 0;

  const selectedPoints = selectedPointsRaw.flatMap((entry) => {
  const upColorPalette = ['blue', 'cyan', 'lightblue']; //  colors for spin up
  const downColorPalette = ['orange', 'red', 'pink']; //  colors for spin down

  if (Array.isArray(entry)) {
    if (selection === "snap" && bandData?.is_spin_polarized) {
      // Filter points separately by spin and if k_point_index is special
      const toDisplayUp = entry.filter(
        p => p.spin === "up" && specialIndicesSet.has(p.k_point_index)
      );
      const toDisplayDown = entry.filter(
        p => p.spin === "down" && specialIndicesSet.has(p.k_point_index)
      );

      toDisplayUp.forEach(p => colorMap.set(p, upColorPalette[colorIndex % upColorPalette.length]));
      if (toDisplayUp.length > 0) colorIndex++;

      toDisplayDown.forEach(p => colorMap.set(p, downColorPalette[colorIndex % downColorPalette.length]));
      if (toDisplayDown.length > 0) colorIndex++;

      return [...toDisplayUp, ...toDisplayDown];
    } else {
      // Non-polarized or free selection
      const toDisplay =
        selection === "snap" ? entry.filter(p => specialIndicesSet.has(p.k_point_index)) : entry;

      toDisplay.forEach(p => colorMap.set(p, colorPalette[colorIndex % colorPalette.length]));
      if (toDisplay.length > 0) colorIndex++;
      return toDisplay;
    }
  } else {
    // single point case
    if (selection === "snap" && !specialIndicesSet.has(entry.k_point_index)) {
      return [];
    }
    // Assign color based on spin if polarized, else red
    if (bandData?.is_spin_polarized) {
      const spinColor =
        entry.spin === "up"
          ? upColorPalette[colorIndex % upColorPalette.length]
          : downColorPalette[colorIndex % downColorPalette.length];
      colorMap.set(entry, spinColor);
    } else {
      colorMap.set(entry, "red");
    }
    return [entry];
  }
});

  const selectedTrace = {
    x: selectedPoints.map(p => kDistAdjusted[p.k_point_index]),
    y: selectedPoints.map(p => p.energy),
    customdata: selectedPoints.map(p => [
      p.k_point_index,
      p.k_point_coord[0],
      p.k_point_coord[1],
      p.k_point_coord[2]
    ]),
    type: "scatter",
    mode: "markers",
    marker: {
      color: selectedPoints.map(p => colorMap.get(p)),
      size: 10,
      symbol: "circle-open-dot",
      line: { width: 6 }
    },
    name: "Selected Points",
    showlegend: false,
    hovertemplate:
      "Energy: %{y:.3f} eV<br>" +
      "k-point-index: %{customdata[0]}<br>" +
      "k-point-coord:<br>" +
      "x: %{customdata[1]:.3f}<br>" +
      "y: %{customdata[2]:.3f}<br>" +
      "z: %{customdata[3]:.3f}<br>" +
      "<extra></extra>"
  };

  return { selectedTrace, selectedPoints };
}



export function findNearestSpecialIndex(bandIndex, coord, specialIndices, ptsCoord, energyArray, numBands) {
  let nearestLabel = null;
  let nearestIndex = undefined;
  let minDist = Infinity;

  for (const [label, kIndex] of Object.entries(specialIndices)) {
    const pointIndex = kIndex * numBands + bandIndex;
    const specialCoord = ptsCoord?.[pointIndex]?.k_point_coord;

    if (!specialCoord) continue;

    const dist = Math.sqrt(
      specialCoord.reduce((sum, val, i) => sum + (val - coord[i]) ** 2, 0)
    );

    if (dist < minDist) {
      minDist = dist;
      nearestIndex = kIndex;
      nearestLabel = label;
    }
  }

  return { nearestLabel, nearestIndex };
}


/**
 * Check if two points are duplicates by index and band.
 */
export function isDuplicate(pointA, pointB) {
  return (
    pointA.k_point_index === pointB.k_point_index &&
    pointA.band_index === pointB.band_index
  );
}
