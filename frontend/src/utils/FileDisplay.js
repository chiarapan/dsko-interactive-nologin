import { Typography, IconButton } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { File, X } from 'lucide-react';

function FileDisplay({ name, onRemove, icon = <File size={20} />, label }) {
  return (
    <Stack spacing={0.5} alignItems="center" sx={{ maxWidth: 320, width: '100%' }}>
      <Box
        sx={{
          px: 1.5,
          py: 1.5,
          minHeight: 60,            
          border: '1px solid',
          borderColor: 'success.main',
          borderRadius: 3,
          color: 'success.main',
          fontSize: '0.7rem',       
          lineHeight: 1.2,
          textAlign: 'center',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          position: 'relative',
          '&:hover': {
            borderColor: 'success.dark',
            backgroundColor: 'rgba(76, 175, 80, 0.06)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {icon}
          <Typography
            component="span"
           sx={{
              fontSize: '0.75rem',  
              fontWeight: 500,
              textTransform: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 220,
            }}
          >
            {label || name}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={onRemove}
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            padding: '2px',
            color: 'success.main',
            '&:hover': {
              color: 'success.dark',
            },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>
    </Stack>
  );
}

export default FileDisplay;
