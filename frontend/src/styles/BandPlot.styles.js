  const responsiveButtonStyles = {
    fontSize: {
      xs: '0.75rem',  // Extra small screens
      sm: '0.8rem',   // Small screens
      md: '0.875rem'  // Medium and up (default)
    },
    padding: {
      xs: '4px 8px',  // Smaller padding on mobile
      sm: '6px 12px', // Medium padding on small screens
      md: '8px 16px'  // Default padding on larger screens
    },
    minWidth: {
      xs: 'auto',     // Remove min-width on mobile
      sm: '80px',     // Small min-width on small screens
      md: '120px'     // Default min-width on larger screens
    },
    '& .MuiButton-startIcon': {
      fontSize: {
        xs: '16px',   // Smaller icons on mobile
        sm: '18px',   // Medium icons on small screens
        md: '20px'    // Default icon size on larger screens
      },
      marginRight: {
        xs: '4px',    // Less margin on mobile
        sm: '6px',    // Medium margin on small screens
        md: '8px'     // Default margin on larger screens
      }
    }
  };
const sharedButtonStyles = {
  padding: "12px 28px",
 ...responsiveButtonStyles,
  borderRadius: "8px",
  fontWeight: 600,
  backgroundColor: "#f5f5f5",
  color: "#333",
  transition: "transform 0.2s ease, box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
    transform: "scale(1.04)",
  },
  "&:active": {
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    transform: "scale(0.98)",
  },
};


export const bandPlotPaperStyles = (theme) => ({
  p: 4,
  width: "100%",
  maxWidth: 1500,
  mt: 8,
  height: 400,
  borderRadius: 4,
  background: theme.palette.mode === "dark"
    ? "linear-gradient(135deg, #2e2e2e, #393939)"
    : "linear-gradient(135deg, #ffffff, #f5f7fa)",
  boxShadow: theme.palette.mode === "dark"
    ? "0 8px 32px rgba(0, 0, 0, 0.4)"
    : "0 8px 32px rgba(0, 0, 0, 0.12)",
  transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.palette.mode === "dark"
      ? "0 12px 36px rgba(0, 0, 0, 0.5)"
      : "0 12px 36px rgba(0, 0, 0, 0.15)",
    borderColor: theme.palette.secondary.main,
  },
});

export const ConvPlotPaperStyles = (theme) => ({
  p: 4,
  width: "100%",
  maxWidth: 1500,
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



export const boxTitleStyles = () => ({
  fontSize: "1.3rem",
  fontWeight: 700,
  mb: 2,
  background: "linear-gradient(90deg, #00c6ff, #0072ff)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  letterSpacing: "0.5px",
  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
});




export const selectionButtonStyles = (session) => ({
  borderRadius: "8px",
  px: 5,
  py: 2,
  mt: 5,
   ...responsiveButtonStyles,
  fontWeight: 500,
  width: 160,
  height: 45,
  fontSize: "0.65rem",
  color: "#fff",
  background: session?.selectionMode
    ? "linear-gradient(135deg,rgb(240, 161, 112),rgb(233, 31, 16))"
    : "linear-gradient(135deg,rgb(205, 226, 194),rgb(12, 152, 61))",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
  transition: "all 0.25s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
  },
  "&:active": {
    transform: "scale(0.97)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  "&:focus": {
    outline: `2px solid ${session?.selectionMode ? "#f44336" : "#00bcd4"}`,
  },
});



export const selectedPointsTitleStyles = () => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});

export const selectedPointsBoxStyles = (theme) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  justifyContent: "center",
  alignItems: "flex-start",
  maxWidth: "100%",
  overflowX: "auto",
  padding: "1rem",
  borderRadius: "8px",
  boxSizing: "border-box",
  backgroundColor: theme.palette.mode === "dark" ? "#2c2c2c" : "#f7f7f7",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
});





export const selectMenuStyles = (isDarkMode) => ({
  flexWrap: "wrap",
  padding: 2,
  backgroundColor: isDarkMode ? "#1e1e1e" : "#f0f4f8",
  borderRadius: 2,
  boxShadow: 2,
});

export const copyStyles = () => ({
  ...sharedButtonStyles,
  boxShadow: "0 4px 20px rgba(76, 175, 80, 0.2)",
  fontSize: "0.75rem"
});

export const downloadStyles = () => ({
  ...sharedButtonStyles,
  border: "2px solid #2196f3",
  color: "#2196f3",
  fontSize: "0.75rem"
});

export const clearStyles = () => ({
  ...sharedButtonStyles,
  border: "2px solidrgb(255, 1, 1)",
  color: "#ff0022",
  borderRadius: "10px",
  fontSize: "0.75rem"
});


export const endSessionStyles = () => ({
  ...sharedButtonStyles,
   ...responsiveButtonStyles,
  color: "#fff",
  background: "linear-gradient(45deg, #ef5350, #e53935)",
  "&:hover": {
    background: "linear-gradient(45deg, #d32f2f, #b71c1c)",
    boxShadow: "0 10px 32px rgba(244, 67, 54, 0.3)",
    transform: "scale(1.05)",
  },
  fontSize: "0.75rem"
});


