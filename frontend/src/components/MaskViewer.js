import { useState, lazy, Suspense } from "react";
import {
  Box, useTheme, Stack, Typography, CircularProgress, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Tab, Tabs, IconButton
} from "@mui/material";
import { UploadCloud, CheckCircle2, X, Eye } from "lucide-react";
import { uploadStructure, verifyBandStructure } from "../api/ValidationApi";
import { parseStructureFile } from "../api/ParseApi";
import JsonUpload from "./bandstructure/JsonUpload";
import StructureUpload from "./crystalstructure/StructureUpload";
import { titleStyles, descriptionStyles, tabPaperStyles, tabsViewStyles } from "../styles/Viewer.styles";
import { paperUploadStyles, pageTitleStyles } from '../styles/shared.styles';
import Instructions from "./bandstructure/Instructions";
import { useSession } from "../context/SessionContext";
import InputControls from "./bandstructure/InputControls";
import { useLanguage } from "../context/LanguageContext";

const BandPlot = lazy(() => import("./bandstructure/BandPlot"));
const CrystalViewer = lazy(() => import("./crystalstructure/CrystalPlot"));

const Loader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" p={4}>
    <CircularProgress />
  </Box>
);

function MaskViewer() {
  const {
    session,
    startNewSession,
    addSelectedPoint,
    endSession,
    setStructureData,
    setStructureFileName,
    setSelectionMode,
    setBandData,
    jobId,
    setDefaultValenceNumber,
    valenceNumber,
    bandData
  } = useSession();

  const [tabIndex, setTabIndex] = useState(0);
  const [infoVisible, setInfoVisible] = useState(true);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogSuccess, setDialogSuccess] = useState(false);
  const [pendingStructure, setPendingStructure] = useState(null);
  const [bandUploadAttempted, setBandUploadAttempted] = useState(false);
  const [isUploadBoxVisible, setIsUploadBoxVisible] = useState(true);
  const [isLoadingGeoStructure, setIsLoadingGeoStructure] = useState(false);

  const { t, tWithHtml } = useLanguage();




  const handleUpload = (parsedData) => {
    startNewSession(parsedData);
    setStructureData(null);
    setBandUploadAttempted(true);

  };

  const handleStructureUpload = async (file) => {
    if (!file) return;

    setIsLoadingGeoStructure(true);
    await new Promise(r => setTimeout(r, 0));


    setStructureFileName(file.name);

    try {
      const uploadResponse = await uploadStructure(file, jobId);
      if (!uploadResponse.success || !jobId) {
        throw new Error(uploadResponse?.error || "Try uploading band structure first, then geometry.");
      }

      const parsed = await parseStructureFile(file);
      if (!parsed || !Array.isArray(parsed.data?.atoms) || !Array.isArray(parsed.data?.lattice)) {
        throw new Error("Parsed structure must include valid lattice and atoms.");
      }
      setDefaultValenceNumber(parsed?.data.val_n)
     
      const check = await verifyBandStructure(jobId);
      setDialogMessage(check.message || check.error);
      setDialogSuccess(check.success);
      setDialogOpen(true);

      if (check.success) {
        const updatedBandNum = Math.ceil(parsed.data.val_n / 2) - 1;

        setBandData({
          ...session?.bandData,
          default_val_n: parsed?.data.val_n,
          val_n: updatedBandNum

        });

        setPendingStructure({
          ...parsed.data,
          structureFileName: file.name,
        });
      }
      setIsLoadingGeoStructure(false);
    } catch (err) {
      setDialogMessage(err.message);
      setDialogSuccess(false);
      setDialogOpen(true);
      setIsLoadingGeoStructure(false);
    }
  };

  // console.log("structure: ", session?.bandData)

  const handleBandValueUpdate = (newValue) => {
    const parsedValue = parseInt(newValue);
    setBandData({
      ...session?.bandData,
      val_n: Math.ceil(parsedValue / 2) - 1,
    });
    setStructureData({
      ...session?.structureData,
      val_n: parsedValue
    })
  };

  const handleReset = () => {
    setBandData({
      ...session?.bandData,
      val_n: 0,
    });
    setStructureData({
      ...session?.structureData,
      val_n: 0
    })
  };

  const getTranslatedMessage = (msg) => {
    if (!msg) return '';

    if (msg.includes("Mismatch: Special k-points")) {
      return t("structure_band_kpoint_mismatch");
    }
    if (msg.includes("Structure is empty")) {
      return t("structure_empty_or_invalid");
    }
    if (msg.includes("Band structure is empty")) {
      return t("bandstructure_empty");
    }
    if (msg.includes("Both files must be uploaded")) {
      return t("file_missing");
    }
    if (msg.includes("Unsupported extension")) {
      return t("file_not_supported");
    }
    if (msg.includes("Structure and band structure are compatible")) {
      return t("structure_band_compatible");
    }
    if (msg.includes("Try uploading band structure first, then geometry")) {
      return t("upload_band_first");
    }

    return msg;
  };


  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" bgcolor="background.default">
      <Box component="main" flexGrow={1} mt={5} display="flex" flexDirection="column" alignItems="center" >
        <Typography variant="h4" sx={pageTitleStyles}>
          {t('mask_editor')}
        </Typography>
        <Box sx={{ display: isUploadBoxVisible ? 'block' : 'none' }}>

          <Paper elevation={5} sx={paperUploadStyles(theme)}>

            <IconButton
              onClick={() => setIsUploadBoxVisible(false)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <X size={20} />
            </IconButton>
            <Typography variant="h5" fontWeight="bold" mb={3} sx={titleStyles}>
              {tWithHtml('upload_your_band_or_atomic_structure')}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={5} pb={2} sx={descriptionStyles}>
              {tWithHtml('upload_json_or_supported_format')}
            </Typography>
            <Stack spacing={3} direction="row" justifyContent="center" flexWrap="wrap" sx={{ gap: 3 }}>
              <JsonUpload onUpload={handleUpload} />
              <StructureUpload onFileSelect={handleStructureUpload}  isLoading={isLoadingGeoStructure} />
              <InputControls
                isDarkMode={isDarkMode}
                outputValue={session?.bandData?.default_val_n || valenceNumber}
                onInputSubmit={handleBandValueUpdate}
                onReset={handleReset}
              />
            </Stack>
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

        {infoVisible && (session.bandData && session.structureData) && (
          <Instructions theme={theme} setInfoVisible={setInfoVisible} />

        )}

        {(session.bandData && session.structureData) && (
          <Paper elevation={4} sx={tabPaperStyles(theme)}>
            <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} centered sx={tabsViewStyles(theme)}>
              <Tab label={t('band_structure')} />
              <Tab label={t('geometry_structure')} />
            </Tabs>
          </Paper>
        )}

        <Box width="100%" maxWidth="1000px" flexGrow={1}>
          <Suspense fallback={<Loader />}>
            {tabIndex === 0 ? (
              session?.bandData && session?.structureData ? (
                <BandPlot
                  bandData={session.bandData}
                  selectedPoints={session.selectedPoints}
                  setSelectedPoints={(pts) => pts.forEach(addSelectedPoint)}
                  selectionMode={session.selectionMode}
                  setSelectionMode={setSelectionMode}
                />
              ) : session?.bandData ? (
                <Typography textAlign="center" color="text.secondary" mt={2} mb={2}>
                  {t('structure_confirmation_required')}
                </Typography>
              ) : null
            ) : session?.structureData ? (
              <CrystalViewer structure={session.structureData} />
            ) : null}
          </Suspense>


        </Box>
      </Box>

      {/* Dialog for Structure Validation */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            maxWidth: 480,
            maxHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 600,
            fontSize: '0.9rem',
            color: dialogSuccess ? 'success.main' : 'error.main',
            px: 1,
          }}
        >
          {dialogSuccess ? (
            <>
              <CheckCircle2 color="green" size={24} /> {t('valid_structure')}
            </>
          ) : (
            <>
              <UploadCloud color="red" size={24} /> {t('invalidity_detected')}
            </>
          )}
        </DialogTitle>

        <DialogContent
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            px: 1,
            pt: 1,
            pb: 1,
          }}
        >
          <Typography
            variant="body1"
            sx={{ mt: 1, color: dialogSuccess ? 'text.primary' : 'error.dark', fontSize: '0.8rem' }}
          >
            {getTranslatedMessage(dialogMessage)}
          </Typography>
          <Box
            component="pre"
            sx={{
              mt: 2,
              p: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              fontSize: '0.85rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: 150,
              overflowY: 'auto',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography sx={{ fontSize: "0.8rem" }}>{t('number_of_valence_electrons')}: {JSON.stringify(pendingStructure?.val_n, null, 2)}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', m: 2, gap: 1 }}>
          {dialogSuccess ? (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setStructureData(pendingStructure);
                  setPendingStructure(null);
                  setDialogOpen(false);
                }}
                sx={{ borderRadius: 1, fontWeight: 600, width: 140, fontSize: "0.75rem" }}
              >
                {t('confirm')}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setPendingStructure(null);
                  setDialogOpen(false);
                  endSession();
                }}
                sx={{ borderRadius: 1, fontWeight: 600, width: 140, fontSize: "0.75rem" }}
              >
                {t('reject')}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => setDialogOpen(false)}
              color="error"
              sx={{ borderRadius: 1, fontWeight: 600, width: 300, fontSize: "0.75rem" }}
            >
              OK
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default MaskViewer;
