import  { useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Alert,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Plot from 'react-plotly.js';
import TipsBox from './TipsBox';
import { getConvergenceTipsText } from './tipsMessages';
import { useLanguage } from '../../context/LanguageContext';
import { convergencePlotBoxStyles } from '../../styles/Optimizer.styles';
import InfoTooltip from './InfoToolTip';

import {
  getBestCostPerIteration,
  getMeanCostPerIteration,
  getStdCostPerIteration,
  getMedianCostPerIteration,
  getBestSoFarCost
} from './psoUtils';

function ConvergenceMetricsPlot({ csvData, nParticles, totalIters }) {
  const [selectedCostField, setSelectedCostField] = useState(Object.keys(csvData.costFields)[0] || '');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t, tWithHtml } = useLanguage();
  const isSmallScreen = useMediaQuery('(max-width:800px)');
  if (!csvData || !nParticles) return null;

  // Extract and compute convergence metrics as arrays
  const costs = csvData.costFields[selectedCostField];
  if (!costs) {
    console.error("Missing cost field data. Available fields:", Object.keys(csvData.costFields || {}));
  }

  const { bestValues, bestIndices } = getBestCostPerIteration(costs, nParticles);
  const mean = getMeanCostPerIteration(costs, nParticles);
  const std = getStdCostPerIteration(costs, nParticles);
  const median = getMedianCostPerIteration(costs, nParticles);
  const { bestSoFarValues, bestSoFarIndices } = getBestSoFarCost(bestValues, bestIndices);
  const x = Array.from({ length: totalIters }, (_, i) => i);

  //  Aggregated metrics used for generating dynamic tips 
  const avgMean = mean.reduce((a, b) => a + b, 0) / mean.length;
  const avgStd = std.reduce((a, b) => a + b, 0) / std.length;
  const avgBest = bestValues.reduce((a, b) => a + b, 0) / bestValues.length;
  const avgMedian = median.reduce((a, b) => a + b, 0) / median.length;
  
  function findLongestStagnationBlock(values, tolerance = 1e-8, minLength = 8) {
    let maxBlock = { count: 0, startIteration: 0 };
    let currentCount = 1;

    for (let i = 1; i < values.length; i++) {
      if (Math.abs(values[i] - values[i - 1]) <= tolerance) {
        currentCount++;
      } else {
        if (currentCount >= minLength && currentCount > maxBlock.count) {
          maxBlock = { count: currentCount, startIteration: i - currentCount };
        }
        currentCount = 1;
      }
    }

    // Check last block
    if (currentCount >= minLength && currentCount > maxBlock.count) {
      maxBlock = { count: currentCount, startIteration: values.length - currentCount };
    }

    return maxBlock.count >= minLength ? maxBlock : null;
  }

  const stagnationBlock = findLongestStagnationBlock(bestSoFarValues);


  const tips = [];

  if (avgMean && avgStd && avgStd / avgMean > 0.5) {
    tips.push(getConvergenceTipsText(t).highStd);
  } else if (avgMean && avgStd && avgStd / avgMean < 0.1) {
    tips.push(getConvergenceTipsText(t).lowStd);
  }

  if (avgBest && avgMean / avgBest > 2) {
    tips.push(getConvergenceTipsText(t).meanHigherThanBest);
  }

  if (avgMean && avgMedian && Math.abs(avgMean - avgMedian) / avgMean > 0.3) {
    tips.push(getConvergenceTipsText(t).meanDiffersFromMedian);
  }

  if (stagnationBlock) {
  tips.push(getConvergenceTipsText(t).stagnated(stagnationBlock, t));
  }

  // Prepare Plotly traces for each metric
  const data = [
    {
      x,
      y: bestValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Best',
      marker: { color: 'green' },
      text: bestIndices.map(idx => `Particle index: ${idx}`),
      hovertemplate: 'Iteration %{x}<br>Cost: %{y}<br>%{text}<extra></extra>'
    },
    {
      x,
      y: mean,
      type: 'scatter',
      mode: 'lines',
      name: 'Mean',
      line: { color: 'gray', dash: 'dot' },
      hovertemplate: 'Iteration %{x}<br>Mean Cost: %{y:.4f}<extra></extra>',
    },
    {
      x: [...x, ...x.slice().reverse()],
      y: [...mean.map((m, i) => m - std[i]), ...mean.map((m, i) => m + std[i]).reverse()],
      fill: 'toself',
      fillcolor: 'rgba(150,150,150,0.2)',
      line: { color: 'transparent' },
      name: 'Standard Deviation',
      type: 'scatter',
      hoverinfo: 'skip',
      showlegend: true
    },
    {
      x,
      y: median,
      type: 'scatter',
      mode: 'lines',
      name: 'Median',
      line: { color: 'orange', dash: 'dash' },
      hovertemplate: 'Iteration %{x}<br>Median Cost: %{y:.4f}<extra></extra>',
    },
    {
      x,
      y: bestSoFarValues,
      type: 'scatter',
      mode: 'lines',
      name: 'Best-so-far',
      line: { color: 'blue', dash: 'solid' },
      text: bestSoFarIndices.map(idx => `Particle index: ${idx}`),
      hovertemplate: 'Iteration %{x}<br>Best cost so far: %{y}<br>%{text}<extra></extra>'
    }
  ];

  if (!costs) {
    console.error("Missing cost field data. Available fields:", Object.keys(csvData.costFields || {}));
  }

  // Make tips globally accessible for PDF export
  if (typeof window !== "undefined") {
    window.__convergenceTips = tips;
  }


  return (
    <Box mt={5} id="convergence-section">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
      <Typography variant="h6">
        {t('convergence_overview')}
      </Typography>
      <InfoTooltip
        tabs={[
          {
            label: t('how_to_read'),
            content: (
              <>
                <Typography sx={{ fontSize: "0.9rem" }} gutterBottom>
                  {t('convergence_how_to_read')}
                </Typography>
                <ul style={{ paddingLeft: 20 }}>
                  <li>{tWithHtml('convergence_tip_best')}</li>
                  <li>{tWithHtml('convergence_tip_mean')}</li>
                  <li>{tWithHtml('convergence_tip_median')}</li>
                  <li>{tWithHtml('convergence_tip_std')}</li>
                  <li>{tWithHtml('convergence_tip_best_so_far')}</li>
                </ul>
              </>
            )
          }
        ]}
      />
    </Box>




      <Alert severity="info" sx={{ mb: 2, fontSize: "0.75rem" }}>
        {t('choose_cost_function_instruction')}
      </Alert>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ minWidth: 100, textAlign: 'right', fontSize: "0.75rem" }}>
          {t('cost_function')}
        </Typography>
        <Select
          size="small"
          value={selectedCostField}
          onChange={(e) => setSelectedCostField(e.target.value)}
          sx={{ minWidth: 180, fontSize: "0.75rem" }}
          displayEmpty
        >
          {Object.keys(csvData.costFields).map(field => (
            <MenuItem sx={{ fontSize: "0.75rem" }} key={field} value={field}>{field}</MenuItem>
          ))}
        </Select>
      </Stack>

      {/* Convergence plot with theme-aware styling */}
      <Box sx={convergencePlotBoxStyles(isDark)}>
        <Plot
          divId="convergence-plot"
          data={data}
          layout={{
            text: "Costs Trend",
            autosize: true,
            paper_bgcolor: isDark ? '#121212' : '#ffffff',
            plot_bgcolor: isDark ? '#121212' : '#ffffff',
            font: {
              color: isDark ? '#e0e0e0' : '#000000',
              size: 12,
            },
            title: {
              font: { size: 16, color: isDark ? '#fff' : '#000' },
            },
            margin: { t: 50, r: 20, b: 70, l: 80 },
            xaxis: { title: { text: 'Iteration' }, zeroline: false, rangemode: 'tozero' },
           yaxis: {
              title: { text: selectedCostField },
              zeroline: false,
              tickmode: 'auto',
              automargin: true,
              ticks: 'outside',
              ticklen: 4,
              tickcolor: isDark ? '#e0e0e0' : '#000000',
            }
            ,
            legend: {
              orientation: isSmallScreen ? 'h' : 'v',
              x: isSmallScreen ? 0.5 : 1,
              xanchor: isSmallScreen ? 'center' : 'left',
              y: isSmallScreen ? -0.3 : 1
            }

          }}


          useResizeHandler
          style={{ width: '100%', height: '100%' }}
          config={{ responsive: true }}
        />
      </Box>
      <TipsBox
        title={t('optimization_tips_title')}
        items={tips}
      />
    </Box>
  );
}

export default ConvergenceMetricsPlot;
