import { Card, CardMedia, CardContent, CardActionArea, Typography, IconButton, Chip, Tooltip, Modal, Box, TextField, Button, Divider } from "@mui/material";
import { useState } from "react";
import { useTheme } from "@mui/system";
import { Trash2 as DeleteIcon, Calendar as CalendarIcon, User as PersonIcon, Tag as TokenIcon, FileText as NoteIcon, Edit3 as EditIcon, X  } from "lucide-react";
import { multilineBoxStyles, modalBoxStyles, sessionCardStyles, cardBoxStyles, cardContentStyles } from "../../styles/Session.styles";
import { useLanguage } from "../../context/LanguageContext";

const cardImage = new URL("../../assets/img-card.webp", import.meta.url).href;

function InfoBlock({ icon, label, value, multiline = false }) {
  const theme = useTheme();
  return (
    <Box display="flex" flexDirection="column" gap={0.5} overflow="hidden">
      <Box display="flex" alignItems="center" gap={1}>
        <Box color="text.secondary">{icon}</Box>
        <Typography sx={{ fontSize: "0.7rem"}} variant="subtitle2" fontWeight={600} color="text.primary">
          {label}
        </Typography>
      </Box>

      <Tooltip title={value}>
        <Box
          sx={multilineBoxStyles(theme, multiline)}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ...(multiline && { whiteSpace: "normal" }),  fontSize: "0.65rem" }}
          >
            {value}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
}

function EditSessionModal({ open, onClose, session, onSave }) {
  const [formData, setFormData] = useState({
    atom: session.atom || "",
    notes: session.notes || "",
    author: session.author || "",
  });
  const { t } = useLanguage();

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    const updated = {
      ...session,
      ...formData,
      updated_at: new Date().toISOString(),
    };
    onSave(updated);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="edit-session-title" closeAfterTransition>
  <Box sx={modalBoxStyles}>
    {/* Header with title and close icon */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography
        id="edit-session-title"
        variant="h5"
        fontWeight={700}
        letterSpacing={0.5}
        color="text.primary"
        sx={{ fontSize: "0.9rem"}}>
        {t("edit_session")}
      </Typography>

      <IconButton onClick={onClose} size="small" aria-label={t("cancel")}>
        <X size={18} />
      </IconButton>
    </Box>

    <Divider sx={{ mb: 4 }} />

    {/* Form Fields */}
    <TextField
      fullWidth
      label={t("elements")}
      value={formData.atom}
      onChange={handleChange("atom")}
      margin="normal"
      variant="outlined"
      InputLabelProps={{ shrink: true }}
    />

    <TextField
      fullWidth
      multiline
      rows={5}
      label={t("notes")}
      value={formData.notes}
      onChange={handleChange("notes")}
      margin="normal"
      variant="outlined"
      InputLabelProps={{ shrink: true }}
    />

    <TextField
      fullWidth
      label={t("author")}
      value={formData.author}
      onChange={handleChange("author")}
      margin="normal"
      variant="outlined"
      InputLabelProps={{ shrink: true }}
    />

    {/* Buttons */}
    <Box
      sx={{
        mt: 5,
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
      }}
    >
      <Button onClick={onClose} color="inherit" sx={{ textTransform: "none", fontSize: "0.75rem" }}>
        {t("cancel")}
      </Button>
      <Button variant="contained" onClick={handleSave} color="primary" sx={{ textTransform: "none", fontSize: "0.75rem" }}>
        {t("save")}
      </Button>
    </Box>
  </Box>
</Modal>


  );
}

// Main SessionCard component
export default function SessionCard({ session, onClick, onDelete, onUpdate }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
    const { t } = useLanguage();


  const [currentSession, setCurrentSession] = useState(session);
  const [isEditOpen, setEditOpen] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete();
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setEditOpen(true);
  };

  const handleSave = (updatedSession) => {
    setCurrentSession(updatedSession);
    if (onUpdate) {
      onUpdate(updatedSession);
    }
  };

  const createdAt = new Date(currentSession.created_at).toLocaleString();
  const updatedAt = new Date(currentSession.updated_at).toLocaleString();

  return (
    <>
      <Card sx={sessionCardStyles(isDark)}>
        <Box sx={cardBoxStyles}>
          <CardMedia
            component="img"
            image={cardImage}
            alt="Session Preview"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
        <Box px={2} pt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1rem" }} noWrap>
            {t('session')} #{currentSession.id}
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title={t('edit_session')}>
              <IconButton onClick={handleEditClick}>
                <EditIcon size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('delete_session')}>
              <IconButton onClick={handleDeleteClick} sx={{ color: theme.palette.error.main }}>
                <DeleteIcon size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
          <CardContent sx={cardContentStyles}>
            <Box display="flex" flexDirection="column" gap={1.5} flexGrow={1}>
              <InfoBlock
                icon={<TokenIcon size={18} />}
                label={t('elements')}
                value={currentSession.atom || t('no_elements_info')}
              />
              <InfoBlock
                icon={<NoteIcon size={18} />}
                label={t('notes')}
                value={currentSession.notes || t('no_notes_available')}
                multiline
              />
              <InfoBlock
                icon={<PersonIcon size={18} />}
                label={t('author')}
                value={currentSession.author || t('no_author_info')}
              />
            </Box>
            <Box
              display="flex"
              gap={1}
              flexWrap="wrap"
              pt={2}
              mt="auto"
              sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
            >
              <Chip
                icon={<CalendarIcon size={16} />}
                label={`${t('created')} ${createdAt}`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  fontSize: "0.75rem",
                }}
              />
              <Chip
                icon={<CalendarIcon size={16} />}
                label={`${t('updated_at')} ${updatedAt}`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: "secondary.main",
                  color: "secondary.main",
                  fontSize: "0.75rem",
                }}
              />
            </Box>
          </CardContent>
        </CardActionArea>

        <EditSessionModal
          open={isEditOpen}
          onClose={() => setEditOpen(false)}
          session={currentSession}
          onSave={handleSave}
        />
      </Card>


    </>
  );
}
