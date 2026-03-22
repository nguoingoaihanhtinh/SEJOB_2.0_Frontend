import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Box,
    Container,
    Typography,
    Avatar,
    Button,
    Paper,
    Stack,
    Chip,
    Grid,
    useTheme,
    IconButton
} from '@mui/material';
import {
    Description as DescriptionIcon,
    ArrowForward as ArrowForwardIcon,
    Person as PersonIcon,
    Edit as EditIcon,
    Email as EmailIcon,
    Phone as PhoneIcon
} from '@mui/icons-material';
import { ProfileSidebar, JobCard } from '../../../../components';
import { UserActivities } from './partials';
import AITopicsCard from './partials/AITopicsCard';
import { useSelector, useDispatch } from 'react-redux';
import { getApplications, getSavedJobs } from '../../../../modules';

// Helper function to get initials from name
const getInitials = (name) => {
    if (!name) return '';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2); // Get first 2 initials
};

export default function ProfileDashboard() {
    const currentUser = useSelector((state) => state.auth.user) || {};
    const theme = useTheme();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get data from Redux store
    const applications = useSelector(state => state.applications?.applications ?? []);
    const savedJobs = useSelector(state => state.savedJobs?.savedJobs ?? []);

    // Fetch data on mount
    useEffect(() => {
        dispatch(getApplications());
        dispatch(getSavedJobs());
    }, [dispatch]);

    // Calculate stats from real data
    const stats = useMemo(() => ({
        totalJobs: applications.length,
        savedJobs: savedJobs.length,
        invitations: 0, // TODO: Implement invitations when API is available
        interviewed: applications.filter(app => app.status === 'Interview' || app.status === 'Interviewed').length,
        unsuitable: applications.filter(app => app.status === 'Rejected' || app.status === 'Declined').length,
        interviewedPercent: applications.length > 0
            ? Math.round((applications.filter(app => app.status === 'Interview' || app.status === 'Interviewed').length / applications.length) * 100)
            : 0
    }), [applications, savedJobs]);

    // Map application data to job card format (similar to MyJobs)
    const recentApplications = useMemo(() => {
        if (!applications || applications.length === 0) return [];

        return applications.slice(0, 3).map(app => {
            // Prefer API structure: app.job and app.company
            const job = app.job || app.jobs || app;
            if (!job) return null;

            const company = app.company || job.company || job.companies || {};

            return {
                id: job.id || app.job_id,
                job_id: job.id || app.job_id,
                title: job.title || '',
                description: job.description || '',
                salary_from: job.salary_from,
                salary_to: job.salary_to,
                salary_currency: job.salary_currency,
                salary_text: job.salary_text,
                created_at: job.created_at || app.created_at,
                createdAt: job.created_at || app.created_at,
                updated_at: job.updated_at || app.updated_at,
                updatedAt: job.updated_at || app.updated_at,
                company: {
                    id: company.id,
                    name: company.name,
                    logo: company.logo,
                    email: company.email,
                    website_url: company.website_url
                },
                logo: company.logo,
                company_id: job.company_id || company.id,
                status: job.status,
                dateApplied: new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                applicationStatus: app.status || 'Pending',
                statusColor:
                    app.status === 'Approved' || app.status === 'Interview' ? 'primary' :
                        app.status === 'Rejected' || app.status === 'Declined' ? 'error' : 'warning',
                ...job
            };
        }).filter(Boolean);
    }, [applications]);

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>

                    {/* Main Content */}
                    <Box sx={{ flex: 1, maxWidth: 900 }}>
                        {/* User Profile Card */}
                        <Grid sx={{ paddingBottom: 2 }}>
                            <Paper
                                component={motion.div}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                                whileHover={{ y: -2, boxShadow: 4 }}
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                                    <Box sx={{ position: 'relative' }}>
                                        {currentUser.avatar
                                            ? (
                                                <Avatar
                                                    src={currentUser.avatar}
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        bgcolor: 'background.default',
                                                        fontSize: '2rem',
                                                        fontWeight: 600,
                                                        objectFit: 'cover',
                                                    }}
                                                    imgProps={{ style: { objectFit: 'cover', width: '100%', height: '100%' } }}
                                                />
                                            )
                                            : (
                                                <div className="flex flex-col items-center gap-4 shrink-0">
                                                    <div className="bg-primary rounded-full w-24 h-24 flex items-center justify-center">
                                                        <span className="text-white text-2xl font-bold">
                                                            {getInitials((currentUser.last_name || '') + ' ' + (currentUser.first_name || ''))}
                                                        </span>
                                                    </div>
                                                </div>

                                            )
                                        }
                                        {/* <IconButton
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                bottom: -4,
                                                right: -4,
                                                bgcolor: 'white',
                                                border: '2px solid',
                                                borderColor: 'divider',
                                                width: 28,
                                                height: 28,
                                                '&:hover': {
                                                    bgcolor: 'grey.100',
                                                },
                                            }}
                                        >
                                            <EditIcon sx={{ fontSize: 14 }} />
                                        </IconButton> */}
                                    </Box>

                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                            <Box>
                                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                    {currentUser.last_name} {currentUser.first_name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {currentUser?.email || t('dashboard.noEmailProvided')}
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    variant="text"
                                                    endIcon={<ArrowForwardIcon />}
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        fontSize: '0.95rem',
                                                        color: theme.palette.primary.main,
                                                        px: 0,
                                                        mt: 3,
                                                        justifyContent: 'flex-start',
                                                        '&:hover': {
                                                            bgcolor: 'transparent',
                                                        },
                                                    }}
                                                >
                                                    {t('profile.updateProfile')}
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* User Activities Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                        >
                            <UserActivities stats={stats} />
                        </motion.div>

                        <AITopicsCard />

                        {/* Recent Applications History */}
                        {/* Or Recommend Jobs */}
                        <Paper
                            component={motion.div}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                mt: 3,
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                {t('dashboard.recentApplicationsHistory')}
                            </Typography>
                            <Stack spacing={2}>
                                {recentApplications.map((application, index) => (
                                    <Box
                                        key={application.id}
                                        component={motion.div}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                                        whileHover={{ x: 4, transition: { duration: 0.2 } }}
                                        sx={{
                                            '& .MuiCard-root': {
                                                mb: 0,
                                            }
                                        }}
                                    >
                                        <JobCard
                                            job={application}
                                            variant="list"
                                            showFeatured={false}
                                            showDescription={false}
                                            showApplyButton={false}
                                            showActions={false}
                                        />
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                px: 3,
                                                py: 1.5,
                                                bgcolor: theme.palette.grey[50],
                                                borderBottomLeftRadius: 2,
                                                borderBottomRightRadius: 2,
                                                mt: -1,
                                            }}
                                        >
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('dashboard.dateApplied')}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {application.dateApplied}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={application.applicationStatus}
                                                color={application.statusColor}
                                                variant="outlined"
                                                size="small"
                                                sx={{ minWidth: 100 }}
                                            />
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="text"
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        mt: 3,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        color: theme.palette.primary.main,
                                        px: 0,
                                        '&:hover': {
                                            bgcolor: 'transparent',
                                        },
                                    }}
                                >
                                    {t('dashboard.viewAllApplicationsHistory')}
                                </Button>
                            </motion.div>
                        </Paper>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

