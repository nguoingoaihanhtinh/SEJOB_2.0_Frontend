import React from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Badge, Typography, Avatar, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Dashboard as DashboardIcon,
    Description as DescriptionIcon,
    Person as PersonIcon,
    Work as WorkIcon,
    Mail as MailIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Inbox as InboxIcon,
    WavingHand as WavingHandIcon,
    PowerSettingsNew as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProfileSidebar({ user }) {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { t } = useTranslation();
    const currentUser = useSelector((state) => state.auth.user);

    const menuItems = [
        { icon: <DashboardIcon />, text: t('sidebar.dashboard'), path: '/profile/dashboard' },
        { icon: <PersonIcon />, text: t('sidebar.profile'), path: '/profile/user-profile' },
        { icon: <WorkIcon />, text: t('sidebar.myJobs'), path: '/profile/my-jobs' },
        // { icon: <NotificationsIcon />, text: t('sidebar.notifications'), path: '/profile/notifications' },
        { icon: <SettingsIcon />, text: t('sidebar.settings'), path: '/profile/settings' },
    ];

    const handleNavigation = (path) => {
        navigate(path);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            sx={{
                width: 280,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: theme.shadows[2],
                overflow: 'hidden',
                height: 'fit-content',
                position: 'sticky',
                top: 20,
                alignSelf: 'flex-start',
            }}
        >
            {/* Welcome Section */}
            <Box
                component={motion.div}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <motion.div
                        initial={{ rotate: -20, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <WavingHandIcon sx={{ fontSize: 20, color: theme.palette.warning.main }} />
                    </motion.div>
                    <Typography variant="body2" color="text.secondary">
                        {t('sidebar.welcome')}
                    </Typography>
                </Box>
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        {currentUser?.first_name || ''}
                    </Typography>
                </motion.div>
            </Box>

            {/* Menu Items */}
            <List sx={{ py: 1 }}>
                {menuItems.map((item, index) => {
                    const active = isActive(item.path);
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                        >
                            <ListItemButton
                                component={motion.div}
                                whileHover={{
                                    x: 4,
                                    transition: { duration: 0.2 },
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleNavigation(item.path)}
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    position: 'relative',
                                    borderLeft: active ? '3px solid' : '3px solid transparent',
                                    borderColor: active ? theme.palette.primary.main : 'transparent',
                                    bgcolor: active ? theme.palette.primary.main + '14' : 'transparent',
                                    '&:hover': {
                                        bgcolor: active ? theme.palette.primary.main + '1F' : 'action.hover',
                                    },
                                }}
                            >
                                {/* Active Indicator Animation */}
                                {active && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: '3px',
                                            backgroundColor: theme.palette.primary.main,
                                        }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}

                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        color: active
                                            ? theme.palette.primary.main
                                            : theme.palette.text.secondary,
                                    }}
                                >
                                    <motion.div
                                        animate={{
                                            scale: active ? 1.1 : 1,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {item.badge !== undefined ? (
                                            <Badge badgeContent={item.badge} color="primary">
                                                {item.icon}
                                            </Badge>
                                        ) : (
                                            item.icon
                                        )}
                                    </motion.div>
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.9rem',
                                        fontWeight: active ? 600 : 400,
                                        color: active ? theme.palette.text.primary : theme.palette.text.secondary,
                                    }}
                                />
                            </ListItemButton>
                        </motion.div>
                    );
                })}
            </List>
        </Box>
    );
}

// Keep the old component for backward compatibility
export function DefaultSidebar() {
    return <ProfileSidebar />;
}