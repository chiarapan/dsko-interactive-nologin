const getModeColor = (theme, darkColor, lightColor) =>
  theme.palette.mode === "dark" ? darkColor : lightColor;

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
