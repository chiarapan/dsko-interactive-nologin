import { useState } from 'react';
import { MenuItem, Select, ListItemText, Typography, Box } from '@mui/material';
import { useLanguage } from '../../../context/LanguageContext';

function ParameterSelector({
  selectedParams,
  setSelectedParams,
  allParams,
  paramOrder,
  setParamOrder
}) {
  const [resetKey, setResetKey] = useState(0);
  const { t } = useLanguage();

  const handleChange = (e) => {
  const raw = e.target.value;
  const all = paramOrder === 'csv' ? allParams.csv : allParams.abc;

  const isAllSelected =
    all.length > 0 &&
    selectedParams.length === all.length &&
    all.every(p => selectedParams.includes(p));

  if (raw.includes('__ALL__')) {
    const next = isAllSelected ? [] : all;
    setSelectedParams(next);
    return; 
  }

  if (raw.includes('__TOGGLE__')) {
    const newOrder = paramOrder === 'csv' ? 'abc' : 'csv';
    const newAll = allParams[newOrder] || [];
    const intersection = selectedParams.filter(p => newAll.includes(p));
    const next = intersection.length > 0 ? intersection : newAll;
    setParamOrder(newOrder);
    setSelectedParams(next);
    setResetKey(prev => prev + 1);
    return; 
  }
  setSelectedParams(raw);
};


  const all = allParams?.[paramOrder] || [];

  const isAllSelected =
    all.length > 0 &&
    selectedParams.length === all.length &&
    all.every(p => selectedParams.includes(p));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Typography variant="body2" sx={{ mb: 0.5, fontSize: "0.75rem" }}>{t('parameters_label')}</Typography>
      <Select
        key={`${paramOrder}-${resetKey}`}
        multiple
        size="small"
        value={selectedParams}
        onChange={handleChange}
        renderValue={(selected) =>
          selected.length === 0
            ? t('no_parameters_selected')
            : selected.length === all.length
              ? t('all_parameters')
              : `${selected.length} selected`
        }
        sx={{ minWidth: 200, fontSize: "0.75rem" }}
      >
        <MenuItem sx={{ fontSize: "0.75rem" }} value="__ALL__" selected={isAllSelected}>
          <ListItemText sx={{ fontSize: "0.65rem" }} primary={t('all_parameters')}/>
        </MenuItem>
        {all.map((param) => (
          <MenuItem
            sx={{ fontSize: "0.65rem" }}
            key={param}
            value={param}
            selected={selectedParams.includes(param)}
          >
            <ListItemText sx={{ fontSize: "0.75rem" }} primary={param} />
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}

export default ParameterSelector;
