const getModeColor = (palette, darkValue, lightValue) =>
  palette.mode === "dark" ? darkValue : lightValue;

const baseFlexCenter = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};


export const sessionBoxStyles = {
  minHeight: "100vh",
  ...baseFlexCenter,
  flexDirection: "column",
  width: "100%",
  overflowX: "auto",
};

export const sessionContainerStyles = {
  flexGrow: 1,
  py: 8,
  px: 2,
  margin: "0 auto",
  maxWidth: 1600,
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

export const headerBoxStyles = ({ palette }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  borderRadius: 4,
  mb: 6,
  px: 3,
  py: 4,
  backgroundColor: getModeColor(palette, "#555444", "#fafafa"),
  border: `2px dashed ${palette.primary.main}`,
  boxShadow: getModeColor(
    palette,
    "0 4px 12px rgba(255, 255, 255, 0.15)",
    "0 4px 12px rgba(0, 0, 0, 0.1)"
  ),
  ...baseFlexCenter,
  width: "100%",
  maxWidth: "100%",
  padding: "1.5rem 2rem",
});

export const elementBoxStyles = {
  height: 80,
  width: 80,
  borderRadius: 2,
  boxShadow: 2,
  ...baseFlexCenter,
};

export const titleBoxStyles = ({ palette }) => ({
  fontFamily: '"Helvetica Neue", "Segoe UI", sans-serif',
  letterSpacing: 1,
  color: getModeColor(palette, "#fff", "#111"),
  fontSize:"1.5rem"
});

export const textBoxStyles = ({ palette }) => ({
  mt: 0.5,
  color: getModeColor(palette, "#aaa", "#555"),
  fontSize: "0.75rem"
});



export const cardStyles = (theme) => ({
  width: 420,
  height: 700,
  display: "flex",
  flexDirection: "column",
  borderRadius: 4,
  boxShadow: 3,
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  border: `2px dashed ${theme.palette.primary.main}`,
  backgroundColor: getModeColor(theme, theme.palette.background.paper, "#fefefe"),
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: 6,
  },
});

export const mediaContainerStyles = (theme) => ({
  height: 200,
  backgroundColor: getModeColor(theme, "#2a2a2a", "#f4f4f4"),
  padding: theme.spacing(1),
});

export const cardMediaStyles = {
  objectFit: "contain",
  width: "100%",
  height: "100%",
};

export const contentStyles = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  height: "100%",
  justifyContent: "space-between",
};

export const chipContainerStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  marginTop: 4,
};

export const infoBlockValueStyles = (theme, multiline) => ({
  backgroundColor: getModeColor(theme, theme.palette.grey[900], theme.palette.grey[100]),
  padding: "1.2rem 0.8rem 1.2rem 1.2rem",
  borderRadius: 2,
  border: `1px solid ${theme.palette.divider}`,
  fontSize: "0.9rem",
  color: theme.palette.text.secondary,
  maxHeight: multiline ? 80 : 50,
  overflowY: multiline ? "auto" : "hidden",
  textOverflow: multiline ? "unset" : "ellipsis",
  whiteSpace: multiline ? "normal" : "nowrap",
});

export const multilineBoxStyles = (theme, multiline) => ({
  ...(multiline
    ? {
      height: 100,
      overflowY: "auto",
      p: 1,
      maxWidth: 400,
      borderRadius: 2,
      background:
        theme.palette.mode === "dark"
          ? "linear-gradient(145deg, #2a2a2a, #1e1e1e)"
          : "linear-gradient(145deg, #ffffff, #e0e0e0)",
      boxShadow:
        theme.palette.mode === "dark"
          ? `
                inset 2px 2px 5px rgba(0,0,0,0.9),
                inset -2px -2px 5px rgba(60,60,60,0.6)
              `
          : `
                inset 2px 2px 5px rgba(255,255,255,0.9),
                inset -2px -2px 5px rgba(170,170,170,0.6)
              `,
    }
    : {
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      overflow: "hidden",
    }),
});

export const modalBoxStyles = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
  maxWidth: 480,
  bgcolor: "background.paper",
  borderRadius: 12,                     
  boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 30px",  
  p: 5,
  maxHeight: "85vh",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  outline: "none",
  border: "1px solid #ddd",            
  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
};


export const sessionCardStyles = (isDark) => ({
  height: 520,
  display: "flex",
  flexDirection: "column",
  borderRadius: 4,
  overflow: "hidden",
  background: isDark
    ? "rgba(30, 30, 30, 0.9)"
    : "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: isDark
      ? "0 12px 36px rgba(0,0,0,0.4)"
      : "0 12px 36px rgba(0,0,0,0.1)",
  },
});


export const cardBoxStyles = () => ({
  position: "relative",
  height: 160,
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent 70%)",
  },

});

export const cardContentStyles = () => ({
  p: 3,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 2,
  height: "100%",
  overflow: "hidden",
});