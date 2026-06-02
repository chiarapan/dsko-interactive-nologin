import React, { useState, useEffect } from "react";
import { Box, Stack, useTheme } from "@mui/system";
import { Typography, Paper, Button, Select, MenuItem, Container, Alert, AlertTitle, Card, Grid, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import { useSession } from "../../context/SessionContext";
import { boxTitleStyles, selectedPointsTitleStyles, selectionButtonStyles, saveUpdateBoxStyles, ConvPlotPaperStyles, pointsBoxStyles, pointsContainerStyles, alertStyles, alertButtonStyles } from "../../styles/BandPlot.styles";
import { Play, Square, Save, AlertTriangle, Trash } from "lucide-react";
import { useSnackbar } from "notistack";
import { NoteDialog, InvalidDataDialog, PlotDialog } from './Dialogs'
import BandPlotChart from "./BandPlotChart";
import BandPlotToolbar from "./BandPlotToolbar";
import { generateSelectedTrace, findNearestSpecialIndex, isDuplicate } from "../../utils/generateSelectedTrace";
import { compressKDist } from "../../utils/compressKDist";
import { saveSessionToDB } from "../../api/SessionApi";
import { useLanguage } from "../../context/LanguageContext";
import { decodingMask } from "../../utils/decodingMask";

const BandPlot = ({ bandData, setSelectionMode }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const { session, addSelectedPoint, endSession, clearSelectedPoints, removeSelectedPoint, setSessionID, selection, setSelection, selectionType, setSelectionType, breakIndices, valenceNumber } = useSession();
  const [exportFormat, setExportFormat] = useState("k_point_coord");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmClearDialogOpen, setConfirmClearDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [author, setAuthor] = useState("");
  const [atom, setAtom] = useState("");
  const [invalidDataDialogOpen, setInvalidDataDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [pairBuffer, setPairBuffer] = useState([]);
  const { t } = useLanguage();
  const numBands = bandData?.num_bands || 0;
  const kpts_coord = bandData?.points || bandData?.energies?.up || [];
  const pts_coord = kpts_coord;


  useEffect(() => {
    const invalid = !bandData?.kpoints || !bandData?.energies;
    if (invalid) {
      setInvalidDataDialogOpen(true);
    }
  }, [bandData, bandData?.kpoints]);

  const kDistAdjusted = compressKDist(bandData.k_dist, breakIndices, 0.0001);
  const specialIndicesSet = new Set(Object.values(bandData?.special_point_indices || {}));

  const selectedPointsRaw = session?.selectedPoints ?? [];
  const { selectedTrace, selectedPoints } = generateSelectedTrace({
    selectedPointsRaw,
    selection,
    specialIndicesSet,
    bandData,
    kDistAdjusted
  });

  const handleSelectionPoint = (data, spin) => {
    if (!session.selectionMode || !data?.points?.length) {
      return enqueueSnackbar("Selection mode off.", {
        variant: "info",
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
        autoHideDuration: 2000,
      });
    }

    const point = data.points[0];
    const curveNumber = point.curveNumber;
    const isPolarized = bandData?.is_spin_polarized;

    // Validate that the selected curve is a band
    const totalBands = isPolarized && spin === "both" ? numBands * 2 : numBands;
    if (curveNumber >= totalBands) {
      console.warn("Selected trace is not a band curve — skipping.");
      return;
    }

    // Determine bandIndex and correct spin
    let bandIndex = curveNumber;
    if (isPolarized && spin === "both") {
      const isDownSpin = curveNumber >= numBands;
      bandIndex = isDownSpin ? curveNumber - numBands : curveNumber;
      spin = isDownSpin ? "down" : "up";
    }

    let kPointIndex = point.pointIndex;
    let pointIndex = kPointIndex * numBands + bandIndex;
    let kPointCoord = pts_coord[pointIndex]?.k_point_coord;
    if (!kPointCoord) return;

    const energies = isPolarized ? bandData.energies?.[spin] : bandData.energies;
    const specialIndices = bandData?.special_point_indices || {};

    // Snap or find nearest label
    let nearestLabel = null;
    let snapped = false;

    if (selection === "snap") {
      const { nearestLabel: label, nearestIndex } = findNearestSpecialIndex(
        bandIndex,
        kPointCoord,
        specialIndices,
        pts_coord,
        energies,
        numBands
      );


      nearestLabel = label;
      kPointIndex = nearestIndex;
      pointIndex = kPointIndex * numBands + bandIndex;
      kPointCoord = pts_coord[pointIndex]?.k_point_coord;
      snapped = true;
    }

    if (selection === "free") {
      const { nearestLabel: label } = findNearestSpecialIndex(
        bandIndex,
        kPointCoord,
        specialIndices,
        pts_coord,
        energies,
        numBands
      );
      nearestLabel = label;
      enqueueSnackbar(t('selected_free_point'), {
        variant: "success",
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
        autoHideDuration: 1500,
      });
    }

    const rawEnergy = energies?.[pointIndex];
    const newPoint = {
      k_point_index: kPointIndex,
      k_point_coord: kPointCoord,
      band_index: bandIndex,
      energy: rawEnergy,
      ...(isPolarized && { spin }),
      ...(nearestLabel && { nearest_label: nearestLabel }),
    };


    const notifySnapped = () => {
      if (snapped) {
        enqueueSnackbar(`${t('snapped_to_special_point')} ${nearestLabel}`, {
          variant: "info",
          anchorOrigin: { vertical: "bottom", horizontal: "center" },
          autoHideDuration: 3000,
        });
      }
    };

    if (selectionType === "single") {
      const alreadySelected = selectedPoints?.some((p) => isDuplicate(p, newPoint));
      if (alreadySelected) {
        enqueueSnackbar(t('point_already_selected'), {
          variant: "warning",
          anchorOrigin: { vertical: "bottom", horizontal: "center" },
          autoHideDuration: 2000,
        });
        return;
      }

      addSelectedPoint(newPoint);
      notifySnapped();
    }

    if (selectionType === "pair") {
      const alreadyInBuffer = pairBuffer.some((p) => isDuplicate(p, newPoint));
      if (alreadyInBuffer) {
        enqueueSnackbar(t('duplicate_point_ignored_in_pair_selection'), {
          variant: "warning",
          anchorOrigin: { vertical: "bottom", horizontal: "center" },
          autoHideDuration: 2000,
        });
        return;
      }

      const newBuffer = [...pairBuffer, newPoint];
      if (newBuffer.length === 2) {
        addSelectedPoint(newBuffer);
        setPairBuffer([]);
        notifySnapped();
      } else {
        setPairBuffer(newBuffer);
        notifySnapped();
      }
    }
  };



  const handleCopy = async () => {
    try {
      const config = {
        structure: "./" + session?.structureData?.structureFileName,
        N_val_electrons: session?.structureData?.val_n,
        band_structure: "./" + bandData?.bandFileName,
        decoding_mask: decodingMask({
          selection: selection,
          selectionType: selectionType,
          exportFormat: exportFormat,
          session,
          bandData,
        })
      };
      const yamlData =
        `structure: ${config.structure}\n` +
        `N_val_electrons: ${config.N_val_electrons}\n` +
        `band_structure: ${config.band_structure}\n` +
        `decoding_mask: \n ${config.decoding_mask}\n`;
      await navigator.clipboard.writeText(yamlData);
      enqueueSnackbar(t('decoding_mask_copied_yaml'), { variant: "success" });
    } catch (error) {
      console.error("Failed to copy decoding mask:", error);
      enqueueSnackbar(t('failed_to_copy_decoding_mask'), { variant: "error" });
    }
  };

  const handleDownload = () => {
    try {
      const config = {
        structure: "./" + session?.structureData?.structureFileName,
        N_val_electrons: session?.structureData?.val_n,
        band_structure: "./" + bandData?.bandFileName,
        decoding_mask: decodingMask({
          selection: selection,
          selectionType: selectionType,
          exportFormat: exportFormat,
          session,
          bandData,
        })
      };
      const yamlData =
        `structure: ${config.structure}\n` +
        `N_val_electrons: ${config.N_val_electrons}\n` +
        `band_structure: ${config.band_structure}\n` +
        `decoding_mask: \n ${config.decoding_mask}\n`;
      const blob = new Blob([yamlData], { type: 'application/x-yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "decoding_mask";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      enqueueSnackbar(t('yaml_file_downloaded'), { variant: 'success' });
    } catch (error) {
      console.error('YAML export failed:', error);
      enqueueSnackbar(t('yaml_export_failed') + error.message, { variant: 'error' });
    }
  };

  const handleSaveOrUpdate = async () => {

    const commonPayload = {
      session,
      structureData: session.structureData,
      selectedPoints: session.selectedPoints,
      selectionMode: session.selectionMode,
      notes: sessionNotes.trim(),
      author: author.trim(),
      atom: atom.trim()
    };

    try {
      await saveSessionToDB(commonPayload);
      enqueueSnackbar(t('session_saved'), { variant: "success" });
    } catch (error) {
      console.error("Error saving session:", error);
      enqueueSnackbar(t('save_session_failed'), { variant: "error" });
    } finally {
      setNoteDialogOpen(false);
      setSessionNotes("");
    }

  };

  const handleClearAll = async () => {
    clearSelectedPoints();
    enqueueSnackbar("All points cleared", { variant: "success" });
  };

  /* End session */
  const handleEndSession = async () => {
    try {
      await endSession();
      setSessionID(null);
      enqueueSnackbar(t('session_terminated'), { variant: "success" });
    } catch (error) {
      console.error("Failed to terminate session:", error);
      enqueueSnackbar(t('terminate_session_failed'), { variant: "error" });
    }
  };

  const handleSelectionModeToggle = () => {
    if (session) {
      setSelectionMode(!session.selectionMode);
    }
  };

  if (!bandData || !session) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6">{t('no_active_session_or_data')}</Typography>
      </Box>
    );
  }
  if (!bandData?.kpoints || !bandData?.energies) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        px={2} >
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            maxWidth: 600,
            width: "100%",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "#1c1c1e" : "#fafafa",
          }} >
          <Box textAlign="center" mb={3}>
            <Alert severity="error" icon={<AlertTriangle size={28} />} sx={alertStyles(theme)} >
              <AlertTitle>
                <Typography variant="h6" fontWeight={600}>
                  {t('invalid_band_structure_data')}
                </Typography>
              </AlertTitle>
              <Typography variant="body2" color="text.secondary">
                {t('missing_required_fields')}
              </Typography>
            </Alert>
          </Box>
          <Box textAlign="center">
            <Button
              variant="contained"
              color="primary"
              size="medium"
              sx={alertButtonStyles}
              onClick={() => {
                endSession();
              }}>
              Reset Session
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }
  return (
    <>
      <Box display="flex" justifyContent="center" mt={2}>
        <Paper elevation={1} sx={ConvPlotPaperStyles(theme)}>
          <Box display="flex" flexDirection="column" alignItems="center" sx={{ minHeight: 0 }}>
            <Typography variant="h4" fontWeight={700} sx={boxTitleStyles}> {t('electronic_band_structure')} </Typography>
            <Box width="100%">
              <BandPlotChart
                bandData={bandData}
                isDarkMode={isDarkMode}
                selectedTrace={selectedTrace}
                onPointSelect={handleSelectionPoint}
              />
            </Box>
            <Box>
              <Button
                variant="outlined"
                color={session?.selectionMode ? "warning" : "primary"}
                onClick={handleSelectionModeToggle}
                sx={selectionButtonStyles(session)}
                startIcon={session?.selectionMode ? <Square size={14} /> : <Play size={14} />} >
                <motion.div
                  layout
                  animate={{ x: 0 }}
                  transition={{ type: "spring", stiffness: 600 }} >
                  {session?.selectionMode ? t('stop_selecting') : t('start_selecting')}
                </motion.div>
              </Button>
            </Box>
            <Box mt={2} width="100%" sx={selectedPointsTitleStyles}>
              {!session?.selectedPoints || session.selectedPoints.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  {t('no_points_selected')}
                </Typography>
              ) : (
                <Container fixed sx={pointsContainerStyles(isDarkMode)}>
                  {session.selectedPoints
                    .map((pt) => {
                      if (selection === "free") return pt;
                      const isSpecial = (p) =>
                        bandData?.special_point_indices &&
                        Object.values(bandData.special_point_indices).includes(p.k_point_index);
                      if (Array.isArray(pt)) {
                        const filtered = pt.filter(isSpecial);
                        return filtered.length > 0 ? filtered : null;
                      } else {
                        return isSpecial(pt) ? pt : null;
                      }
                    })
                    .filter(Boolean)
                    .map((pt, idx) => {
                      const indexToLabel = Object.entries(bandData?.special_point_indices || {}).reduce(
                        (acc, [label, index]) => {
                          acc[index] = label;
                          return acc;
                        },
                        {}
                      );
                      const getLabeledKey = (rawLabel, spin, kIndex) => {
                        const label = rawLabel === "G" ? "Γ" : rawLabel;
                        const spinPart = bandData?.is_spin_polarized ? `_${spin === "up" ? "u" : "d"}` : "";
                        return `${label}${spinPart}`;
                      };

                      let content = {};
                      const rawPoints = Array.isArray(pt) ? pt : [pt];

                      rawPoints.forEach((p) => {
                        const spin = p.spin || "up";
                        let rawLabel = indexToLabel[p.k_point_index];
                        if (!rawLabel && selection === "free") {
                          const specialIndices = bandData?.special_point_indices || {};
                          const { nearestLabel } = findNearestSpecialIndex(
                            p.band_index,
                            p.k_point_coord,
                            specialIndices,
                            pts_coord,
                            bandData?.is_spin_polarized ? bandData.energies[spin] : bandData.energies,
                            numBands
                          );
                          rawLabel = nearestLabel || "k";
                        }

                        const label = getLabeledKey(rawLabel || "k", spin, p.k_point_index);
                        const bandIdx = p.band_index - (bandData?.val_n || 0);
                        if (exportFormat === "k_point_coord") {
                          const coordKey = `[${p.k_point_coord.map((v) => v.toFixed(6)).join(", ")}]`;
                          content[coordKey] = bandIdx;
                        } else {
                          if (!content[label]) content[label] = [];
                          content[label].push(bandIdx);
                        }
                      });

                      return (
                        <Card
                          key={idx}
                          sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 2, position: "relative", ...pointsBoxStyles(isDarkMode) }}
                        >
                          <IconButton
                            onClick={() => removeSelectedPoint(idx)}
                            sx={{ position: "absolute", top: 8, right: 8 }}
                            color="error"
                            size="small"
                          >
                            <Trash size={16} />
                          </IconButton>

                          <Grid container spacing={1}>
                            {Object.entries(content).map(([key, value]) => (
                              <Grid item xs={6} key={key}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontFamily: "monospace", fontSize: "0.65rem" }}
                                >
                                  <strong style={{ fontSize: "0.7rem" }}>{key}</strong>:{" "}
                                  {Array.isArray(value) ? `[${value.join(", ")}]` : value}
                                </Typography>
                              </Grid>
                            ))}
                          </Grid>
                        </Card>
                      );
                    })}
                </Container>

              )}
            </Box>
            <Box mt={2} mb={2}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                mt={2}
                flexWrap="wrap"
                useFlexGap
              >
                <Box sx={{ minWidth: 160 }}>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem", mb: 0.5 }}>
                    {t("export_format")}
                  </Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    variant="outlined"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    <MenuItem sx={{fontSize: "0.75rem"}} value="k_point_coord">{t('k_point_coord')}</MenuItem>
                    <MenuItem sx={{fontSize: "0.75rem"}} value="k_point_index">{t('k_point_index')}</MenuItem>
                  </Select>
                </Box>

                <Box sx={{ minWidth: 160 }}>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem", mb: 0.5 }}>
                    {t("selection_mode")}
                  </Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={selectionType}
                    onChange={(e) => {
                      setSelectionType(e.target.value);
                      setPairBuffer([]);
                    }}
                    sx={{ fontSize: "0.75rem" }}
                  >
                    <MenuItem sx={{fontSize: "0.75rem"}} value="single">{t("single_point")}</MenuItem>
                    <MenuItem sx={{fontSize: "0.75rem"}} value="pair">{t("pair_of_points")}</MenuItem>
                  </Select>
                </Box>

                <Box sx={{ minWidth: 160 }}>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem", mb: 0.5 }}>
                    {t("point_selection")}
                  </Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={selection}
                    onChange={(e) => setSelection(e.target.value)}
                    variant="outlined"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    <MenuItem sx={{fontSize: "0.75rem"}} value="snap">{t("snap")}</MenuItem>
                    <MenuItem sx={{fontSize: "0.75rem"}} value="free">{t("free")}</MenuItem>
                  </Select>
                </Box>
              </Stack>

            </Box>
            <BandPlotToolbar
              onCopy={handleCopy}
              onDownload={handleDownload}
              onClearAll={() => setConfirmClearDialogOpen(true)}
              onEndSession={() => setConfirmDialogOpen(true)}
              isDarkMode={isDarkMode} />
          </Box>
        </Paper>
      </Box>
      {/* End Session Dialog */}
      <PlotDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleEndSession}
        title={t('end_session')}
        content={t('confirm_end_session')}
        confirmLabel={t('end_session')}
        cancelLabel={t('cancel')}
        confirmColor="error" />
      {/* Clear Points Dialog */}
      <PlotDialog
        open={confirmClearDialogOpen}
        onClose={() => setConfirmClearDialogOpen(false)}
        onConfirm={handleClearAll}
        title={t('clear_all_points')}
        content={t('delete_all_points_confirm')}
        confirmLabel={t('clear_all')}
        confirmColor="success" />
      <Box display="flex" justifyContent="center" mt={8} mb={2}>
        <Button variant="outlined" size="large" color="secondary" startIcon={<Save size={16}/>} onClick={() => { setNoteDialogOpen(true); }} sx={saveUpdateBoxStyles}>
          {t('save_session')}
        </Button>
      </Box>
      {/* Session Notes Dialog */}
      <NoteDialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        onSave={handleSaveOrUpdate}
        sessionNotes={sessionNotes}
        setSessionNotes={setSessionNotes}
        atom={atom}
        setAtom={setAtom}
        author={author}
        setAuthor={setAuthor}
        theme={theme} />
      <InvalidDataDialog
        open={invalidDataDialogOpen}
        onClose={() => setInvalidDataDialogOpen(false)}
        onAcknowledge={() => {
          setInvalidDataDialogOpen(false);
          endSession();
        }} />
    </>
  );
};

export default React.memo(BandPlot);
