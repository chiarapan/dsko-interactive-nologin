
import { useState } from "react";

import { Box, TextField, Button } from "@mui/material";
import { useLanguage } from "../../context/LanguageContext";

const InputControls = ({
  isDarkMode,
  onInputSubmit,
  onReset,
  outputValue,
}) => {

  const [inputValue, setInputValue] = useState("");
  const { t } = useLanguage();


  const handleSubmit = () => {
    if (onInputSubmit) onInputSubmit(inputValue);
  };

  const handleReset = () => {
    if (onReset) onReset(inputValue);
  };

return (
  <Box
    mt={2}
    px={1.5}
    py={2}
    borderRadius={2}
    bgcolor={isDarkMode ? "#2a2a2a" : "#f5f5f5"}
    width="100%"
    maxWidth="500px"
    mx="auto"
    boxShadow={
      isDarkMode
        ? "0 0 6px rgba(255,255,255,0.15)"
        : "0 0 6px rgba(0,0,0,0.08)"
    }
  >
    <Box
      display="flex"
      gap={1.5}
      alignItems="center"
      flexWrap="wrap"
      justifyContent="center"
    >
      <TextField
        size="small"
        label={t("number_of_valence_electrons")}
        variant="outlined"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        sx={{
          flex: 1,
          minWidth: 140,
          fontSize: "0.75rem",
          '& .MuiInputBase-input': {
            fontSize: "0.75rem",
          },
          '& .MuiInputLabel-root': {
            fontSize: "0.75rem",
          },
        }}
        InputLabelProps={{ shrink: true }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{
          minWidth: 80,
          padding: "4px 10px",
          textTransform: "none",
          fontSize: "0.7rem",
          lineHeight: 1.2,
        }}
      >
        {t("submit")}
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleReset}
        sx={{
          minWidth: 80,
          padding: "4px 10px",
          textTransform: "none",
          fontSize: "0.7rem",
          lineHeight: 1.2,
        }}
      >
        {t("reset")}
      </Button>
    </Box>

    <Box mt={2} width="100%">
  <TextField
    fullWidth
    label={t("default_valence_electrons")}
    value={outputValue ?? 0}
    variant="filled"
    InputLabelProps={{ shrink: true }}
    InputProps={{
      readOnly: true,
      sx: {
        fontSize: "0.75rem",
        height: "36px", // or 32px — adjust to taste
        padding: "0 12px",
      },
    }}
    sx={{
      '& .MuiInputLabel-root': {
        fontSize: "0.75rem",
        top: "-4px", // move label up slightly if needed
      },
      '& .MuiFilledInput-root': {
        borderRadius: "6px",
        minHeight: "36px", // enforce smaller height
      },
    }}
  />
</Box>

  </Box>
);

};

export default InputControls;
