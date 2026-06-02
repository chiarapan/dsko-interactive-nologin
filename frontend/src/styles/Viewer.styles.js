
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


export const tabPaperStyles = (theme) => ({
  width: "100%",
  maxWidth: 1000,
  mt: 18,
  borderRadius: 2,
  backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fafafa",
  boxShadow: theme.palette.mode === 'dark'
    ? 'inset 0 0 12px rgba(255,255,255,0.8)'
    : 'inset 0 0 12px rgba(0,0,0,0.8)',
  "&:hover": {
    boxShadow: theme.shadows[5],
  },
});


export const tabsViewStyles = (theme) => ({
  border: `1px dashed ${theme.palette.primary.main}`,
  borderRadius: 2,
  pt: 1,
  pb: 1,
  maxWidth: "100%",
  overflowX: "auto",

  ".MuiTabs-flexContainer": {
    gap: 0.5,
    px: 0.5,
    justifyContent: "center",
    borderBottom: "none",
    color: theme.palette.text.primary,
    flexWrap: "wrap", 
  },

  ".MuiTab-root": {
    textTransform: "uppercase",
    fontSize: "0.6rem", 
    fontWeight: 500,
    borderRadius: "2px",
    py: "6px",
    px: "12px",
    minHeight: "36px", 
    color:
      theme.palette.mode === "dark"
        ? theme.palette.grey[300]
        : theme.palette.text.secondary,
    transition: "background-color 0.25s ease",
    lineHeight: 1.2,

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      color:
        theme.palette.mode === "dark"
          ? theme.palette.grey[100]
          : theme.palette.text.primary,
    },
  },

  ".Mui-selected": {
    fontWeight: 700,
    transform: "scale(1.01)",
  },
});

export const instructionsStyles = (theme) => (
  {
    mt: 4,
    p: 3,
    borderRadius: 2,
    mb: 8,
    backgroundColor: theme.palette.mode === "dark" ? "#363636" : "#e7f3fb",
    color: "#000000",
    maxWidth: "900px",
    width: "100%",
    border: `1px solid white`,
  }
)

export const instructionsTabStyles  = (theme) => ({
  mb: 2,
  borderBottom: "1px solid",
  borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "divider",
  minHeight: 32,
  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 400,
    fontSize: "0.8rem",
    minHeight: 32,
    padding: "4px 8px",
    color: theme.palette.mode === "dark" ? "#fff" : "#333",
    "&.Mui-selected": {
      color: theme.palette.mode === "dark" ? "#fff" : "#000",
      fontWeight: 600,
    },
    "&:hover": {
      color: theme.palette.mode === "dark" ? "#fff" : "#000",
      backgroundColor:
        theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
    },
  },
});
