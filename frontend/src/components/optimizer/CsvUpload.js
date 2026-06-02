import  { useRef, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { Stack, Box } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { UploadCloud } from 'lucide-react';
import { dropzoneStyles } from '../../styles/shared.styles';
import { useLanguage } from '../../context/LanguageContext';
import { csvUploadButtonStyles } from '../../styles/Optimizer.styles';



function CsvUpload({ onUpload }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const theme = useTheme();
  const { t, tWithHtml } = useLanguage();

  const handleUpload = (file) => {
    if (!file || !file.name.endsWith('.csv')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      onUpload({ content: e.target.result, name: file.name });
    };
    reader.readAsText(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) handleUpload(file);
    event.target.value = null;
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) handleUpload(file);
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


return (
    <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={dropzoneStyles(isDragging, theme)}

      >
        <Typography variant="body2" color="text.primary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.675rem' } }} gutterBottom>
            {tWithHtml('upload_csv_instruction')}
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
              fontWeight: '600',
              fontSize: '0.65rem', 
              boxShadow: "none",    
              transition: "transform 0.2s ease",
              "&:hover": {
                boxShadow: "none",
                transform: "scale(1.03)",  
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              },
            }}
          >
          {t('upload_simulation_data')}
          <input
            type="file"
            hidden
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ontSize: '0.75rem'}} mt={1}>
            {t('accepted_format_csv')}
        </Typography>
      </Box>
    </Stack>
  );
}

export default CsvUpload;
