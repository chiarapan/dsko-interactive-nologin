export const dialogSaveStyles = () => ({
  "& .MuiDialog-paper": {
    width: "100%",
    maxWidth: "600px", // instead of 800px
    margin: "0 auto",
  },
});


export const textfieldDialogStyles = () => (
  { mb: 2 }
)

export const dividerStyles = () => ({
  marginY: 1,
  borderColor: "#ced4da",
  borderWidth: 1,
});

export const dialogPaperStyles = (theme) => ({
  borderRadius: 4,
  boxShadow: theme.shadows[8],
  px: 2,
  py: 1.5,
});


export const iconStyles = (theme) => ({
  marginRight: 10,
  color: theme.palette.warning.main,
});

export const dialogTitleStyles = (theme) => ({
  padding: 0,
  fontWeight: 600,
  fontSize: "1rem",
  color: theme.palette.text.primary,
});

export const contentTextStyles = {
  px: 0,
};

export const actionsStyles = {
  px: 0,
  gap: 2,
};

export const cancelButtonStyles = {
  borderRadius: 1,
  textTransform: "none",
  fontWeight: 500,
  minWidth: 150,
};

export const confirmButtonStyles = {
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 600,
  minWidth: 150,
};
