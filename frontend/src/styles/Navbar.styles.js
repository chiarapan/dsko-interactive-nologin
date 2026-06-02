const getBlurredBg = (theme, light, dark) =>
  theme.palette.mode === "light" ? light : dark;

export const appbarStyles = (theme) => ({
  backgroundColor: getBlurredBg(theme, "rgba(225, 223, 233, 0.9)", "rgba(20,20,20,0.9)"),
  backdropFilter: "blur(3px)",
  WebkitBackdropFilter: "blur(3px)",
  borderBottom: `1px solid ${theme.palette.divider}`,
  height: { xs: 42, md: 46 }, // even smaller
});

export const toolbarStyles = (theme) => ({
  justifyContent: "space-between",
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  minHeight: { xs: 44, md: 48 }, // minimal height
});

export const titleStyles = (theme) => ({
  color: theme.palette.text.primary,
  textDecoration: "none",
  background: "linear-gradient(90deg,rgb(66, 75, 73),rgb(100, 140, 149))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  fontWeight: 500,
  fontSize: { xs: "1rem", md: "1rem" }, // very compact
  letterSpacing: "-0.15px",
  transition: "color 0.2s ease",
  "&:hover": {
    color: "#000000",
  },
});

export const tabsNavStyles = {
  minHeight: 44,
};

export const tabStyles = (location, item) => ({
  fontSize: { xs: "0.8rem", md: "0.85rem" }, // smallest legible
  fontWeight: location.pathname === item.path ? 600 : 400,
  textTransform: "none",
  padding: { xs: "4px 4px 2px", md: "8px 8px 4px" }, // ultra-tight
  minHeight: { xs: 30, md: 38 },
});
