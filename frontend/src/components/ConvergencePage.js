import { useState, useRef, useEffect } from 'react';
import { Container, Typography, Stack, Paper, Grid, useTheme, CircularProgress, Box, Button, IconButton } from '@mui/material';
import FileDisplay from '../utils/FileDisplay';
import CsvUpload from './optimizer/CsvUpload';
import ParameterOverviewSection from './optimizer/ParameterOverviewSection';
import { parseCsvFile } from '../components/optimizer/parseCsv';
import { File, Power, Save, X, Eye } from 'lucide-react';
import { convergenceContainerStyling } from "../styles/Optimizer.styles";
import { paperUploadStyles, pageTitleStyles, titleStyles, descriptionStyles } from '../styles/shared.styles';
import SearchSpaceSection from '../components/optimizer/SearchSpace/SearchSpaceSection';
import { useOptimizerSession } from '../context/OptimizerContext';
import { NoteDialog, PlotDialog } from './bandstructure/Dialogs';
import { createOptimizerSession } from '../api/OptimizerSessionApi';
import { useSnackbar } from "notistack";
import { useLanguage } from '../context/LanguageContext';

function ConvergencePage() {
  const {
    csvData, setCsvData,
    yamlData, setYamlData,
    setNumParticles,
    importanceCacheRef,
    clearSession
  } = useOptimizerSession();

  const [isLoadingCsv, setIsLoadingCsv] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [author, setAuthor] = useState("");
  const [atom, setAtom] = useState("");
  const [isUpdatingSession, setIsUpdatingSession] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isUploadBoxVisible, setIsUploadBoxVisible] = useState(true);
  const [rawCsvUpload, setRawCsvUpload] = useState(null);

  const correlationMatrixRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const { t } = useLanguage();

  // Compute iterations
  const totalIters = csvData?.totalIterations ?? 0;
  const totalSamples = csvData?.totalSamples ?? 0;
  const numParticles = totalIters > 0 ? Math.floor(totalSamples / totalIters) : undefined;

  useEffect(() => {
    if (numParticles) {
      setNumParticles(numParticles); 
    }
  }, [numParticles, setNumParticles]);

  // Clear uploaded files
  const handleRemoveCsv = () => setCsvData(null);
  const handleRemoveYaml = () => setYamlData(null);


  

  const handleCsvUpload = async ({ content, name }) => {
    setIsLoadingCsv(true);
    await new Promise(r => setTimeout(r, 0)); 
    setRawCsvUpload({ content, name });
  };
  
  useEffect(() => {
    if (!rawCsvUpload) return;

    const processCsv = async () => {
      try {
        const { content, name } = rawCsvUpload;
        const parsed = parseCsvFile(content);

        const isValid =
          parsed &&
          Array.isArray(parsed.data) &&
          parsed.data.length > 0 &&
          parsed.costFields &&
          Object.keys(parsed.costFields).length > 0;

        if (!isValid) {
          enqueueSnackbar(t("invalid_or_missing_data"), { variant: "error" });
          return;
        }

        if (!("step" in parsed.data[0])) {
          enqueueSnackbar(t("missing_step_column"), { variant: "error" });
          return;
        }

        setCsvData({
          name,
          data: parsed.data,
          paramData: parsed.paramData,
          costFields: parsed.costFields,
          fitness: parsed.fitness,
          allParams: parsed.allParams,
          totalIterations: parsed.totalIterations,
          totalSamples: parsed.totalSamples,
          calcDirs: parsed.calcDirs,
        });

              setTimeout(() => {
          try {
            // Correlation Worker
            const corrWorker = new Worker(
              new URL('./optimizer/workers/correlation.worker.js', import.meta.url),
              { type: 'module' }
            );

            corrWorker.onmessage = (e) => {
              correlationMatrixRef.current = e.data;
              console.log("Correlation ready");
            };

            corrWorker.postMessage({
              data: parsed.data,
              excludeKeys: ['costs', 'cost', 'calc_dir', 'step']
            });

            // Importance Worker
            const defaultCostField = Object.keys(parsed.costFields)[0];
            if (defaultCostField && parsed.data?.length) {
              const keys = Object.keys(parsed.data[0]).filter(
                (k) => !k.includes("cost") && !k.includes("calc_dir") && k !== "step"
              );
              const X = parsed.data.map((row) =>
                Object.fromEntries(keys.map((k) => [k, +row[k]]))
              );
              const y = parsed.data.map((row) => +row[defaultCostField]);

              console.log('Sending to backend...');

              const impWorker = new Worker(
                new URL('./optimizer/workers/importance.worker.js', import.meta.url),
                { type: 'module' }
              );

              impWorker.onmessage = (e) => {
                if (!e.data.success) {
                  console.error("Importance calc failed:", e.data.error);
                  return;
                }
                const result = e.data.result;
                console.log("Received importance result:");
                importanceCacheRef.current = {
                  [defaultCostField]: result,
                };
              };

              impWorker.postMessage({ X, y });
            }
          } catch (e) {
            console.error("Correlation calc failed:", e);
          }
        }, 0);
      } catch (err) {
        enqueueSnackbar(t("unexpected_issue"), { variant: "error" });
      } finally {
        setIsLoadingCsv(false);
        setRawCsvUpload(null);
      }
    };

    processCsv();
  }, [rawCsvUpload, enqueueSnackbar, t, setCsvData]);



  // Save session handler
  const handleSave = async () => {
    const payload = {
      data: csvData,
      numParticles,
      notes: sessionNotes.trim(),
      author: author.trim(),
      atom: atom.trim(),
    };

    try {
      await createOptimizerSession(payload);
      enqueueSnackbar(t('session_saved'), { variant: "success" });
    } catch (error) {
      enqueueSnackbar(t('save_session_failed'), { variant: "error" });
    } finally {
      setNoteDialogOpen(false);
      setSessionNotes("");
    }
  };

  const handleEndSession = async () => {
    try {
      await clearSession();
      enqueueSnackbar(t('session_terminated'), { variant: "success" });
    } catch (error) {
      console.error("Failed to terminate session:", error);
      enqueueSnackbar(t('terminate_session_failed'), { variant: "error" });
    }
  };

  useEffect(() => {
    
    if (!csvData || !csvData.costFields) return;
    
    const defaultCostField = Object.keys(csvData.costFields)[0];
    const needsCorrelation = !correlationMatrixRef.current;
    const needsImportance =
      defaultCostField &&
      csvData.data?.length &&
      Object.keys(importanceCacheRef.current || {}).length === 0;

    if (!needsCorrelation && !needsImportance) return;

    setTimeout(() => {
      try {
        if (needsCorrelation) {
          const corrWorker = new Worker(
            new URL('./optimizer/workers/correlation.worker.js', import.meta.url),
            { type: 'module' }
          );
          corrWorker.onmessage = (e) => {
            correlationMatrixRef.current = e.data;
            console.log("Correlation restored");
          };
          corrWorker.postMessage({
            data: csvData.data,
            excludeKeys: ['costs', 'cost', 'calc_dir']
          });
        }

        if (needsImportance) {
          const keys = Object.keys(csvData.data[0]).filter(
            (k) => !k.includes("cost") && !k.includes("calc_dir") && k !== "step"
          );
          const X = csvData.data.map(row =>
            Object.fromEntries(keys.map(k => [k, +row[k]]))
          );
          const y = csvData.data.map(row => +row[defaultCostField]);

          const impWorker = new Worker(
            new URL('./optimizer/workers/importance.worker.js', import.meta.url),
            { type: 'module' }
          );

          impWorker.onmessage = (e) => {
            if (!e.data.success) {
              console.error("Importance restore failed:", e.data.error);
              return;
            }
            const result = e.data.result;
            console.log("Importance restored");
            importanceCacheRef.current = {
              [defaultCostField]: result
            };
          };

          impWorker.postMessage({ X, y });
        }
      } catch (err) {
        console.error("Session restore failed:", err);
        enqueueSnackbar(t("unexpected_issue"), { variant: "error" });
      }
    }, 0);

  }, [csvData, importanceCacheRef, enqueueSnackbar, t]);





  return (
    <Box>
      <Container maxWidth="xl" sx={convergenceContainerStyling}>
        <Typography variant="h4" align="center" sx={pageTitleStyles} gutterBottom>
          {t('dftb_parametrization')}
        </Typography>

        <Box
          sx={{
            display: isUploadBoxVisible ? 'flex' : 'none',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Paper elevation={5} sx={{ position: 'relative', ...paperUploadStyles(theme) }}>
            <IconButton
              onClick={() => setIsUploadBoxVisible(false)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <X size={20} />
            </IconButton>
            <Typography variant="h5" fontWeight="bold" mb={3} sx={titleStyles}>
              {t('optimization_data')}
            </Typography>

            <Typography variant="body1" color="text.secondary" mb={5} pb={2} sx={descriptionStyles}>
              {t('upload_sim_data_instruction')}
            </Typography>

            <Grid container spacing={4} justifyContent="center">
              <Grid>

                <Stack spacing={2} alignItems="center">
                  {yamlData && (
                    <FileDisplay
                      name={yamlData.name}
                      label="Optimizer Configuration"
                      icon={<File fontSize="medium" sx={{ mb: 0.5, color: 'success.main' }} />}
                      onRemove={handleRemoveYaml}
                    />
                  )}
                </Stack>
              </Grid>


              <Grid>

                <Stack spacing={1} alignItems="center">
                  {!csvData && <CsvUpload onUpload={handleCsvUpload} label="Upload Simulation Data" />}
                  {isLoadingCsv ? (
                    <Stack alignItems="center" spacing={1}>
                      <CircularProgress />
                      <Typography variant="caption" color="text.secondary">
                        {t('processing_simulation_data')}
                      </Typography>
                    </Stack>
                  ) : (
                    csvData && (
                      <Stack alignItems="center" spacing={0.5}>
                        <FileDisplay
                          name={csvData.name}
                          label={`Simulation Data ${csvData.name}`}
                          icon={<File fontSize="medium" sx={{ mb: 0.5, color: 'success.main' }} />}
                          onRemove={handleRemoveCsv}
                        />
                        <Typography variant="caption" sx={{ fontSize: "0.7rem" }} color="text.secondary">
                          {t('showing_iterations_so_far', { totalIters })}
                        </Typography>
                      </Stack>
                    )
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {!isUploadBoxVisible && (
          <Button
            onClick={() => setIsUploadBoxVisible(true)}
            startIcon={<Eye size={18} />}
            sx={{ mt: 2 }}
          >
            {t("show_upload_panel")}
          </Button>
        )}
        {/* Display parameter and search space sections if data is loaded */}
        {csvData &&(
          <>
            <ParameterOverviewSection
              csvData={csvData}
              totalIters={totalIters}
              numParticles={numParticles}
              importanceCacheRef={importanceCacheRef}
              correlationMatrixRef={correlationMatrixRef}
            />

          
              <SearchSpaceSection
                csvData={csvData}
                nParticles={numParticles}
              />
            
            {csvData && (
              <Stack direction="row" justifyContent="center" spacing={3} sx={{ mt: 6 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setNoteDialogOpen(true)}
                  startIcon={<Save size={16} />}
                  sx={{
                    px: 2.5,
                    py: 1.7,
                    borderRadius: 2,
                    height: 50,
                    textTransform: 'none',
                    fontWeight: 400,
                    fontSize: '1rem',
                    boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)'
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                      boxShadow: '0 2px 10px rgba(25, 118, 210, 0.3)'
                    }
                  }}
                >
                  {t('save_session')}
                </Button>


                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setConfirmDialogOpen(true)}
                  startIcon={<Power size={16} />}
                  sx={{
                    px: 2.5,
                    py: 1.7,
                    height: 50,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 400,
                    fontSize: '1rem',
                    boxShadow: '0 4px 14px rgba(211, 47, 47, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(211, 47, 47, 0.6)'
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                      boxShadow: '0 2px 10px rgba(211, 47, 47, 0.3)'
                    }
                  }}
                >
                  {t('end_session')}
                </Button>
              </Stack>
            )}
          </>
        )}


        {/* Dialog to input session metadata */}
        <NoteDialog
          open={noteDialogOpen}
          onClose={() => setNoteDialogOpen(false)}
          onSave={handleSave}
          sessionNotes={sessionNotes}
          setSessionNotes={setSessionNotes}
          atom={atom}
          setAtom={setAtom}
          author={author}
          setAuthor={setAuthor}
          isUpdating={isUpdatingSession}
          theme={theme}
        />
        <PlotDialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          onConfirm={handleEndSession}
          title={t('end_session')}
          content={t('confirm_end_session')}
          confirmLabel={t('end_session')}
          cancelLabel={t('cancel')}
          confirmColor="error" />
      </Container>
    </Box>
  );
}

export default ConvergencePage;
