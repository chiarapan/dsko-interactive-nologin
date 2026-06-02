export const convergenceContainerStyling = () => (
  {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", 
    alignItems: "center",     
    px: 2,
    pt: 6,
    pb: 8,
  }
)

export const numParStyles = (theme) => ({
  width: '100%',
  maxWidth: 320,
  height: 160,
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: 4,
  p: 4,
  backgroundColor:
    theme.palette.mode === 'dark' ? '#121212' : '#fafafa',
  transition: 'background-color 0.2s ease',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
});

export const infoBoxStyles = (isDark) => ({
  backgroundColor: isDark ? '#1e1e1e' : '#f0f8ff',
  borderRadius: 2,
  border: `1px solid ${isDark ? '#616161' : '#90caf9'}`,
  padding: 2,
  marginTop: 3,
  maxWidth: 700,
  marginX: 'auto',
  color: isDark ? '#e0e0e0' : 'inherit',
  boxShadow: isDark
    ? 'inset 0 0 12px rgba(0,0,0,0.5)'
    : 'inset 0 0 8px rgba(0,0,0,0.08)',
});

export const featureBarChartBoxStyles = (isDark, dynamicHeight, maxHeight) => ({
  borderRadius: 2,
  overflowY: dynamicHeight > maxHeight ? 'auto' : 'visible',
  width: '90%',
  height: Math.max(dynamicHeight, 300),
  maxHeight: maxHeight,
  marginX: 'auto',
  background: isDark
    ? 'linear-gradient(145deg, #1a1a1a, #202020)'
    : 'linear-gradient(145deg, #ffffff, #e6e6e6)',
  boxShadow: isDark
    ? 'inset 2px 2px 4px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(50,50,50,0.3)'
    : 'inset 2px 2px 4px rgba(190,190,190,0.5), inset -2px -2px 4px rgba(255,255,255,0.7)',
  padding: 2,
});


export const ConvPlotPaperStyles = (theme) => ({
  p: 4,
  width: "100%",
  maxWidth: "1200px",       
  mx: "auto",               
  mt: 8,
  mb: 10,
  borderRadius: 8,
  border: `2px dashed ${theme.palette.primary.main}`,
  background: theme.palette.mode === "dark"
    ? "linear-gradient(135deg, #2e2e2e, #393939)"
    : "linear-gradient(135deg, #ffffff, #f5f7fa)",
  boxShadow: theme.palette.mode === "dark"
    ? "0 8px 32px rgba(0, 0, 0, 0.4)"
    : "0 8px 32px rgba(0, 0, 0, 0.12)",
  transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
  cursor: "pointer",
  "&:hover": {
    boxShadow: theme.palette.mode === "dark"
      ? "0 12px 36px rgba(0, 0, 0, 0.5)"
      : "0 12px 36px rgba(0, 0, 0, 0.15)",
    borderColor: theme.palette.secondary.main,
  },
});

export const csvUploadButtonStyles = {
  borderColor: 'primary.dark',
  color: 'primary.dark',
  textTransform: 'none',
  borderRadius: 4,
  paddingX: 2,
  paddingY: 2,
  fontSize: '0.8rem',
  lineHeight: 1.3,
  minHeight: 64,
  justifyContent: 'center',
  textAlign: 'center',
  '&:hover': {
    borderColor: 'primary.main',
    backgroundColor: 'rgba(76, 175, 80, 0.04)',
  },
};

export const convergencePlotBoxStyles = (isDark) => ({
  width: '100%',
  height: '500px',
  padding: 2,
  borderRadius: 2,
  backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5',
  boxShadow: isDark
    ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.6), inset -4px -4px 8px rgba(60, 60, 60, 0.3)'
    : 'inset 4px 4px 8px rgba(200, 200, 200, 0.8), inset -4px -4px 8px rgba(255, 255, 255, 0.6)',
});

export const gifDownloadButtonStyles = {
  paddingX: 2.5,
  paddingY: 1.1,
  fontSize: '0.85rem',
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 600,
  minWidth: 70,
  boxShadow: '0 2px 6px rgba(25, 118, 210, 0.15)',
  borderColor: 'primary.main',
  color: 'primary.main',
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.04)',
    borderColor: 'primary.dark',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
  },
  '&:active': {
    transform: 'scale(0.98)',
    boxShadow: '0 2px 6px rgba(25, 118, 210, 0.1)',
  },
};

export const correlationPlotBoxStyles = (isDark, height) => ({
  position: 'relative',
  width: '100%',
  minHeight: height ?? 250, 
  minWidth: 150,
  borderRadius: 2,
  overflow: 'hidden',
  backgroundColor: isDark ? '#1b1b1b' : '#f0f0f0',
  boxShadow: isDark
    ? 'inset 0 0 15px rgba(0,0,0,0.7)'
    : 'inset 0 0 15px rgba(150,150,150,0.3)',
  padding: 2,
  marginX: 'auto',
});

