import { useRef, useCallback, useState } from 'react';
import { Stack, Box } from '@mui/system';
import { Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { UploadCloud } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { uploadBandstructure } from '../../api/ValidationApi';
import { parseBandFile } from '../../api/ParseApi';
import { useSnackbar } from "notistack";
import FileDisplay from '../../utils/FileDisplay';
import { dropzoneStyles } from '../../styles/shared.styles';
import { useLanguage } from '../../context/LanguageContext';
import { handleApiError } from '../../utils/errorHandler'

function JsonUpload({ onUpload }) {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const { setBandData, bandData, setJobId, setBandFileName, bandFileName, endSession } = useSession();
  const { enqueueSnackbar } = useSnackbar();
  const [isDragging, setIsDragging] = useState(false);
  const { t, tWithHtml } = useLanguage();


  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.json')) {
      enqueueSnackbar(t('please_upload_valid_json_file'), { variant: "warning" });
      return;
    }

    setBandFileName(file.name);

    try {
      const parsedData = await parseBandFile(file);


      setBandData({
        ...parsedData,
        bandFileName: file.name,
      });
      if (onUpload) onUpload(parsedData);

      const response = await uploadBandstructure(file);
      setJobId(response?.job_id);
      enqueueSnackbar(t('file_uploaded_successfully'), { variant: "success" });

    } catch (error) {
      handleApiError(error, enqueueSnackbar, {
        network: t('you_appear_to_be_offline'),
        unknown: t('unexpected_issue'),
        statusMessages: {
          400: t('invalid_or_missing_data'),
          404: t('endpoint_not_found:'),
          500: t('internal_server_error'),
        },
      });
    }
  };

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file) await handleFile(file);
    event.target.value = null;
  }, []);

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) await handleFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };
  const handleRemoveFile = () => {
    setBandFileName(null);
    setBandData(null);
    endSession();
  };

  return (
    <Stack spacing={2} alignItems="center">
      {(bandFileName || bandData?.bandFileName) ? (
        <FileDisplay
          name={bandFileName || bandData?.bandFileName}
          onRemove={handleRemoveFile}
        />
      ) : (
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={dropzoneStyles(isDragging, theme)}
        >
          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.675rem' } }} gutterBottom>
            {tWithHtml('upload_instructions')}

          </Typography>

          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadCloud size={16} />}
            sx={{
              mt: 1,
              px: 1.5,
              py: 0.75,
              height: 40,
              minWidth: 100,
              borderRadius: 1.5,
              fontWeight: '600',
              fontSize: '0.65rem',
              letterSpacing: 0.5,
              boxShadow: "none",
              transition: "transform 0.2s ease",
              "&:hover": {
                boxShadow: "none",
                transform: "scale(1.02)", // subtle scale
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              },
            }}
          >
            {t('band_structure')}
            <input
              type="file"
              hidden
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileUpload}
              data-testid="file-input"
            />
          </Button>

        </Box>
      )}
    </Stack>
  );
}

export default JsonUpload;
