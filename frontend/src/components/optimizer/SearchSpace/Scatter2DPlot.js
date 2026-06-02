import React from 'react';
import Plot from 'react-plotly.js';
import { Box, useTheme } from '@mui/material';

function Scatter2DPlot({
  xData,
  yData,
  costData,
  calcDirs = [],
  xLabel,
  yLabel,
  bestIndex,
  globalBestPoint,
  globalTrail,
  iterationIndex = 0,
  fixedRange,
  minCost,
  maxCost,
  nParticles,
  onClick
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [minX, maxX] = fixedRange.x;
  const [minY, maxY] = fixedRange.y;

  const visibleTrail = globalTrail.slice(0, iterationIndex + 1);
  const last = visibleTrail.at(-1);
 
  const points = {
    x: xData,
    y: yData,
    mode: 'markers',
    type: 'scatter',
    name: 'Particles',
    marker: {
      color: costData,
      colorscale: [
        [0, 'green'],
        [0.5, 'yellow'],
        [1, 'red']
      ],
      cmin: minCost,
      cmax: maxCost,
      colorbar: { title: 'Cost' },
      size: 8,
      showscale: true
    },
    customdata: xData.map((_, i) => {
      const indexInCsvData = iterationIndex * nParticles + i;
      const visibleRow = indexInCsvData + 2;
      const fullPath = calcDirs?.[indexInCsvData] || '—';
      const shortName = fullPath.split('/').pop();
      const iteration = iterationIndex + 1; // 1-based for display
      return [
        visibleRow,     // 0
        costData[i],    // 1
        shortName,      // 2
        fullPath,       // 3
        iteration       // 4 
      ];
    }),
    hovertemplate:
      'Particle<br>' +
      'Iteration: %{customdata[4]}<br>' +        
      'Cost: %{customdata[1]:.4f}<br>' +
      'x: %{x:.3f}<br>' +
      'y: %{y:.3f}<br>' +
      'File: %{customdata[2]}<br>' +
      'CSV Row: %{customdata[0]}<extra></extra>'
  };


  const best = {
    x: [xData[bestIndex]],
    y: [yData[bestIndex]],
    mode: 'markers',
    type: 'scatter',
    name: 'Best of Current Iteration',
    marker: {
      symbol: 'star',
      color: 'white',
      size: 16,
      line: { color: 'black', width: 1 }
    },
    customdata: (() => {
      const globalIndex = iterationIndex * nParticles + bestIndex;
      const csvRow = globalIndex + 2;
      const filePath = calcDirs?.[globalIndex] || '—';
      const shortName = filePath.split('/').pop() || '—';
      return [[
        csvRow,                // 0: CSV row (1-based + header)
        costData[bestIndex],   // 1: Cost
        filePath,              // 2: Full path
        shortName,             // 3: Short name
        iterationIndex         // 4: Iteration
      ]];
    })(),
    hovertemplate:
      '<b>Best of Iteration</b><br>' +
      'Cost: %{customdata[1]:.4f}<br>' +
      'x: %{x:.3f}<br>' +
      'y: %{y:.3f}<extra></extra><br>' +
      'Iteration: %{customdata[4]}<br>' +
      'File name: %{customdata[3]}<br>' +
      'CSV Row: %{customdata[0]}<br>',
    // onClick: (event) => {
    //   const file = event?.points?.[0]?.customdata?.[2];
    //   const iter = event?.points?.[0]?.customdata?.[4];
    //   if (file) console.log(`Clicked BEST file at iteration ${iter}:`, file);
    // }
  };




const globalBest = (() => {
  const {
    cost,
    x,
    y,
    filePath,
    fileName: shortName,
    row,
    iteration
  } = globalBestPoint;

  return {
    x: [x],
    y: [y],
    mode: 'markers',
    type: 'scatter',
    name: 'Global Best (Fixed)',
    marker: {
      symbol: 'star',
      color: 'gold',
      size: 16,
      line: { color: 'black', width: 1 }
    },
    customdata: [[
      iteration,   // 0: Iteration where it occurred
      cost,        // 1: Cost
      filePath,    // 2: Full path
      shortName,   // 3: File name
      row          // 4: CSV row
    ]],
    hovertemplate:
      '<b>Global Best (Fixed)</b><br>' +
      'Iteration: %{customdata[0]}<br>' +
      'Cost: %{customdata[1]:.4f}<br>' +
      'File Name: %{customdata[3]}<br>' +
      'CSV Row: %{customdata[4]}<br>' +
      'x: %{x:.3f}<br>' +
      'y: %{y:.3f}<extra></extra>',
    // onClick: (event) => {
    //   const path = event?.points?.[0]?.customdata?.[2];
    //   const iter = event?.points?.[0]?.customdata?.[0];
    //   if (path) console.log(`Clicked GLOBAL BEST (Fixed) at iteration ${iter}:`, path);
    // }
  };
})();




  const globalTrailLine = {
    x: visibleTrail.map(p => p.x),
    y: visibleTrail.map(p => p.y),
    mode: 'lines',
    type: 'scatter',
    name: 'Global Best Path',
    line: {
      color: 'rgba(180,0,255,0.3)',
      width: 2,
      dash: 'dot'
    },
    hoverinfo: 'skip',
    showlegend: true
  };

  const globalTrailEnd = last ? (() => {
  const currentIteration = last.step + 1;  // Iteração atual da animação
  const globalIndex = last.index;
  const csvRow = globalIndex + 2;
  const foundAtIteration = Math.floor(globalIndex / nParticles) + 1;
  const filePath = calcDirs?.[globalIndex] || '—';
  const shortName = filePath.split('/').pop();

  return {
    x: [last.x],
    y: [last.y],
    mode: 'markers',
    type: 'scatter',
    name: 'Latest Global Best',
    marker: {
      symbol: 'diamond',
      size: 14,
      color: 'magenta',
      line: { color: 'black', width: 1 }
    },
    customdata: [[
      currentIteration,   // 0
      last.cost,          // 1
      filePath,           // 2
      shortName,          // 3
      csvRow,             // 4
      foundAtIteration    // 5
    ]],
    hovertemplate:
      '<b>Latest Global Best</b><br>' +
      'Current Iteration: %{customdata[0]}<br>' +
      'Cost: %{customdata[1]:.4f}<br>' +
      'Found at Iteration: %{customdata[5]}<br>' +
      'CSV Row: %{customdata[4]}<br>' +
      'File Name: %{customdata[3]}<br>' +
      'x: %{x:.3f}<br>' +
      'y: %{y:.3f}<extra></extra>',
    // onClick: (event) => {
    //   const fullPath = event?.points?.[0]?.customdata?.[2];
    //   if (fullPath) console.log("Clicked Latest Global Best file:", fullPath);
    // }
  };
})() : null;


  return (
    <Box
      width="95%"
      mx="auto"
      my="auto"
      height="75vh"
      sx={{
        borderRadius: 3,
        p: 2,
        backgroundColor: isDark ? "#1e1e1e" : "#f0f0f0",
        boxShadow: isDark
          ? "inset 4px 4px 8px rgba(0,0,0,0.6), inset -4px -4px 8px rgba(60,60,60,0.3)"
          : "inset 4px 4px 8px rgba(200,200,200,0.8), inset -4px -4px 8px rgba(255,255,255,0.6)"
      }}
    >
      <Plot
        data={[
          points,
          globalTrailLine,
          // globalTrailStars,
          globalTrailEnd,
          best,
          globalBest,
        ].filter(Boolean)}
        layout={{
          title: {
            // text: 'Particle Swarm - 2D View',
            font: { size: 16, color: isDark ? "#fff" : "#000" }
          },
          autosize: true,
          margin: { t: 40 },
          xaxis: { title: { text: xLabel }, range: [minX, maxX] },
          yaxis: { title: { text: yLabel }, range: [minY, maxY] },
          paper_bgcolor: isDark ? "#1e1e1e" : "#ffffff",
          plot_bgcolor: isDark ? "#2a2a2a" : "#ffffff",
          font: {
            color: isDark ? "#e0e0e0" : "#111111"
          },
          legend: {
            orientation: 'h',
            x: 0,
            y: -0.3,
            font: { size: 10 }
          }
        }}
        useResizeHandler
        style={{ width: '100%', height: "100%" }}
        config={{ responsive: true }}
        onClick={onClick}
      />
    </Box>
  );
}

export default Scatter2DPlot;
