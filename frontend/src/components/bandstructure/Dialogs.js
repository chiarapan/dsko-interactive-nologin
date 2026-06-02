import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Divider, Button, Box, useTheme } from '@mui/material';
import { dialogSaveStyles, textfieldDialogStyles, dividerStyles, dialogPaperStyles, iconStyles, dialogTitleStyles, contentTextStyles, actionsStyles, cancelButtonStyles, confirmButtonStyles } from '../../styles/Dialog.styles';
import { useLanguage } from '../../context/LanguageContext';
import { AlertTriangle, X, Check } from 'lucide-react';
import { titleBoxStyles } from '../../styles/shared.styles'

const NoteDialog = ({
  open,
  onClose,
  onSave,
  sessionNotes,
  setSessionNotes,
  atom,
  setAtom,
  author,
  setAuthor,
  isUpdating,
  theme,
}) => {
  const { t } = useLanguage();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          ...dialogSaveStyles,
          maxHeight: '70vh',         
          width: '100%',
          maxWidth: 680,            
          display: 'flex',
          flexDirection: 'column',
          p: 1,                     
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: '0.9rem',
          pb: 0.5,
          color: theme.palette.text.primary,
          px: 1,
        }}
      >
        {isUpdating ? t('update_session') : t('save_session')}
      </DialogTitle>

      <Divider sx={dividerStyles(theme)} />

      <DialogContent sx={{ pt: 1, flexGrow: 1, overflowY: 'auto', px: 1 }}>
        <TextField
          label={t('session_notes')}
          multiline
          rows={3}                  
          fullWidth
          variant="outlined"
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          sx={{ ...textfieldDialogStyles, mb: 1, fontSize: '0.9rem' }}
          InputProps={{ sx: { fontSize: '0.9rem' } }}
        />
        <TextField
          label={t('elements')}
          fullWidth
          variant="outlined"
          value={atom}
          onChange={(e) => setAtom(e.target.value)}
          sx={{ ...textfieldDialogStyles, mb: 1, fontSize: '0.9rem' }}
          InputProps={{ sx: { fontSize: '0.9rem' } }}
        />
        <TextField
          label={t('author')}
          fullWidth
          variant="outlined"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          sx={{ ...textfieldDialogStyles, mb: 1, fontSize: '0.9rem' }}
          InputProps={{ sx: { fontSize: '0.9rem' } }}
        />
      </DialogContent>

      <Divider sx={dividerStyles(theme)} />

      <DialogActions sx={{ px: 1, pb: 1, justifyContent: 'flex-end' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 1,
            minWidth: 80,
            fontSize: '0.85rem',
            py: 0.5,
          }}
        >
          {t('cancel')}
        </Button>
        <Button
          onClick={onSave}
          color="primary"
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1,
            minWidth: 80,
            ml: 1,
            fontSize: '0.9rem',
            py: 0.5,
          }}
        >
          {isUpdating ? t('update') : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


const InvalidDataDialog = ({ open, onClose, onAcknowledge }) => {
  const { t } = useLanguage();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          maxHeight: '60vh',
          maxWidth: 560,
          display: 'flex',
          flexDirection: 'column',
          p: 1,
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1rem', pb: 0.5, px: 1 }}>
        {t('error')}
      </DialogTitle>
      <DialogContent sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
        <Typography color="error" variant="body2" sx={{ mt: 1, fontSize: '0.9rem' }}>
          {t('invalid_band_file')}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 1, pb: 1, justifyContent: 'flex-end' }}>
        <Button
          onClick={onAcknowledge}
          color="primary"
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1,
            minWidth: 70,
            fontSize: '0.85rem',
            py: 0.5,
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PlotDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  content = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'error',
  confirmVariant = 'contained',
  maxWidth = 'sm',
  confirmSize = 'small',
  cancelSize = 'small',
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          ...dialogPaperStyles(theme),
          maxHeight: '70vh',
          maxWidth: 540,
          display: 'flex',
          flexDirection: 'column',
          p: 1,
        }
      }}
    >
      <Box display="flex" flexDirection="column" sx={{ flexGrow: 1 }}>
        <Box sx={titleBoxStyles}>
          <AlertTriangle size={16} style={iconStyles(theme)} />
          <DialogTitle sx={{ ...dialogTitleStyles(theme), fontSize: '1rem', px: 1, py: 0.5 }}>
            {title}
          </DialogTitle>
        </Box>
        <DialogContent sx={{ ...contentTextStyles, flexGrow: 1, overflowY: 'auto', px: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {content}
          </Typography>
        </DialogContent>
        <Divider sx={{ my: 2 }} />
        <DialogActions sx={{ ...actionsStyles, px: 1, pb: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            size={cancelSize}
            fullWidth
            sx={{ ...cancelButtonStyles, fontSize: '0.75rem', py: 0.5 }}
          >
            <X size={16} style={{ marginRight: 6 }} />
            {cancelLabel || t('cancel')}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            color={confirmColor}
            variant={confirmVariant}
            size={confirmSize}
            fullWidth
            sx={{ ...confirmButtonStyles, fontSize: '0.75rem', py: 0.5, ml: 1 }}
          >
            <Check size={16} style={{ marginRight: 6 }} />
            {confirmLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export { NoteDialog, InvalidDataDialog, PlotDialog };
