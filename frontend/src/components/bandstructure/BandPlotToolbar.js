import { Box, Button, Stack } from "@mui/material";
import { selectMenuStyles, copyStyles, downloadStyles, clearStyles, endSessionStyles } from "../../styles/BandPlot.styles"; 
import { Copy as CopyIcon, Download as DownloadIcon, Trash2 as DeleteIcon, RefreshCcw as ResetIcon } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const BandPlotToolbar = ({
 
  onCopy,
  onDownload,
  onClearAll,
  onEndSession,
  isDarkMode
 
}) => {
  const { t } = useLanguage()
  return (

     <Stack
              spacing={2}
              justifyContent="center"
              alignItems="center"
              sx={selectMenuStyles(isDarkMode)}
            >

              <Box mt={3} display="flex" justifyContent="center" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon size={16} />}
                  onClick={onCopy}
                  sx={copyStyles}
                >
                  {t('copy_yaml')}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon size={16} />}
                  onClick={onDownload}
                  sx={downloadStyles}
                >
                  {t('download_yaml')}
                </Button>

                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<DeleteIcon size={16} />}
                  onClick={onClearAll}
                  sx={clearStyles}
                >
                  {t('clear_all_points')}
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  startIcon={<ResetIcon size={16}/>}
                  onClick={onEndSession}
                  sx={endSessionStyles}
                >
                  {t('end_session')}
                </Button>
              </Box>
            </Stack>
   
  );
};

export default BandPlotToolbar;
