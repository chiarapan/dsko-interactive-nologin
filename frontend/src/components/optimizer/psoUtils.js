export function getBestCostPerIteration(fitness, nParticles) {
  const bestValues = [];
  const bestIndices = [];
  const totalIters = Math.floor(fitness.length / nParticles);

  for (let i = 0; i < totalIters; i++) {
    const start = i * nParticles;
    const end = start + nParticles;
    const slice = fitness.slice(start, end);
    const min = Math.min(...slice); // lowest cost in this iteration
    const idx = slice.indexOf(min); // index lowest cost
    bestValues.push(min);
    bestIndices.push(start + idx);
  }

  return { bestValues, bestIndices };
}

  
export function getMeanCostPerIteration(fitness, nParticles) {
  const mean = []; // // array to store mean/average cost for each iteration
  const totalIters = Math.floor(fitness.length / nParticles);
  for (let i = 0; i < totalIters; i++) {
    const start = i * nParticles;
    const end = start + nParticles;
    const slice = fitness.slice(start, end);
    const m = slice.reduce((a, b) => a + b, 0) / slice.length; // It sums all values and divides by the number of elements
    mean.push(m);
  }
  return mean;
}
  
export function getStdCostPerIteration(fitness, nParticles) {
  const std = [];
  const totalIters = Math.floor(fitness.length / nParticles);
  for (let i = 0; i < totalIters; i++) {
    const start = i * nParticles;
    const end = start + nParticles;
    const slice = fitness.slice(start, end);
    const m = slice.reduce((a, b) => a + b, 0) / slice.length; // It sums all values and divides by the number of elements
    const variance = slice.reduce((acc, val) => acc + (val - m) ** 2, 0) / slice.length; // It calculates the variance by summing the squared differences between each value and the mean m, then dividing by the number of elements
    std.push(Math.sqrt(variance));
  }
  return std;
}
  
export function getMedianCostPerIteration(costs, nParticles) {
  const result = [];
  for (let i = 0; i < costs.length; i += nParticles) {
     // Take a slice for one iteration (costs for all particles)
    const chunk = costs.slice(i, i + nParticles).sort((a, b) => a - b);
    const mid = Math.floor(chunk.length / 2);
    // If the number of values is odd, pick the middle one.
    // If even, take the average of the two middle values.
    const median = chunk.length % 2 === 0 ? (chunk[mid - 1] + chunk[mid]) / 2 : chunk[mid];
    result.push(median);
  }
  return result;
}
  
export function getBestSoFarCost(bestValues, bestIndices) {
  const result = [];
  const resultIndices = [];
  let currentBest = Infinity; // start with worst possible value
  let currentIndex = -1;

  for (let i = 0; i < bestValues.length; i++) {
    // If current value is better, update best
    if (bestValues[i] < currentBest) {
      currentBest = bestValues[i];
      currentIndex = bestIndices[i];
    }
    result.push(currentBest);
    resultIndices.push(currentIndex);
  }

  return { bestSoFarValues: result, bestSoFarIndices: resultIndices };
}


export function getGlobalBestTrail(csvData, costField, xParam, yParam, maxStep) {
  const trail = [];
  let globalBestCost = Infinity;
  let globalBestIndex = -1;

  for (let step = 0; step < maxStep; step++) {
    const indicesForStep = csvData.data
      .map((row, idx) => ({ step: Number(row.step), idx }))
      .filter(({ step: s }) => s === step)
      .map(({ idx }) => idx);

    const slice = indicesForStep.map(i => ({
      cost: csvData.costFields[costField][i],
      index: i
    }));

    const localBest = slice.reduce((best, curr) =>
      curr.cost < best.cost ? curr : best, { cost: Infinity, index: -1 }
    );

    const improved = localBest.cost < globalBestCost;
    if (improved) {
      globalBestCost = localBest.cost;
      globalBestIndex = localBest.index;
    }

    if (globalBestIndex !== -1) {
      trail.push({
        x: csvData.paramData[xParam][globalBestIndex],
        y: csvData.paramData[yParam][globalBestIndex],
        index: globalBestIndex,
        cost: globalBestCost,
        step: step
      });
    }
  }

  return trail;
}



