import React, { useEffect, useState, useRef } from "react";
import Plot from "react-plotly.js";
import { Box, Typography, CircularProgress, Select, MenuItem, useTheme, Alert } from '@mui/material';
import TipsBox from "./TipsBox";
import { useLanguage } from '../../context/LanguageContext';
import { featureBarChartBoxStyles } from "../../styles/Optimizer.styles";
import InfoTooltip from "./InfoToolTip";

function RandomForestImportance({ csvData, importanceCacheRef }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
    const { t, tWithHtml } = useLanguage();


  // Selected cost field used as prediction target
  const [selectedCostField, setSelectedCostField] = useState('');


  useEffect(() => {
    if (!csvData?.costFields) return;

    const firstField = Object.keys(csvData.costFields)[0];
    if (firstField && selectedCostField !== firstField) {
      setSelectedCostField(firstField);
    }
  }, [csvData?.costFields]);

  // Importance results returned by backend
  const [importances, setImportances] = useState(null);

  // Compute or load importance values from cache
  useEffect(() => {
    console.log('RF useEffect triggered');
    if (!csvData?.data || !selectedCostField) return;

    // Check external cache
    if (importanceCacheRef.current?.[selectedCostField]) {
      const cached = importanceCacheRef.current[selectedCostField];
      setImportances(cached);
      console.log("Total importance entries:", cached.length);
      console.log("Distinct param names:", new Set(cached.map(d => d.param)).size);
      return;
    }

    // Extract parameter keys (numeric only)
    const keys = Object.keys(csvData.data[0]).filter(
      k =>
        !k.includes("cost") &&
        !k.includes("calc_dir") &&
        k !== "step"
    );

    const X = csvData.data.map(row =>
      Object.fromEntries(keys.map(k => [k, +row[k]]))
    );
    const y = csvData.data.map(row => +row[selectedCostField]);

    console.log('Sending to backend...');

    const importanceWorker = new Worker(
      new URL('./workers/importance.worker.js', import.meta.url),
      { type: 'module' }
    );

    importanceWorker.onmessage = (e) => {
      if (!e.data.success) {
        console.error('RF Worker error:', e.data.error);
        return;
      }

      const result = e.data.result;
      console.log('Received importance result:');

      importanceCacheRef.current = {
        ...(importanceCacheRef.current || {}),
        [selectedCostField]: result
      };
      setImportances(result);
    };

    importanceWorker.postMessage({ X, y });
  }, [csvData, selectedCostField]);



  if (!importances) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
        <CircularProgress size={64} />
        <Typography variant="caption" mt={1}>
          {t('calculating_parameter_importance')}
        </Typography>
      </Box>
    );
  }

  if (importances.length === 0) {
    return (
      <Typography color="text.secondary" mt={2}>
        {t('no_significant_parameters_found')}
      </Typography>
    );
  }

  // Sort importances descending by importance value
  const sortedImportances = [...importances].sort((a, b) => b.importance - a.importance);

  // Estimate height dynamically based on number of parameters
  const rowHeight = 30;
  const dynamicHeight = sortedImportances.length * rowHeight;
  const maxHeight = 500;

  // Tips based on importance
  const importanceTips = [];

  const veryHigh = sortedImportances.filter(p => p.importance >= 0.2);
  const veryLow = sortedImportances.filter(p => p.importance <= 0.02);

  // Sort descending for high, ascending for low
  veryHigh.sort((a, b) => b.importance - a.importance);
  veryLow.sort((a, b) => a.importance - b.importance);

  if (veryHigh.length === 1) {
  const param = veryHigh[0].param;
  const importance = veryHigh[0].importance.toFixed(3);
  importanceTips.push({
    text: t('importance_veryHigh_single', { param, importance }),
    severity: "warning",
  });
} else if (veryHigh.length === 2) {
  const [a, b] = veryHigh;
  importanceTips.push({
    text: t('importance_veryHigh_double', {
      paramA: a.param,
      importanceA: a.importance.toFixed(3),
      paramB: b.param,
      importanceB: b.importance.toFixed(3),
    }),
    severity: "warning",
  });
} else if (veryHigh.length >= 3) {
  const top = veryHigh[0];
  const count = veryHigh.length - 1;
  importanceTips.push({
    text: t('importance_veryHigh_multiple', {
      param: top.param,
      importance: top.importance.toFixed(3),
      count,
    }),
    severity: "warning",
  });
}

