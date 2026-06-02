import React from 'react';
import { Box, Stack, useTheme } from "@mui/system";
import {Typography, Divider} from '@mui/material';
import { footerBoxStyles } from '../styles/Footer.styles';

function Footer() {
  const theme = useTheme();

  return (
    <Box component="footer" sx={footerBoxStyles(theme)} >
      <Divider sx={{ mb: 1, opacity: 0.3 }} />

      <Stack spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary" >
          © {new Date().getFullYear()} Fritz Harber Institute
        </Typography>


      </Stack>
    </Box>
  );
}

export default Footer;
