import { useRef, useState } from 'react';
import { Stack, Box } from '@mui/system';
import { Button, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { UploadCloud } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import FileDisplay from '../../utils/FileDisplay';
import { dropzoneStyles } from '../../styles/shared.styles';
import { useLanguage } from '../../context/LanguageContext';


function StructureUpload({ onFileSelect, isLoading }) {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const { session, setStructureData, endSession } = useSession();
  const [isDragging, setIsDragging] = useState(false);
  const { t, tWithHtml } = useLanguage();


  const fileUploaded = session?.uploads?.structure;
  const structureFileName = session?.structureData?.structureFileName;

  const handleFile = (file) => {
    if (!file) return;
    onFileSelect(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) handleFile(file);
    event.target.value = null;
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
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
    if (setStructureData) setStructureData(null);
    endSession();
  };

  return (
    <Stack spacing={2} alignItems="center">
      {(fileUploaded && structureFileName) ? (
        <FileDisplay
          name={structureFileName}
          onRemove={handleRemoveFile}
        />
      ) : isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={100}
          width={250}
        >
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={dropzoneStyles(isDragging, theme)}
        >
          <Typography
            variant="body2"
            gutterBottom
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.675rem' } }}
          >
            {tWithHtml('geo_upload_instructions')}
          </Typography>

          <Button
            variant="outlined"
            component="label"
            color="primary"
            startIcon={<UploadCloud size={16} />}
            size="small"
            sx={{
              borderRadius: 1.5,
              px: 2,
              py: 0.75,
              height: 40,
              fontWeight: '600',
              fontSize: '0.65rem',
              boxShadow: "none",
              transition: "transform 0.2s ease",
              "&:hover": {
                boxShadow: "none",
                transform: "scale(1.03)",
                backgroundColor: theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
              },
            }}
          >
            {t('geometry_structure')}
            <input
              type="file"
              hidden
              accept=".vasp,.poscar,.xyz,.cif,.traj,.gen"
              ref={fileInputRef}
              onChange={handleFileChange}
              data-testid="file-upload-input"
            />
          </Button>
        </Box>
      )}

    </Stack>
  );
}

export default StructureUpload;