if (veryLow.length === 1) {
  const p = veryLow[0];
  importanceTips.push({
    text: t('importance_veryLow_single', {
      param: p.param,
      importance: p.importance.toFixed(3),
    }),
    severity: "info",
  });
} else if (veryLow.length >= 2) {
  const p = veryLow[0];
  const count = veryLow.length - 1;
  importanceTips.push({
    text: t('importance_veryLow_multiple', {
      param: p.param,
      importance: p.importance.toFixed(3),
      count,
    }),
    severity: "info",
  });
}


  return (
    <Box display="flex" flexDirection="column" width="100%" mt={2}>
      <Box display="flex"  alignItems="center" justifyContent="space-between" mb={1}>
      <Typography sx={{fontSize: "1rem"}} variant="h6">
        {t('importance')}
      </Typography>
      <InfoTooltip
      x={{fontSize: "0.75rem"}}
        tabs={[
          {
            label: t('how_to_read'),
            content: (
              <>
                <Typography sx={{fontSize: "0.8rem"}} variant="body2" gutterBottom>
                  {t('importance_how_to_read')}
                </Typography>
                <ul style={{ paddingLeft: 20, fontSize: "0.75rem" }}>
                  <li>{tWithHtml('importance_tip_high')}</li>
                  <li>{tWithHtml('importance_tip_low')}</li>
                </ul>
                <Typography sx={{fontSize: "0.8rem"}} variant="body2" gutterBottom>
                {t('importance_interpretation_tip')}
              </Typography>

              </>
            )
          }
        ]}
      />
    </Box>

    <Alert s severity="info" sx={{ mb: 2, fontSize: "0.75rem" }}>
      {t('importance_usage_instruction')}
    </Alert>

      <Box width="95%" display="flex" justifyContent="flex-start" alignItems="center" gap={2} mb={2}>
        <Typography sx={{fontSize: "0.75rem"}} variant="body2">{t('cost_field')}</Typography>
        <Select
          size="small"
          value={selectedCostField}
          onChange={(e) => setSelectedCostField(e.target.value)}
          sx={{ minWidth: 180, fontSize: "0.75rem" }}
        >
          {Object.keys(csvData.costFields || {}).map((field) => (
            <MenuItem sx={{fontSize: "0.75rem"}} key={field} value={field}>{field}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* Horizontal bar chart showing feature importances */}
      <Box sx={featureBarChartBoxStyles(isDark, dynamicHeight, maxHeight)}>

        <Plot
          key={selectedCostField}
          useResizeHandler
          style={{ width: '100%', height: dynamicHeight }}
          data={[{
            x: sortedImportances.map(d => d.importance),
            y: sortedImportances.map(d => d.param),
            type: "bar",
            orientation: "h",
            visible: true
          }]}
          layout={{
            margin: { t: 40, l: 120, r: 30, b: 60 },
            xaxis: {
              title: 'Importance',
              color: isDark ? '#e0e0e0' : '#000000',
            },
            yaxis: {
              automargin: true,
              color: isDark ? '#e0e0e0' : '#000000',
            },
            paper_bgcolor: isDark ? '#121212' : '#ffffff',
            plot_bgcolor: isDark ? '#121212' : '#ffffff',
            font: {
              color: isDark ? '#e0e0e0' : '#000000',
            },
          }}
          config={{ responsive: true }}
        />
      </Box>

      {importanceTips.length > 0 && (
        <TipsBox
          title={t('suggestions_based_on_parameter_importance')}
          items={importanceTips}
        />
      )}
    </Box>
  );
}

export default RandomForestImportance;
