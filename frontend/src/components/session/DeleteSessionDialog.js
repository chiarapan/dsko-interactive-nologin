import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function DeleteSessionDialog({ open, onClose, onConfirm }) {
  const handleCancel = () => onClose();
  const handleConfirm = () => onConfirm();
  const { t } = useLanguage();

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, px: 2 },
      }}
    >
      <DialogTitle
        id="delete-dialog-title"
        sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "1.2rem" }}
      >
        <AlertTriangle color="#d32f2f" size={18} />
        {t('delete_session')}
      </DialogTitle>

      <DialogContent dividers>
        <Typography
          id="delete-dialog-description"
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: "0.75rem"}}
        >
          {t('confirm_delete_session_text')}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button sx={{ fontSize: "0.75rem"}} onClick={handleCancel} variant="outlined" fullWidth>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          fullWidth
          sx={{ fontSize: "0.75rem"}}
        >
          {t('delete_permanently')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
