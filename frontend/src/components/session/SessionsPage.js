import React, { useState, useEffect, useCallback } from "react";
import { Typography, CircularProgress, Pagination } from "@mui/material";
import { Box, useTheme, Grid, Container } from "@mui/system";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { getSessions, loadSessionById, deleteById, updateSession, filterSessions } from "../../api/SessionApi";
import { useSession } from "../../context/SessionContext";
import { headerBoxStyles, sessionBoxStyles, sessionContainerStyles, titleBoxStyles, textBoxStyles, elementBoxStyles } from "../../styles/Session.styles.js";
import { List } from "lucide-react";
import SessionCard from "./SessionCard";
import DeleteSessionDialog from "./DeleteSessionDialog";
import SearchBar from "./Searchbar.js";
import { useLanguage } from "../../context/LanguageContext.js";

const ITEMS_PER_PAGE = 6;

function SessionsPage() {
  const { setBandData, setStructureData, setSelectedPoints, updateSessionData, setBandFileName, setStructureFileName, setSessionID, sessionID, endSession } = useSession();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [page, setPage] = useState(1);

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useLanguage();

  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginatedSessions = sessions.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(sessions.length / ITEMS_PER_PAGE);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch {
        enqueueSnackbar(t('fetch_sessions_failed'), { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [enqueueSnackbar]);

  const handleSessionClick = async (id) => {
    try {
      const res = await loadSessionById(id);
      const parsedData = res?.session?.data?.session;
      setSessionID(id);

      if (!parsedData) {
        console.warn("Session data missing or malformed:", res);
        enqueueSnackbar(t('load_session_failed'), {
          variant: "error",
        });
        return;
      }

      const { bandData, structureData, selectedPoints } = parsedData;

      setBandData(bandData || null);
      setStructureData(structureData || null);
      setSelectedPoints(selectedPoints || []);
      setBandFileName(bandData?.bandFileName);
      setStructureFileName(structureData?.structureFileName);
      updateSessionData({ bandData, structureData, selectedPoints });
      enqueueSnackbar(t('session_loaded'), { variant: "success" });
      navigate("/viewer", { state: { disabled: true } });
    } catch (error) {
      console.error("Error loading session:", error);
      enqueueSnackbar(t('load_session_failed'), { variant: "error" });
    }
  };

  const handleConfirmDeleteSession = (id) => {
    setSessionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deleteById(sessionToDelete);

      if (sessionToDelete === sessionID) {
        endSession();
        setSessionID(null);
      }

      setSessions((prev) => {
        const updated = prev.filter((s) => s.id !== sessionToDelete);
        const newTotalPages = Math.ceil(updated.length / ITEMS_PER_PAGE);
        if (page > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }
        return updated;
      });
      enqueueSnackbar(('session_deleted'), { variant: "success" });
    } catch {
      enqueueSnackbar(t('update_session_failed:'), { variant: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  const handleUpdateSession = async (updatedSession) => {
    try {
      await updateSession(updatedSession.id, updatedSession);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === updatedSession.id
            ? { ...s, ...updatedSession, updated_at: new Date().toISOString() }
            : s
        )
      );
      enqueueSnackbar(t('session_updated'), { variant: "success" });
    } catch (error) {
      console.error("Failed to update session", error);
      enqueueSnackbar(t('update_session_failed:'), { variant: "error" });
    }
  };

  const handleSearch = async ({ author, atom, startDate, endDate }) => {
    setLoading(true);
    try {
      const filtered = await filterSessions({ author, atom, startDate, endDate });
      setSessions(filtered);
      setPage(1);
    } catch (error) {
      console.error("Search failed:", error);
      enqueueSnackbar(t('find_sessions_failed'), { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = useCallback((_, value) => setPage(value), []);

  return (
    <Box sx={sessionBoxStyles}>
      <Container sx={sessionContainerStyles} maxWidth={false} >
        <Box sx={headerBoxStyles(theme)} >
          <Box display="flex" alignItems="center" gap={3}>
            <List size={32} color={theme.palette.text.primary} />
            <Box>
              <Typography variant="h4" fontWeight={700} sx={titleBoxStyles(theme)}>
                {t('decoding_mask_session_archive')}
              </Typography>
              <Typography variant="subtitle2" sx={textBoxStyles(theme)}>
                {t('spectral_analysis_history')}
              </Typography>
            </Box>
          </Box>

        </Box>
        <Box display="flex" justifyContent="center" my={2} mb={8}>
          <SearchBar onSearch={handleSearch} />
        </Box>


        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
            <CircularProgress />
          </Box>
        ) : sessions.length === 0 ? (
          <Typography variant="h6" textAlign="center"> {t('no_sessions_found')} </Typography>
        ) : (
          <>

            <Box flexGrow={1}>
              <Grid container spacing={4} justifyContent="center">
                {paginatedSessions
                  .filter((session) => session && session.id)
                  .map((session) => (
                     <Grid key={session.id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4', lg: 'span 3' } }}>
                      <SessionCard
                        session={session}
                        onClick={() => handleSessionClick(session.id)}
                        onDelete={() => handleConfirmDeleteSession(session.id)}
                        onUpdate={handleUpdateSession}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Box>
            {totalPages > 1 && (
              <Box mt={4} display="flex" justifyContent="center">
                <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" shape="rounded" />
              </Box>
            )}
          </>
        )}
        <DeleteSessionDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirmed}
        />
      </Container>
    </Box>
  );
}

export default SessionsPage;
