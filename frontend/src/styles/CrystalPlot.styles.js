export const titleBoxStyles = {
  fontSize: "1.75rem",
  textAlign: "center",
  background: "linear-gradient(90deg, #00c6ff, #0072ff)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  textShadow: "0 2px 6px rgba(0, 0, 0, 0.5)",
  fontWeight: 700,
  lineHeight: 1.4,
};

export const crystalBoxStyles = (theme) => {
  const isDark = theme.palette.mode === "dark";
  return {
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: 4,
    p: theme.spacing(4),
    background: isDark
      ? "linear-gradient(135deg, #2c2c2c, #3a3a3a)"
      : "linear-gradient(135deg, #ffffff, #f3f6f9)",
    boxShadow: isDark
      ? "0px 8px 32px rgba(0, 0, 0, 0.3)"
      : "0px 8px 32px rgba(0, 0, 0, 0.15)",
    transition: "all 0.3s ease-in-out",
    cursor: "pointer",
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: isDark
        ? "0px 12px 40px rgba(0, 0, 0, 0.4)"
        : "0px 12px 40px rgba(0, 0, 0, 0.2)",
      borderColor: theme.palette.secondary.main,
    },
  };
};

export const plotBoxStyles = ({ palette }) => ({
  width: "100%",
  height: 1000,
  position: "relative",
  padding: 2,
  borderRadius: 3,
  overflow: "hidden",
  background: palette.mode === "dark"
    ? "radial-gradient(circle at center, #1a1a1a 60%, #0f0f0f 100%)"
    : "radial-gradient(circle at center, #ffffff 60%, #f0f0f0 100%)",
  border: `1px solid ${palette.mode === "dark" ? "#333" : "#ccc"}`,
  boxShadow: "0 0 16px rgba(0, 0, 0, 0.1)",
});

export const zoomBoxStyles = {
  position: "absolute",
  top: 16,
  right: 16,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  zIndex: 2,
};
