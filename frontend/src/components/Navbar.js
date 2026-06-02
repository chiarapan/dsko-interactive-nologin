import React, { useState, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  Tabs,
  Tab,
  Menu,
  MenuItem,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import logo from '../assets/dsco_logo.webp';
import {
  appbarStyles,
  tabsNavStyles,
  tabStyles,
  titleStyles,
  toolbarStyles,
} from '../styles/Navbar.styles';
import { Sun, Moon, Pencil, LayoutGrid, Search, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';


function Navbar() {
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeMode();
  const { pathname } = useLocation();

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);
  const [langAnchorEl, setLangAnchorEl] = useState(null);
  const langMenuOpen = Boolean(langAnchorEl);
  const { t, language, setLanguage } = useLanguage();

  const navItems = useMemo(() => [
    { label: t('mask_editor'), path: '/viewer', icon: <Pencil size={16} strokeWidth={1.5} /> },
    { label: t('pso_monitor'), path: '/convergence', icon: <Search size={16} strokeWidth={1.5} /> }
  ], [t]);

  const currentTab = navItems.find(item => item.path === pathname)?.path || false;

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleLangMenuOpen = (event) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangAnchorEl(null);
  };

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setLangAnchorEl(null);
  };


  const toggleButtonStyles = {
    ml: 1,
    color: mode === 'dark' ? '#FFD700' : theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
    borderRadius: 2,
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  };

  return (
    <AppBar position="sticky" elevation={0} sx={appbarStyles}>
      <Toolbar sx={toolbarStyles}>

        <Box display="flex" alignItems="center" mt={0.5} gap={1.5}>
          <Link to="/viewer" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <motion.div
              style={{
                backgroundColor: 'white',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.img
                src={logo}
                alt="Logo"
                style={{ height: 40, width: 'auto', display: 'block' }}
                loading="lazy"
              />
            </motion.div>
          </Link>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={titleStyles}
          >
            {t('dftb_title')}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={{ xs: 1, md: 2 }}>
          <Tabs
            value={currentTab}
            variant="scrollable"
            scrollButtons="auto"
            sx={tabsNavStyles}
          >
            {navItems.map((item) => (
              <Tab
                key={item.path}
                value={item.path}
                component={Link}
                to={item.path}
                icon={item.icon}
                iconPosition="start"
                label={item.label}
                sx={tabStyles(pathname, item)}
              />
            ))}

            {/* Sessions dropdown trigger styled as Tab */}
            <Tab
              label={t('sessions')}

              icon={<LayoutGrid size={16} strokeWidth={1.5} />}
              iconPosition="start"
              onClick={handleMenuOpen}
              sx={tabStyles(pathname, { path: '/sessions' })}
            />
          </Tabs>

          <Menu
            anchorEl={menuAnchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{
              elevation: 3,
              sx: {
                borderRadius: 1,
                mt: 1.5,
                minWidth: 100,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[3],
                '& .MuiMenuItem-root': {
                  fontSize: '0.75rem',
                  px: 1.5,
                  py: 1,
                  minHeight: 32,
                  lineHeight: 1.2,
                  transition: 'background-color 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  '& svg': {
                    marginRight: 1,
                    fontSize: 14,
                    color: theme.palette.text.secondary,
                  },
                },
              },
            }}
          >
            <MenuItem component={Link} to="/sessions" onClick={handleMenuClose}>
              <Pencil size={16} strokeWidth={1.5} />
              {t('mask_sessions')}
            </MenuItem>
            <MenuItem component={Link} to="/optimizerSessions" onClick={handleMenuClose}>
              <Search size={16} strokeWidth={1.5} />
              {t('optimizer_sessions')}
            </MenuItem>
          </Menu>
          <Menu
            anchorEl={langAnchorEl}
            open={langMenuOpen}
            onClose={handleLangMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{
              elevation: 3,
              sx: {
                borderRadius: 1,
                mt: 1.5,
                minWidth: 100,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[3],
                '& .MuiMenuItem-root': {
                  fontSize: '0.75rem',
                  px: 1.5,
                  py: 1,
                  minHeight: 32,
                  lineHeight: 1.2,
                  transition: 'background-color 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  '& svg': {
                    marginRight: 1,
                    fontSize: 14,
                    color: theme.palette.text.secondary,
                  },
                },
              },
            }}
          >
            <MenuItem onClick={() => handleLanguageSelect('en')}>English</MenuItem>
            <MenuItem onClick={() => handleLanguageSelect('de')}>Deutsch</MenuItem>
          </Menu>


          <IconButton onClick={handleLangMenuOpen} sx={toggleButtonStyles}>
            <Globe size={16} strokeWidth={1.5} />
          </IconButton>

          <IconButton onClick={toggleColorMode} sx={toggleButtonStyles}>
            {mode === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
          </IconButton>
        </Box>

      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
