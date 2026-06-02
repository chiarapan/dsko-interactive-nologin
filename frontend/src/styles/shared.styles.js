const getBoxShadow = (theme, hover = false) =>
  theme.palette.mode === "dark"
    ? hover
      ? "0px 12px 40px rgba(0, 0, 0, 0.4)"
      : "0px 8px 32px rgba(0, 0, 0, 0.3)"
    : hover
      ? "0px 12px 40px rgba(0, 0, 0, 0.2)"
      : "0px 8px 32px rgba(0, 0, 0, 0.15)";



export const dropzoneStyles = (isDragging, theme) => ({
  width: '100%',
  maxWidth: 320,                 
  height: 160,                  
  padding: theme.spacing(2),    
  border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 1.5,  
  textAlign: 'center',
  backgroundColor: isDragging
    ? (theme.palette.mode === 'dark' ? '#1a1a1a' : '#e3f2fd') 
    : (theme.palette.mode === 'dark' ? '#1e1e1e' : '#f9f9f9'),
  transition: 'background-color 0.2s ease, border-color 0.2s ease',
  cursor: 'pointer',
  color: theme.palette.text.primary,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: isDragging ? `0 0 0 3px ${theme.palette.primary.light}` : 'none',
  outline: 'none',
});




export const titleBoxStyles = {
  display: "flex",
  alignItems: "center",
  marginBottom: 2,
};

export const paperUploadStyles = (theme) => ({
  p: 6,
  maxWidth: 1000,
  width: "100%",
  textAlign: "center",
  borderRadius: "16px",
  border: `2px dashed ${theme.palette.primary.main}`,
    display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  boxShadow: theme.palette.mode === 'dark'
    ? 'inset 0 0 12px rgba(255,255,255,0.8)'
    : 'inset 0 0 12px rgba(0,0,0,0.8)', transition: "transform 0.3s ease, box-shadow 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: getBoxShadow(theme, true),
    borderColor: theme.palette.secondary.main,
  },
});


export const pageTitleStyles = () => (
  {
    mt: 8,
    mb: 6,
    fontWeight: 600,
    textAlign: 'center',
    letterSpacing: 1,
    color: 'text.primary',
    fontSize: {
      xs: '1.4rem',
      sm: '1.9rem',
      md: '2.2rem',
    },
  }
)

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

export const titleStyles = (theme) => ({
  color: theme.palette.mode === "dark" ? "#fff" : "#333",
  letterSpacing: "1px",
  fontSize: "1.2rem",
  textTransform: "uppercase",
  fontFamily: "Inter, sans-serif",
  transition: "color 0.3s ease",
  "&:hover": {
    color: theme.palette.primary.main,
  },
});

export const descriptionStyles = {
  maxWidth: 600,
  margin: "0 auto",
  lineHeight: 1.8,
  fontFamily: "Poppins, sans-serif",
  fontSize: "0.75rem",
};