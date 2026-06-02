import { useState } from "react";
import { TextField, IconButton, Paper, Tooltip, useTheme } from "@mui/material";
import { Search, RotateCcw } from "lucide-react";
import { useLanguage } from '../../context/LanguageContext';

const SearchBar = ({ onSearch }) => {
    const theme = useTheme();

    const [author, setAuthor] = useState("");
    const [atom, setAtom] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const { t } = useLanguage();

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch({ author, atom, startDate, endDate });
    };

    const handleReset = () => {
        setAuthor("");
        setAtom("");
        setStartDate("");
        setEndDate("");
        onSearch({ author: "", atom: "", startDate: "", endDate: "" });
    };

    return (
        <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={6}
            sx={{
                maxWidth: 960,
                mx: "auto",
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                boxShadow:
                    "0 4px 12px rgba(0,0,0,0.05), 0 1px 6px rgba(0,0,0,0.1)",
            }}
            noValidate
            autoComplete="off"
        >


            <TextField
                placeholder={t('author')}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                size="medium"
                variant="outlined"
                sx={{
                    flexBasis: 190,
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        fontSize: "0.75rem",
                        transition: "border-color 0.3s",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused": {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 5px ${theme.palette.primary.light}`,
                    },
                }}
            />

            <TextField
                placeholder="Atom"
                value={atom}
                onChange={(e) => setAtom(e.target.value)}
                size="medium"
                variant="outlined"
                sx={{
                    flexBasis: 200,
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        fontSize: "0.75rem",
                        transition: "border-color 0.3s",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused": {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 5px ${theme.palette.primary.light}`,
                    },
                }}
            />

            <TextField
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="medium"
                variant="outlined"
                sx={{
                    flexBasis: 200,
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        fontSize: "0.65rem",
                        padding: "10px 14px",
                        transition: "border-color 0.3s",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused": {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 5px ${theme.palette.primary.light}`,
                    },
                    "& input": {
                        padding: "10px 14px",
                    },
                }}
                InputLabelProps={{ shrink: true }}
            />

            <TextField
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="medium"
                variant="outlined"
                sx={{
                    flexBasis: 200,
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        fontSize: "0.65rem",
                        padding: "10px 14px",
                        transition: "border-color 0.3s",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused": {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 5px ${theme.palette.primary.light}`,
                    },
                    "& input": {
                        padding: "10px 14px",
                    },
                }}
                InputLabelProps={{ shrink: true }}
            />

            <Tooltip title={t('search_sessions')}>
                <IconButton
                    type="submit"
                    color="primary"
                    sx={{
                        bgcolor: theme.palette.primary.main,
                        "&:hover": {
                            bgcolor: theme.palette.primary.dark,
                            boxShadow: `0 0 8px ${theme.palette.primary.dark}`,
                        },
                        color: "white",
                        p: 1.25,
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                    }}
                    aria-label="search"
                >
                    <Search size={16} />
                </IconButton>
            </Tooltip>

            <Tooltip title={t('reset_filters')}>
                <IconButton
                    type="button"
                    onClick={handleReset}
                    sx={{
                        bgcolor: theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[200],
                        color: theme.palette.text.primary,
                        p: 1.25,
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                            bgcolor: theme.palette.mode === "dark" ? theme.palette.grey[700] : theme.palette.grey[300],
                        },
                    }}
                    aria-label="reset"
                >
                    <RotateCcw size={16} />
                </IconButton>
            </Tooltip>

        </Paper>
    );
};

export default SearchBar;
