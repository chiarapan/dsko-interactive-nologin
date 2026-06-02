import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography, Select, MenuItem, Alert , CircularProgress} from '@mui/material';
import InfoTooltip from '../InfoToolTip';
import FilterControls from './FilterControls';
import ParameterSelector from './ParametorSelector';
import CorrelationPlot from './CorrelationPlot';
import { useCorrelationSummary } from './useCorrelationSummary';
//import { correlationTipsText } from '../co';
import TipsBox from '../TipsBox';
import { useCorrelationTips } from '../HeatmapCorrelation/useCorrelationTips';
import { useLanguage } from '../../../context/LanguageContext';



function HeatmapCorrelation({ csvData, corrMatrix }) {
  //const [corrMatrix, setCorrMatrix] = useState(null);
  //const corrMatrixRef = useRef(null);

  const [threshold, setThreshold] = useState(0.0);
  const [maxThreshold, setMaxThreshold] = useState(1.0);
  const [filterMode, setFilterMode] = useState('all');
  const [selectedParams, setSelectedParams] = useState([]);
  const [paramDisplayOrder, setParamDisplayOrder] = useState('csv'); // drives both dropdown and plot
  const { t, tWithHtml } = useLanguage();

  
  const didInitParams = useRef(false);
  const correlationSummary = useCorrelationSummary(corrMatrix);

  // Extract and prepare parameter lists
  const allParams = useMemo(() => {
    if (!corrMatrix || !csvData?.data?.length) return { csv: [], abc: [] };

    const csvOrder = Object.keys(csvData.data[0]).filter(
      k => !k.toLowerCase().includes('cost') &&
        !k.toLowerCase().includes('calc_dir') &&
        k !== 'step' && 
        !isNaN(+csvData.data[0][k])
    );
    const setFromMatrix = new Set();
    corrMatrix.forEach(row => {
      setFromMatrix.add(row.param);
      Object.keys(row).forEach(col => {
        if (col !== 'param') setFromMatrix.add(col);
      });
    });
    const unique = Array.from(setFromMatrix).filter(k => k !== "step");
    const inCsvOrder = csvOrder.filter(k => unique.includes(k));
    const notInCsvOrder = unique.filter(k => !csvOrder.includes(k));
    return {
      csv: [...inCsvOrder, ...notInCsvOrder],
      abc: [...unique].sort((a, b) => a.localeCompare(b))
    };
  }, [corrMatrix, csvData]);


  // Initialize parameters on first valid matrix load
  useEffect(() => {
    const all = paramDisplayOrder === 'csv' ? allParams.csv : allParams.abc;
    if (
      corrMatrix &&
      !didInitParams.current &&
      selectedParams.length === 0 &&
      all.length > 0
    ) {
      setSelectedParams(all);
      didInitParams.current = true;
    }
  }, [corrMatrix, allParams, paramDisplayOrder, selectedParams]);

  // Filter matrix by correlation and selection
  const filteredMatrix = useMemo(() => {
  if (!corrMatrix) return null;

  const allSelected = selectedParams.length === 0
    ? (paramDisplayOrder === 'csv' ? allParams.csv : allParams.abc)
    : selectedParams;

  const filteredKeys = allSelected.filter(param => {
    return corrMatrix.some(row => {
      if (row.param !== param) return false;
      return Object.entries(row).some(([b, val]) => {
        if (b === 'param' || b === param) return false;
        const abs = Math.abs(val);
        if (filterMode === 'strong') return abs >= 0.8;
        else if (filterMode === 'moderate') return abs >= 0.2 && abs < 0.8;
        else if (filterMode === 'weak') return abs < 0.2;
        else return abs >= threshold && abs <= maxThreshold;
      });
    });
  });


  const corrMap = new Map();
  corrMatrix.forEach(row => {
    corrMap.set(row.param, row);
  });

  const matrix = filteredKeys.map(a => {
    const row = { param: a };
    filteredKeys.forEach(b => {
      const rowA = corrMap.get(a);
      const rowB = corrMap.get(b);
      let val = rowA?.[b];
      if (typeof val !== 'number' || !isFinite(val)) {
        val = rowB?.[a]; 
      }
      row[b] = typeof val === 'number' && isFinite(val) ? val : 0;
    });
    return row;
  });

  return matrix;
}, [corrMatrix, threshold, maxThreshold, selectedParams, filterMode, paramDisplayOrder, allParams]);

  const correlationTips = useCorrelationTips(corrMatrix, selectedParams, filterMode, threshold, maxThreshold, t);


  const plotData = useMemo(() => {
    if (!filteredMatrix || filteredMatrix.length === 0) return { x: [], y: [], z: [] };

    const used = selectedParams.filter(p => filteredMatrix.some(r => r.param === p));


    const matrixMap = new Map();
    filteredMatrix.forEach(row => {
      matrixMap.set(row.param, row);
    });

    const z = used.map(rowParam => {
      const row = matrixMap.get(rowParam) || {};
      return used.map(colParam => {
        const val = row[colParam];
        return typeof val === 'number' && isFinite(val) ? val : 0;
      });
    });

    return { x: used, y: used, z };
  }, [filteredMatrix, selectedParams]);



  if (!corrMatrix) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
        <CircularProgress size={64} />
        <Typography variant="caption" mt={1}>
          {t('calculating_correlation_matrix')}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Section title and info */}
      <Box  display="flex" alignItems="center"  justifyContent="space-between" mb={3}>
        <Typography sx={{ fontSize: "1rem" }} variant="h6">{t('correlation_heatmap')}</Typography>
        <InfoTooltip 
          tabs={[
            {
              label: t('how_to_read'),
              content: (
                <Typography variant="body2">
                  {t('spearman_correlation_values')}
                  <ul style={{ paddingLeft: 20 }}>
                    <li>{tWithHtml('correlation_tip_1')}</li>
                    <li>{tWithHtml('correlation_tip_2')}</li>
                    <li>{tWithHtml('correlation_tip_3')}</li>
                  </ul>
                </Typography>
              )
            }
          ]}
        />

      </Box>

      <Alert severity="info" sx={{ mb: 2, fontSize: "0.75rem" }}>
        {t('correlation_usage_instruction')}
      </Alert>

      <Box
        sx={{
          
            mb: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems:'center'
        }}
        >
        {/* FilterControls inline */}
    <Box>
      <FilterControls
        threshold={threshold}
        setThreshold={setThreshold}
        maxThreshold={maxThreshold}
        setMaxThreshold={setMaxThreshold}
        filterMode={filterMode}
        setFilterMode={setFilterMode}
      />

    </Box>

        {/* Parameter Order Select */}
        <Box sx={{ mx: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
            <Typography variant="body2" sx={{ mb: 0.5, fontSize: "0.75rem"  }}>Parameter Order:</Typography>
            <Select
            size="small"
            value={paramDisplayOrder}
            onChange={(e) => {
                const newOrder = e.target.value;
                const newAll = allParams[newOrder] || [];

                setParamDisplayOrder(newOrder);
                setSelectedParams(newAll);
            }}

            sx={{ minWidth: 140, fontSize: "0.75rem" }}
            >
            <MenuItem sx={{ fontSize: "0.75rem" }} value="csv">{t('csv_order')}</MenuItem>
            <MenuItem sx={{ fontSize: "0.75rem" }} value="abc">{t('alphabetical')}</MenuItem>
            </Select>
        </Box>

        {/* Parameter selector */}
        <Box>
          <ParameterSelector
          selectedParams={selectedParams}
          setSelectedParams={setSelectedParams}
          allParams={allParams}
          paramOrder={paramDisplayOrder}
          setParamOrder={setParamDisplayOrder}
          />
        </Box>
      </Box>


      {/* Heatmap Plot */}
      {plotData && (
        <CorrelationPlot
          plotData={plotData}
        />
      )}
      {correlationTips.length > 0 && (
        <TipsBox
          title={t('suggestions_based_on_parameter_correlations')}
          items={correlationTips}
          sx={{fontSize: "0.75rem"}}
        />
      )}


    </>
  );
}

export default HeatmapCorrelation;
