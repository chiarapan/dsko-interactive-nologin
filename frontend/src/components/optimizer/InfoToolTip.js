import { useState } from 'react';
import {
  IconButton,
  Tabs,
  Tab,
  Box,
  Typography,
  Popover
} from '@mui/material';
import { Info } from 'lucide-react';

function InfoTooltip({ tabs }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <Info size={16} />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { p: 2 } }}
      >
        <Tabs
          value={tabIndex}
          onChange={(e, v) => setTabIndex(v)}
          variant="standard"
          textColor="primary"
          indicatorColor="primary"
        >
          {tabs.map((tab, i) => (
            <Tab key={i} label={tab.label} size="small" sx={{ fontSize: '0.75rem', minHeight: 32, px: 1 }} />
          ))}
        </Tabs>
        <Box mt={2} sx={{ fontSize: "0.9rem" }}>
          {tabs[tabIndex]?.content}
        </Box>

      </Popover>
    </>
  );
}

export default InfoTooltip;
