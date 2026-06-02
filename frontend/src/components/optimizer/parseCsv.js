export function parseCsvFile(content) {
  const lines = content.trim().split('\n');
  const header = lines[0].split(',');

  const costIndices = header
    .map((h, idx) => ({ h, idx }))
    .filter(({ h }) => h.toLowerCase().includes('cost'));

  const paramIndices = header
    .map((h, idx) => ({ h, idx }))
    .filter(({ h }) =>
      !h.toLowerCase().includes('cost') &&
      !h.toLowerCase().includes('calc') &&
      h.toLowerCase() !== 'step'
    );


  const paramData = {};
  const costFields = {};
  const calcDirs = [];

  paramIndices.forEach(({ h }) => (paramData[h] = []));
  costIndices.forEach(({ h }) => (costFields[h] = []));

  const calcIdx = header.findIndex(
    h => h.toLowerCase().includes('calc') && h.toLowerCase().includes('dir')
  );

  const stepIdx = header.findIndex(h => h.toLowerCase() === 'step');
  const stepValues = new Set();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (!cols.length) continue;

    paramIndices.forEach(({ h, idx }) => {
      paramData[h].push(Number(cols[idx]));
    });

    costIndices.forEach(({ h, idx }) => {
      costFields[h].push(Number(cols[idx]));
    });

    if (calcIdx !== -1) {
      calcDirs.push(cols[calcIdx]);
    }

    if (stepIdx !== -1) {
      const step = cols[stepIdx];
      if (step !== undefined) stepValues.add(step);
    }
  }

  const data = lines.slice(1).map(line => {
    const cols = line.split(',');
    const entry = {};
    header.forEach((key, i) => {
      entry[key] = Number(cols[i]);
      if (isNaN(entry[key])) entry[key] = cols[i];
    });
    return entry;
  });

  const fitnessKey = Object.keys(costFields)[0] || '';

  return {
    data,
    paramData,
    costFields,
    fitness: costFields[fitnessKey] || [],
    allParams: paramIndices.map(p => p.h),
    totalSamples: lines.length - 1,           
    totalIterations: stepIdx !== -1 ? stepValues.size : undefined, 
    calcDirs,
  };

}
