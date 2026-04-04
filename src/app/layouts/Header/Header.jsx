import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
  ListItemIcon
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Work as WorkIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from '../../assets/logo.svg';
import { AUTHENTICATED, USER_NAME } from "../../../settings/localVar";
import { logout } from "@/modules/services/authService";
import { useDispatch } from "react-redux";
import { CustomAlert } from "../../components";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import NotificationSection from "../../components/sections/NotificationSection";


export default function Header() {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  let navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { alertConfig, hideAlert, showSuccess, showError } = useCustomAlert();

  // Check if user is logged in 
  const isLoggedIn = localStorage.getItem(AUTHENTICATED) === 'true';
  const userName = localStorage.getItem(USER_NAME);

  const handleLangChange = (_e, newLang) => {
    if (newLang) i18n.changeLanguage(newLang);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const navigateAndClose = (path) => {
    handleUserMenuClose();
    navigate(path);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate('/profile/dashboard');
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    try {
      const result = await dispatch(logout());
      if (logout.fulfilled.match(result)) {
        showSuccess("Logout successful!");
        navigate('/');
      } else {
        showError("Logout failed: " + (result.payload || "Unknown error"));
      }
    } catch (error) {
      showError("An error occurred during logout. Please try again.");
    }
  };

  const handleCreateCV = () => {
    window.open('https://www.topcv.vn/mau-cv', '_blank');
  };

  const handleContactUs = () => {
    navigate('/contact-us');
  };

  const handleForEmployers = () => {
    navigate('/company/signup');
  };
  // Check if a path is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: 'white',
        color: 'text.primary',
        boxShadow: 0.5,
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100
      }}
    >
      <Toolbar sx={{
        minHeight: { xs: '40px', md: '50px' },
        px: { xs: 2, md: 3 },
        justifyContent: 'space-between'
      }}>
        {/* Header layout: desktop (logo left + nav + actions) or mobile (menu left, logo center, avatar right) */}
        {isMobile ? (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
              sx={{ ml: -1 }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, pointerEvents: 'none' }} onClick={() => window.location.assign('/')}>
              <img src={logo} alt="SE Jobs Logo" width="48" style={{ marginRight: '8px' }} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isLoggedIn ? (
                <>
                  {/* notifications component (handles its own state) */}
                  <NotificationSection compact />

                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{
                      border: '2px solid',
                      borderColor: 'primary.main',
                      p: 0.25,
                      ml: 0.5
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}
                    >
                      {(userName && typeof userName === 'string' && userName.length > 0) ? userName.charAt(0).toUpperCase() : ''}
                    </Avatar>
                  </IconButton>
                </>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/signin')}
                >
                  {t('login')}
                </Button>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.location.assign('/')}>
            <img src={logo} alt="SE Jobs Logo" width={isMobile ? "40" : "60"} style={{ marginRight: '8px', marginLeft: '10px' }} />
          </Box>
        )}

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{
            flexGrow: 1,
            display: 'flex',
            gap: 2,
            ml: 4,
            // justifyContent: 'center'
          }}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              sx={{
                color: isActive('/') ? 'primary.main' : 'inherit',
                fontWeight: isActive('/') ? 800 : 600,
                borderBottom: isActive('/') ? '2px solid' : 'none',
                borderColor: 'primary.main',
                borderRadius: 0,
                pb: isActive('/') ? 0.2 : 0,
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              {t('home')}
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/jobs"
              sx={{
                color: isActive('/jobs') ? 'primary.main' : 'inherit',
                fontWeight: isActive('/jobs') ? 800 : 600,
                borderBottom: isActive('/jobs') ? '2px solid' : 'none',
                borderColor: 'primary.main',
                borderRadius: 0,
                pb: isActive('/jobs') ? 0.2 : 0,
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              {t('jobs')}
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/companies"
              sx={{
                color: isActive('/companies') ? 'primary.main' : 'inherit',
                fontWeight: isActive('/companies') ? 800 : 600,
                borderBottom: isActive('/companies') ? '2px solid' : 'none',
                borderColor: 'primary.main',
                borderRadius: 0,
                pb: isActive('/companies') ? 0.2 : 0,
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              {t('companies')}
            </Button>
            <Button
              color="inherit"
              onClick={handleCreateCV}
              sx={{
                fontWeight: 600,
                borderRadius: 0,
                pb: 0,
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
              title="TopCV"
            >
              {t('createCV')}
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/contact-us"
              sx={{
                color: isActive('/contact-us') ? 'primary.main' : 'inherit',
                fontWeight: isActive('/contact-us') ? 800 : 600,
                borderBottom: isActive('/contact-us') ? '2px solid' : 'none',
                borderColor: 'primary.main',
                borderRadius: 0,
                pb: isActive('/contact-us') ? 0.2 : 0,
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              {t('contactUs')}
            </Button>
          </Box>
        )}

        {/* Desktop Actions */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }} color="inherit" component={Link} to="/company/signup">{t('forEmployers')}</Button>

            {isLoggedIn ? (
              <>
                {/* notifications component (handles its own state) */}
                <NotificationSection />
                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={{
                    border: '2px solid',
                    borderColor: 'primary.main',
                    p: 0.25,
                    ml: 0.5
                  }}
                >
                  <Avatar
                    sx={{
                      width: 25,
                      height: 25,
                      bgcolor: 'primary.main',
                    }}
                    alt={userName}
                    src=""
                  />
                </IconButton>
                {/* user menu moved lower so it's available on mobile and desktop */}
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/signin')}
                >
                  {t('login')}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/signup')}
                >
                  {t('register')}
                </Button>
              </>
            )}

            <ToggleButtonGroup
              exclusive
              size="small"
              value={i18n.language?.startsWith('vi') ? 'vi' : 'en'}
              onChange={handleLangChange}
              aria-label="Language switcher"
              sx={{
                '& .MuiToggleButton-root': {
                  border: 'none',
                  padding: '4px 8px',
                  minWidth: '32px',
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ToggleButton value="en" aria-label="Switch to English">EN</ToggleButton>
              <ToggleButton value="vi" aria-label="Switch to Vietnamese">VI</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Mobile Menu button is rendered in the mobile header layout above (left side). */}

        {/* Mobile Menu Dropdown */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              // compact menu items and smaller text for mobile
              '& .MuiMenuItem-root': {
                fontSize: '0.95rem',
                py: 1.25,
              },
            },
          }}
        >
          <MenuItem
            component={Link}
            to="/"
            onClick={handleMobileMenuClose}
            selected={isActive('/')}
            sx={{ justifyContent: 'flex-start' }}
          >
            {t('home')}
          </MenuItem>

          <MenuItem
            component={Link}
            to="/jobs"
            onClick={handleMobileMenuClose}
            selected={isActive('/jobs')}
            sx={{ justifyContent: 'flex-start' }}
          >
            {t('jobs')}
          </MenuItem>

          <MenuItem
            component={Link}
            to="/companies"
            onClick={handleMobileMenuClose}
            selected={isActive('/companies')}
            sx={{ justifyContent: 'flex-start' }}
          >
            {t('companies')}
          </MenuItem>

          <MenuItem onClick={handleContactUs} sx={{ justifyContent: 'flex-start' }}>
            {t('contactUs')}
          </MenuItem>

          <MenuItem onClick={handleCreateCV} sx={{ justifyContent: 'flex-start' }}>
            {t('createCV')}
          </MenuItem>

          <MenuItem onClick={handleForEmployers} sx={{ justifyContent: 'flex-start' }}>
            {t('forEmployers')}
          </MenuItem>

          {!isLoggedIn && (
            <MenuItem onClick={() => { handleMobileMenuClose(); navigate('/signin'); }} sx={{ justifyContent: 'center' }}>
              {t('login')}
            </MenuItem>
          )}

          {!isLoggedIn && (
            <MenuItem onClick={() => { handleMobileMenuClose(); navigate('/signup'); }} sx={{ justifyContent: 'center' }}>
              {t('register')}
            </MenuItem>
          )}

          <MenuItem sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={i18n.language?.startsWith('vi') ? 'vi' : 'en'}
              onChange={handleLangChange}
              aria-label="Language switcher"
              sx={{
                '& .MuiToggleButton-root': {
                  border: 'none',
                  padding: '4px 8px',
                  minWidth: '32px',
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ToggleButton value="en" aria-label="Switch to English">EN</ToggleButton>
              <ToggleButton value="vi" aria-label="Switch to Vietnamese">VI</ToggleButton>
            </ToggleButtonGroup>
          </MenuItem>
        </Menu>

        {/* User Menu (available on both mobile and desktop) */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 200,
              '& .MuiMenuItem-root': {
                fontSize: '0.95rem',
                py: 0.75,
              },
            },
          }}
        >
          <MenuItem onClick={() => navigateAndClose('/profile/dashboard')}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            Profile Dashboard
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => navigateAndClose('/profile/user-profile')}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => navigateAndClose('/profile/my-jobs')}>
            <ListItemIcon>
              <WorkIcon fontSize="small" />
            </ListItemIcon>
            My Jobs
          </MenuItem>
          <Divider />
          {/* <MenuItem onClick={() => navigateAndClose('/profile/notifications')}>
            <ListItemIcon>
              <NotificationsIcon fontSize="small" />
            </ListItemIcon>
            Notifications
          </MenuItem>
          <Divider /> */}
          <MenuItem onClick={() => navigateAndClose('/profile/settings')}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
      <CustomAlert
        {...alertConfig}
        onClose={hideAlert}
      />
    </AppBar>
  );
}