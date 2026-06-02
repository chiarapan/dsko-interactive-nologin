import { useState, useEffect, useCallback } from "react";
import { Typography, CircularProgress, Pagination, Box, useTheme, Container, Grid  } from "@mui/material";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { getOptimizerSessionById, getAllOptimizerSessions, deleteOptimizerSession, updateOptimizerSession, filterOptimizerSessions } from "../../api/OptimizerSessionApi.js";
import { useOptimizerSession } from "../../context/OptimizerContext.js";
import { headerBoxStyles, sessionBoxStyles, sessionContainerStyles, titleBoxStyles, textBoxStyles, elementBoxStyles } from "../../styles/Session.styles.js";
import { List } from "lucide-react";
import SessionCard from "./SessionCard.js";
import DeleteSessionDialog from "./DeleteSessionDialog.js";
import SearchBar from "./Searchbar.js";
import { useLanguage } from "../../context/LanguageContext.js";


const ITEMS_PER_PAGE = 6;

function OptimizerSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginatedSessions = sessions.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(sessions.length / ITEMS_PER_PAGE)
  const { setCsvData, setNumParticles, clearSession, sessionId, importanceCacheRef, setSessionId } = useOptimizerSession()
  const { t } = useLanguage();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getAllOptimizerSessions();
        setSessions(data);
      } catch {
        enqueueSnackbar(t('fetch_sessions_failed'), { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [enqueueSnackbar, t]); 


  const handleSessionClick = async (id) => {
    try {
      const res = await getOptimizerSessionById(id);
      const rawData = res?.session?.data;

      if (!rawData) throw new Error("No session data found.");
      

      const parsedDataObject = JSON.parse(rawData);
      setSessionId(id)
      setCsvData(parsedDataObject?.data);
      const loadedParticles = JSON.parse(res?.session?.numParticles);
      setNumParticles(Number(loadedParticles) > 0 ? Number(loadedParticles) : undefined);
      
      enqueueSnackbar(t('session_loaded'), { variant: "success" });
      navigate("/convergence", { state: { disabled: true } });
    } catch (error) {
      console.error("Error loading session:", error);
      enqueueSnackbar(t('load_session_failed'), { variant: "error" });
    }
  };


  const handleConfirmDeleteSession = (id) => {
    setSessionToDelete(id);
    setDeleteDialogOpen(true);
  }

  const handleUpdateSession = async (id, updatedFields) => {
    try {
      const updatedSessionResponse = await updateOptimizerSession(id, updatedFields);

      enqueueSnackbar(t('session_updated'), { variant: "success" });

      setSessions(prevSessions => prevSessions.map(session =>
        session.id === id ? { ...session, ...updatedSessionResponse.session } : session
      ));
    } catch (error) {
      console.error("Failed to update session:", error);
      enqueueSnackbar(t('update_session_failed:'), { variant: "error" });
    }
  };

  const handleDeleteConfirmed = async () => {
    try {
      if (sessionId === sessionToDelete) {
        await clearSession();
        importanceCacheRef.current = null;
      }

      await deleteOptimizerSession(sessionToDelete);

      setSessions((prev) => {
        const updated = prev.filter((s) => s.id !== sessionToDelete);
        const newTotalPages = Math.ceil(updated.length / ITEMS_PER_PAGE);
        if (page > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }

        return updated;
      });

      enqueueSnackbar(t('session_deleted'), { variant: "success" });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(t('delete_session_failed'), { variant: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  const handleSearch = async ({ author, atom, startDate, endDate }) => {
    setLoading(true);
    try {
      const filtered = await filterOptimizerSessions({ author, atom, startDate, endDate });
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
      <Container
        sx={sessionContainerStyles} maxWidth={false} >
        <Box sx={headerBoxStyles(theme)}>
          <Box display="flex" alignItems="center" gap={3} sx={{ elementBoxStyles }}>
            <List size={32} color={theme.palette.text.primary} />
            <Box >
              <Typography variant="h4" fontWeight={700} sx={titleBoxStyles(theme)}>
                {t('optimizer_session_archive')}
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
          <Typography variant="h6" textAlign="center">
            {t('no_sessions_found')}
          </Typography>
        ) : (
          <>
            <Box flexGrow={1}>
              <Grid container spacing={4} justifyContent="center">
                {paginatedSessions.map((session) => (
                   <Grid
                      key={session.id}
                      sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4', lg: 'span 3' } }}
                    >
                    <SessionCard
                      session={session}
                      onClick={() => handleSessionClick(session.id)}
                      onDelete={() => handleConfirmDeleteSession(session.id)}
                      onUpdate={(updatedFields) => handleUpdateSession(session.id, updatedFields)}

                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            {totalPages > 1 && (
              <Box mt={4} display="flex" justifyContent="center">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                />
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

export default OptimizerSessionsPage;
