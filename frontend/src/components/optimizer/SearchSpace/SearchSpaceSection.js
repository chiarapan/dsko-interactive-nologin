import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  IconButton,
  Stack,
  Grid,
  Paper,
  useTheme, 
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Play, Pause } from 'lucide-react';
import Scatter2DPlot from '../SearchSpace/Scatter2DPlot';
import { getGlobalBestTrail } from '../psoUtils';
import { ConvPlotPaperStyles, gifDownloadButtonStyles } from '../../../styles/Optimizer.styles';
import { requestGifFromFlask } from "../../../api/OptimizationApi";
import { Download } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import InfoTooltip from '../InfoToolTip';

function SearchSpaceSection({ csvData, nParticles }) {
  const theme = useTheme();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [xParam, setXParam] = useState(csvData?.allParams?.[0] || '');
  const [yParam, setYParam] = useState(
    csvData?.allParams?.find(p => p !== csvData?.allParams?.[0]) || ''
  );
  const [costField, setCostField] = useState(
    csvData?.primaryCostField || Object.keys(csvData?.costFields || {})[0]
  );
  const [iterationIndex, setIterationIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const totalIters = csvData?.totalIterations ?? 0;

  const handleGifDownload = async () => {
    setLoading(true);
    const filename = csvData.name?.replace(/\.[^/.]+$/, "") + ".gif"; 
    await requestGifFromFlask({
      x: csvData.paramData[xParam],
      y: csvData.paramData[yParam],
      cost: csvData.costFields[costField],
      total_iters: totalIters,
      n_particles: nParticles,
      filename,
    });

    setLoading(false);
  };

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setIterationIndex((prev) => (prev + 1) % totalIters);
    }, 600);
    return () => clearInterval(timer);
  }, [playing, totalIters]);

  const iterData = useMemo(() => {
    if (!csvData || !xParam || !yParam || !costField) return null;

    const uniqueSteps = [...new Set(csvData.data.map(row => Number(row.step)))];
    const currentStep = uniqueSteps[iterationIndex] ?? uniqueSteps[0];

    const rowIndicesForCurrentStep = csvData.data
      .map((row, idx) => ({ step: row.step, idx }))
      .filter(({ step }) => Number(step) === currentStep)
      .map(({ idx }) => idx);

    return {
      x: rowIndicesForCurrentStep.map(i => csvData.paramData?.[xParam]?.[i]),
      y: rowIndicesForCurrentStep.map(i => csvData.paramData?.[yParam]?.[i]),
      cost: rowIndicesForCurrentStep.map(i => csvData.costFields?.[costField]?.[i]),
      indices: rowIndicesForCurrentStep,
      step: currentStep,
    };
  }, [csvData, xParam, yParam, costField, iterationIndex]);

      

  const bestIdx = iterData?.cost?.length
    ? iterData.cost.indexOf(Math.min(...iterData.cost))
    : 0;

  const globalBestPoint = useMemo(() => {
    const xArray = csvData.paramData?.[xParam] || [];
    const yArray = csvData.paramData?.[yParam] || [];
    const costArray = csvData.costFields?.[costField] || [];

    let index = -1;
    let minCost = Infinity;

    costArray.forEach((val, i) => {
      if (typeof val === 'number' && !isNaN(val) && val < minCost) {
        minCost = val;
        index = i;
      }
    });

    if (index === -1) return null;

    const cost = costArray[index];
    const x = xArray[index];
    const y = yArray[index];
    const path = csvData.calcDirs?.[index] || '—';
    const shortName = path.split('/').pop();
    const csvRow = index + 2;
    const iteration = Number(csvData.data?.[index]?.step) ?? '—';


    // console.log('[GlobalBestPoint]', {
    //   index,
    //   cost,
    //   row: csvRow,
    //   iteration,
    //   file: shortName,
    //   fullPath: path
    // });

    return {
      x,
      y,
      cost,
      filePath: path,
      fileName: shortName,
      row: csvRow,
      iteration
    };
  }, [csvData, xParam, yParam, costField, nParticles]);

  const minCost = Math.min(...(csvData?.costFields?.[costField] || []));
  const maxCost = Math.max(...(csvData?.costFields?.[costField] || []));

  const globalTrail = useMemo(() => {
    if (!csvData || !xParam || !yParam || !costField || !csvData.paramData?.[xParam] || !csvData.paramData?.[yParam]) return [];
    return getGlobalBestTrail(csvData, costField, xParam, yParam, iterationIndex + 1)
  }, [csvData, xParam, yParam, costField, iterationIndex]);

  if (!csvData) return null;


  


  return (
    <Paper elevation={4} sx={ConvPlotPaperStyles(theme)}>
      <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
        {t('particle_distribution_animation')}
      </Typography>
      <Box sx={{  mb: 2 }} display="flex" alignItems="center"  justifyContent="flex-end"  px={8}>
      
        <InfoTooltip
          tabs={[{
            label: t('how_to_read'),
            content: (
              <Box sx={{ mx:2,  maxWidth: 450 }}>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'justify',
                    lineHeight: 1.8,
                    fontSize: "0.75rem"
                  }}
                >
                  {t('particle_distribution_info')}
                </Typography>
              </Box>
            )
          }]}
        />
    </Box>
    <Alert severity="info" sx={{  mx: 8, fontSize: "0.75rem" }}>
      {t('particle_distribution_instruction')}
    </Alert>


      <Grid container spacing={2} mb={3} sx={{ px: 8 , pt:5}}>
         <Grid>
          <FormControl fullWidth size="small">
            <InputLabel sx={{fontSize: "0.75rem"}}>{t('cost_function')}</InputLabel>
            <Select
              value={costField}
              onChange={(e) => setCostField(e.target.value)}
              sx={{fontSize: "0.75rem"}}
              label="Cost Field"
            >
              {Object.keys(csvData.costFields || {}).map(field => (
                <MenuItem sx={{fontSize: "0.75rem"}} key={field} value={field}>{field}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid>
          <FormControl fullWidth size="small">
            <InputLabel>X Parameter</InputLabel>
            <Select
            sx={{fontSize: "0.75rem"}}
              value={xParam}
              onChange={(e) => setXParam(e.target.value)}
              label="X Parameter"
            >
              {csvData.allParams
                .filter(p =>
                  !p.toLowerCase().includes('cost') &&
                  !p.toLowerCase().includes('calc') &&
                  p !== yParam
                )
                .map(p => (
                  <MenuItem sx={{fontSize: "0.75rem"}} key={p} value={p}>{p}</MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid>
          <FormControl fullWidth size="small">
            <InputLabel>Y Parameter</InputLabel>
            <Select
            sx={{fontSize: "0.75rem"}}
              value={yParam}
              onChange={(e) => setYParam(e.target.value)}
              label="Y Parameter"
            >
              {csvData.allParams
                .filter(p =>
                  !p.toLowerCase().includes('cost') &&
                  !p.toLowerCase().includes('calc') &&
                  p !== xParam
                )
                .map(p => (
                  <MenuItem sx={{fontSize: "0.75rem"}} key={p} value={p}>{p}</MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

       
      </Grid>

      {xParam && yParam && iterData?.cost?.length > 0 && (
        <>
          <Stack direction="row" spacing={2} alignItems="center" mb={2} sx={{ px: 8}}>
            <Slider
              value={iterationIndex +1}
              onChange={(e, val) => setIterationIndex(val-1)}
              step={1}
              min={1}
              max={Math.max(1, totalIters)}
              marks
              valueLabelDisplay="auto"
              sx={{ flex: 1 }}
            />
            <IconButton onClick={() => setPlaying((prev) => !prev)}>
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </IconButton>
          </Stack>

          <Box id="search-space-plot" display="flex" justifyContent="center" sx={{ px: 4}} height={{ xs: '60vh', sm: '70vh', md: '80vh' }} maxHeight="95vh" width="100%">

            <Scatter2DPlot
              xData={iterData.x}
              yData={iterData.y}
              costData={iterData.cost}
              calcDirs={csvData.calcDirs}
              xLabel={xParam}
              yLabel={yParam}
              bestIndex={bestIdx}
              globalBestPoint={globalBestPoint}
              globalTrail={globalTrail}
              minCost={minCost}
              maxCost={maxCost}
              iterationIndex={iterationIndex}
              fixedRange={{
                x: [Math.min(...csvData.paramData[xParam]), Math.max(...csvData.paramData[xParam])],
                y: [Math.min(...csvData.paramData[yParam]), Math.max(...csvData.paramData[yParam])]
              }}
              nParticles={nParticles}
              onClick={(event) => {
                if (event.points.length > 0) {
                  const fullPath = event.points[0].customdata?.[3];
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, px: 8 }}>
          <Button
            onClick={handleGifDownload}
            variant="outlined"
            disabled={loading}
            startIcon={!loading && <Download size={18} />}
            sx={gifDownloadButtonStyles}>
            {loading ? <CircularProgress size={18} /> : 'GIF'}
          </Button>
        </Box>
        </>
      )}
    </Paper>
  );
}

export default SearchSpaceSection;
