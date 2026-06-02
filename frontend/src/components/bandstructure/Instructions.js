import React, { useState } from "react";
import { Paper, Box, Typography, IconButton, Tabs, Tab } from "@mui/material";
import { Info, X as CloseIcon } from "lucide-react";
import { instructionsStyles, instructionsTabStyles } from "../../styles/Viewer.styles";
import { useLanguage } from "../../context/LanguageContext";

export default function Instructions({ theme, setInfoVisible }) {
  const [tabIndex, setTabIndex] = useState(0);
  const { t } = useLanguage();

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Paper elevation={4} sx={instructionsStyles(theme)}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Info
          size={18}
          style={{ marginRight: 6 }}
          color={theme.palette.mode === "dark" ? "#ffffff" : "#000000"}
        />
        <Typography
          variant="body1"
          sx={{ fontWeight: 600, color: theme.palette.mode === "dark" ? "#ffffff" : "#000000", fontSize: "1rem", lineHeight: 1.2 }}
        >
          {t('instructions_info')}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={() => setInfoVisible(false)} size="small" sx={{ p: 0.5 }}>
          <CloseIcon
            size={16}
            style={{ color: theme.palette.mode === "dark" ? "#ffffff" : "#000000" }}
          />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{
          sx: {
            backgroundColor:
              theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
            height: "3px",
          },
        }}
        sx={instructionsTabStyles(theme)}
      >
        <Tab label={t('number_of_valence_electrons')} />
        <Tab label={t('plot_interaction')} />
        <Tab label={t('crystalstructure_instructions')} />
      </Tabs>

      {tabIndex === 0 && (
        <>
          {[t('count_atoms_instruction'), t('lookup_valence_instruction'), t(t('multiply_atoms_valence_instruction'))].map((text, i) => (
            <Typography
              key={i}
              variant="body2"
              sx={{ color: theme.palette.mode === "dark" ? "#ffffff" : "#000000", mb: 0.3, fontSize: "0.85rem", lineHeight: 1.3 }}
            >
              {text}
            </Typography>
          ))}
          <Typography
            variant="body2"
            sx={{ color: theme.palette.mode === "dark" ? "#ffffff" : "#000000", fontSize: "0.85rem", lineHeight: 1.3 }}
            dangerouslySetInnerHTML={{ __html: t('valence_example_instruction') }}
          />
        </>
      )}

      {tabIndex === 1 && (
        <>
          {[t('plot_precalc_x_instruction'), t('reset_plot_instruction', { returnObjects: false }), t('update_plot_instruction')].map((text, i) => (
            <Typography
              key={i}
              variant="body2"
              sx={{ color: theme.palette.mode === "dark" ? "#ffffff" : "#000000", mb: 0.3, fontSize: "0.85rem", lineHeight: 1.3 }}
              dangerouslySetInnerHTML={i === 1 ? { __html: text } : undefined}
            >
              {i !== 1 ? text : null}
            </Typography>
          ))}
        </>
      )}

      {tabIndex === 2 && (
        <>
          {[t('periodic_view_instruction_intro'), t('periodic_view_instruction_click_viewing'), t('periodic_view_instruction_modify_supercell')].map((text, i) => (
            <Typography
              key={i}
              variant="body2"
              sx={{ color: theme.palette.mode === "dark" ? "#ffffff" : "#000000", mb: 0.5, fontSize: "0.85rem", lineHeight: 1.3 }}
            >
              {text}
            </Typography>
          ))}
          <Typography
            variant="body2"
            sx={{ color: theme.palette.mode === "dark" ? "#ffffff" : "#000000", fontSize: "0.85rem", lineHeight: 1.3, mt: 0.5 }}
          >
            {t('periodic_view_instruction_confirm_reflect')}
          </Typography>
        </>
      )}
    </Paper>
  );
}
