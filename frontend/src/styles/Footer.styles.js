export const footerBoxStyles = (theme) => ({
    mt: 'auto',
    backgroundColor:
      theme.palette.mode === 'light'
        ? '#e1dfe9'
        : theme.palette.background.paper,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderTop: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
    py: { xs: 1, md: 1.5 },
    px: { xs: 1.5, md: 3 },
    textAlign: 'center',
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
  });
  