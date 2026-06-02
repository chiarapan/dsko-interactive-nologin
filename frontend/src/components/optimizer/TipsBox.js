import { Box, Typography, Stack, useTheme } from '@mui/material';
import { AlertTriangle, Info,  Lightbulb, XCircle} from 'lucide-react';
import { infoBoxStyles } from '../../styles/Optimizer.styles';

const iconMap = {
  info: <Info size={18} style={{ marginTop: 4 }} color="#1976d2" />, // azul
  warning: <AlertTriangle size={18} style={{ marginTop: 4 }} color="#ed6c02" />, // laranja
  error: <XCircle size={18} style={{ marginTop: 4 }} color="#d32f2f" />, // vermelho
};

function TipsBox({ title, items = [] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={infoBoxStyles(isDark)}>
      <Stack direction="row" spacing={1} alignItems="center" mx={2.5} mb={2} justifyContent="space-between">
        <Typography sx={{fontSize: "0.9rem"}} fontWeight="bold" >{title}</Typography>
        <Lightbulb size={18} color="#1976d2" />
        
    </Stack>

    <Stack spacing={1} component="ul" sx={{ pl: 2, m: 0 }}>
        {items.map((item, i) => (
            <Stack key={i} direction="row" spacing={1.5} component="li">
            <Box >
                {iconMap[item.severity] || iconMap.info}
            </Box>
            <Typography fontSize="0.75rem" component="span">
                {item.text}
            </Typography>
            </Stack>
        ))}
    </Stack>

    </Box>
  );
}

export default TipsBox;
