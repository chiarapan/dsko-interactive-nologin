import { useState } from 'react';
import { Paper, Tabs, Tab, Typography, Box, useTheme } from '@mui/material';
import ConvergenceMetricsPlot from './ConvergenceMetricsPlot';
import HeatmapCorrelation from './HeatmapCorrelation'
import RandomForestImportance from './RandomForestImportance';
import { ConvPlotPaperStyles } from '../../styles/Optimizer.styles';
import { useLanguage } from '../../context/LanguageContext';

function ParameterOverviewSection({
  csvData,
  totalIters,
  numParticles, 
  importanceCacheRef,
  correlationMatrixRef
}) {
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();
  const { t, tWithHtml } = useLanguage();
  //const totalIters = Math.floor(csvData.total / numParticles);
  return (
    <Paper elevation={4} sx={ConvPlotPaperStyles(theme)}>
      <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
        {t('analysis_dashboard')}
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={(e, newIndex) => setTabIndex(newIndex)}
        centered
       
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Tab sx={{fontSize: "0.75rem"}} label={t('cost_trends')} />
        <Tab sx={{fontSize: "0.75rem"}} label={t('correlation')} />
        <Tab sx={{fontSize: "0.75rem"}} label={t('importance')} />
      </Tabs>

      <Box width="90%" mx="auto">
        {tabIndex === 0 && (
          <ConvergenceMetricsPlot
            csvData={csvData}
            nParticles={numParticles}
            totalIters={totalIters}
          />
        )}
        {tabIndex === 1 && <HeatmapCorrelation csvData={csvData} corrMatrix={correlationMatrixRef.current}/>}
        {tabIndex === 2 && (
          <RandomForestImportance
            csvData={csvData}
            importanceCacheRef={importanceCacheRef}
          />
        )}
      </Box>
    </Paper>
  );
}

export default ParameterOverviewSection;
