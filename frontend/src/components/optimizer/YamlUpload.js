import React, { useRef } from 'react';
import { Button, Typography} from '@mui/material';
import { Stack } from '@mui/system';
import { UploadCloud } from 'lucide-react';

function YamlUpload({ onUpload }) {
  const fileInputRef = useRef(null);

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      onUpload({ content: text, name: file.name });
    };

    reader.readAsText(file);
  };

  return (
    <Stack spacing={1} alignItems="center">
      <Button
          variant="outlined"
          component="label"
          startIcon={<UploadCloud />}
          color="success"
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            textTransform: 'none',
            px: 2,
            py: 2,
            whiteSpace: 'normal',
            maxWidth: 'auto',
            borderRadius: 4,
            fontSize: '0.8rem',  
            lineHeight: 1.3,  
            textAlign: 'center',       
            minHeight: 64,
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'rgba(25, 118, 210, 0.2)' 
            }
          }}
        >
        Upload Configuration
        <input
          type="file"
          hidden
          accept=".yaml,.yml"
          ref={fileInputRef}
          onChange={handleUpload}
        />
      </Button>

      <Typography variant="caption" color="text.secondary">YAML file</Typography>
    </Stack>
  );
  
}

export default YamlUpload;
