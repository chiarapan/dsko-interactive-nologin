import React from 'react';
import { Box, Typography, Select, MenuItem, TextField } from '@mui/material';

function FilterControls({
  threshold,
  setThreshold,
  maxThreshold,
  setMaxThreshold,
  filterMode,
  setFilterMode
}) {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: "0.75rem" }}>Filter:</Typography>
        <Select
          size="small"
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value)}
          sx={{ minWidth: 140, fontSize: "0.75rem" }}
        >
          <MenuItem sx={{ fontSize: "0.75rem" }} value="all">{`|ρ| ∈ [${threshold}, ${maxThreshold}]`}</MenuItem>
          <MenuItem sx={{ fontSize: "0.75rem" }} value="strong">strong (|ρ| ≥ 0.8)</MenuItem>
          <MenuItem sx={{ fontSize: "0.75rem" }} value="moderate">{`moderate (0.2 ≤ |ρ| < 0.8)`}</MenuItem>
          <MenuItem sx={{ fontSize: "0.75rem" }} value="weak">{`weak (|ρ| < 0.2)`}</MenuItem>
        </Select>
      </Box>
    </Box>
  );
}

export default FilterControls;