export const DialogStyles = () => ({
  "& .MuiDialog-paper": {
    width: "600px",
    height: "250px",
  },
});

export const dialogTitleStyles = (theme) => ({
  fontWeight: "700",
  fontSize: "1.4rem",
  textAlign: "left",
  color: theme.palette.mode === "dark" ? "#fafafa" : "#212121",
  padding: "16px 24px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  textTransform: "uppercase",
  letterSpacing: "0.8px",
});



export const dialogContentStyles = () => ({
  fontSize: "1rem",
  fontWeight: 500,
  textAlign: "center",
  color: "#555",
  padding: "24px 16px",
  lineHeight: 1.6,
  backgroundColor: "#fdfdfd",
});


export const dialogClearStyles = () => ({
  "& .MuiDialog-paper": {
    width: "500px",
    height: "250px",
  },
});

export const dialogTitleClearStyles = (theme) => ({
  fontWeight: "500",
  fontSize: "1.25rem",
  textAlign: "left",
  color: theme.palette.mode === "dark" ? "#fff" : "#333",
  paddingBottom: 2,
  paddingLeft: 3,
  borderBottom: "1px solid #e0e0e0",
  backgroundColor: "transparent",
  letterSpacing: "0.5px",
  boxShadow: "none",
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  textTransform: "uppercase",
  transition: "color 0.2s ease, background-color 0.2s ease",
});

export const dialogContetnClearStyles = () => ({
  fontSize: "1.125rem",
  fontWeight: 500,
  textAlign: "center",
  color: "#6c757d",
  marginTop: 5,
  marginBottom: 2,
  lineHeight: 1.5,
  letterSpacing: 0.5,
  textShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    transition: "all 0.3s ease",
  },
});

export const dialogActionClearStyles = () => ({
  backgroundColor: "#f5f5f5",
  color: "#333",
  fontWeight: "600",
  borderRadius: "8px",
  padding: "8px 16px",
  textTransform: "none",
  fontSize: {
    xs: "0.5rem",
    sm: "0.6rem",
    md: "0.875rem",
  },
  "&:hover": {
    backgroundColor: "#e0e0e0",
    cursor: "pointer",
  },
  transition: "background-color 0.3s ease",
});

export const clearAllBoxStyles = () => ({
   ...responsiveButtonStyles,
  backgroundColor: "#00ff55",
  color: "#fff",
  fontWeight: "600",
  borderRadius: "8px",
  padding: "8px 16px",
  textTransform: "none",
  fontSize: {
    xs: "0.5rem",
    sm: "0.6rem",
    md: "0.875rem",
  },
  "&:hover": {
    backgroundColor: "#e68900",
    cursor: "pointer",
  },
  transition: "background-color 0.3s ease",
});

export const saveUpdateBoxStyles = () => ({
   ...responsiveButtonStyles,
  fontSize: "0.75rem",
  padding: "12px 24px",
  marginLeft: 3,
  boxShadow: "0 4px 20px rgba(156, 39, 176, 0.2)",
  "&:hover": {
    boxShadow: "0 8px 30px rgba(156, 39, 176, 0.3)",
    transform: "scale(1.05)",
  },
});







export const pointsBoxStyles = (isDarkMode) => ({

  position: 'relative',
  backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
  border: `1px solid ${isDarkMode ? '#444' : '#ccc'}`,
  borderRadius: 2,
  padding: 2,
  mb: 2,
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  width: '100%',
  maxHeight: '450px',
  maxWidth: '1100px',
  overflowX: 'auto',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',

})

export const pointsContainerStyles = (isDarkMode) => (
  {
    maxHeight: '470px',
    minWidth: '900px',
    overflowY: 'auto',
    p: 4,
    backgroundColor: isDarkMode ? '#1e1e1e' : '#f0f4f8',
    border: `1px solid ${isDarkMode ? '#444' : '#ccc'}`,
    borderRadius: 2,
boxShadow: isDarkMode
      ? 'inset 0 0 12px rgba(255, 255, 255, 0.8)'  
      : 'inset 0 0 12px rgba(0, 0, 0, 0.8)', 
  }
)

export const pointsAlignementStyles = (isDarkMode) => (
  {
    position: 'absolute',
    top: 8,
    right: 8,
    cursor: 'pointer',
    color: isDarkMode ? '#f88' : '#d00',
    '&:hover': { opacity: 0.7 },
  }
)

export const alertStyles = (theme) => ({

                fontSize: "1rem",
                borderRadius: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#2a2a2d" : "#fff3f3",
                border: "1px solid",
                borderColor: (theme) =>
                  theme.palette.mode === "dark" ? "#f44336" : "#fddede",
                py: 2,
                px: 3,
              }
            )

export const alertButtonStyles = () => (
  {
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1,
                boxShadow: 2,
              }
)