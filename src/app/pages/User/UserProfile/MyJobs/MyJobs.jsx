import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Badge,
    Button,
    Paper,
    Stack
} from '@mui/material';
import {
    WorkOutline as WorkOutlineIcon,
    InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { JobCardThird } from '../../../../components';
import { mockJobs } from '../../../../../mocks/mockData';
import { useSelector, useDispatch } from 'react-redux';
import { getSavedJobs, addSavedJob, removeSavedJob } from '../../../../modules';
import { getApplications } from '../../../../modules';
import { jobApi } from '../../../../../api';

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`jobs-tabpanel-${index}`}
            aria-labelledby={`jobs-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    );
}

// Map saved jobs data from API format to JobCardThird format
const mapSavedJobData = (savedJobItem) => {
    if (!savedJobItem?.jobs) return null;

    const job = savedJobItem.jobs;
    const company = job.companies || {};

    return {
        id: job.id,
        job_id: job.id,
        title: job.title,
        description: job.description,
        salary_from: job.salary_from,
        salary_to: job.salary_to,
        salary_currency: job.salary_currency,
        created_at: job.created_at,
        createdAt: job.created_at,
        updated_at: job.updated_at,
        updatedAt: job.updated_at,
        company: {
            id: company.id,
            name: company.name,
            logo: company.logo,
            email: company.email,
            website_url: company.website_url
        },
        logo: company.logo,
        company_id: job.company_id,
        status: job.status,
        isSaved: true,
        ...job
    };
};

// Empty state component
function EmptyState({ message, onExplore }) {
    const { t } = useTranslation();
    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 2,
                minHeight: 400,
            }}
        >
            <Box
                sx={{
                    width: 120,
                    height: 120,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'grey.400',
                }}
            >
                <WorkOutlineIcon sx={{ fontSize: 120, opacity: 0.5 }} />
            </Box>
            <Typography
                variant="h6"
                sx={{
                    mb: 3,
                    color: 'text.secondary',
                    textAlign: 'center',
                    fontWeight: 500,
                }}
            >
                {message}
            </Typography>
            {onExplore && (
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        variant="outlined"
                        onClick={onExplore}
                        sx={{
                            borderColor: 'primary',
                            color: 'primary',
                            textTransform: 'none',
                            px: 4,
                            py: 1,
                            '&:hover': {
                                borderColor: 'primary.dark',
                                bgcolor: 'primary.light',
                                color: 'primary.dark',
                            },
                        }}
                    >
                        {t("myJobs.exploreJobs")}
                    </Button>
                </motion.div>
            )}
        </Box>
    );
}

export default function MyJobs() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const savedJobs = useSelector(state => state.savedJobs?.savedJobs ?? []);
    const appliedJobs = useSelector(state => state.applications?.applications ?? []);

    useEffect(() => {
        dispatch(getSavedJobs());
        dispatch(getApplications());
    }, [dispatch]);

    const [activeTab, setActiveTab] = useState(0);
    const [recentViewedJobs, setRecentViewedJobs] = useState([]);
    const [invitedJobs] = useState([]);

    useEffect(() => {
        const fetchRecentViewedJobs = async () => {
            console.log("heheh")
            try {
                const raw = localStorage.getItem('recent_job_viewed');
                const jobIds = raw ? JSON.parse(raw) : [];

                if (!Array.isArray(jobIds) || jobIds.length === 0) return;

                const res = await jobApi.findAllJob({
                    job_ids: jobIds.join(','),
                    limit: jobIds.length,
                });

                const jobs = res?.data ?? [];

                // Sắp xếp lại theo thứ tự trong localStorage
                const sorted = jobIds
                    .map((id) => jobs.find((j) => String(j.id) === String(id)))
                    .filter(Boolean);

                setRecentViewedJobs(sorted);
            } catch (error) {
                console.error('Lỗi khi fetch recent viewed jobs:', error);
            }
        };

        fetchRecentViewedJobs();
    }, []);

    const mappedSavedJobs = useMemo(() => {
        if (!Array.isArray(savedJobs)) return [];
        return savedJobs
            .map(mapSavedJobData)
            .filter(Boolean);
    }, [savedJobs]);

    const jobCounts = {
        applied: appliedJobs.length,
        saved: mappedSavedJobs.length,
        recentView: recentViewedJobs.length,
        invited: invitedJobs.length,
    };

    const getCurrentTabJobs = () => {
        switch (activeTab) {
            case 0:
                return appliedJobs;
            case 1:
                return mappedSavedJobs;
            case 2:
                return recentViewedJobs;
            case 3:
                return invitedJobs;
            default:
                return [];
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleExploreJobs = () => {
        navigate('/jobs');
    };

    const handleBookmark = (job, meta) => {
        const { action, jobId } = meta || {};
        if (!jobId) return;

        if (action === 'unsave') {
            // Find the saved job ID from savedJobs array
            const savedJobItem = savedJobs.find(item => item.jobs?.id === jobId);
            if (savedJobItem?.id) {
                dispatch(removeSavedJob(jobId));
            }
        } else {
            dispatch(addSavedJob(jobId));
        }
    };

    const getEmptyMessage = (tabIndex) => {
        const messages = {
            0: t("myJobs.emptyStates.applied"),
            1: t("myJobs.emptyStates.saved"),
            2: t("myJobs.emptyStates.recentViewed"),
            3: t("myJobs.emptyStates.invited"),
        };
        return messages[tabIndex] || t("myJobs.emptyStates.noData");
    };

    const renderTabContent = (tabIndex) => {
        const jobs = getCurrentTabJobs();

        if (jobs.length === 0) {
            return (
                <EmptyState
                    message={getEmptyMessage(tabIndex)}
                    onExplore={handleExploreJobs}
                />
            );
        }

        return (
            <Box sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <AnimatePresence>
                        {jobs.map((job, index) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                            >
                                <JobCardThird
                                    job={job}
                                    variant="list"
                                    isBookmarked={tabIndex === 1 || job.isSaved}
                                    onBookmark={handleBookmark}
                                    cardType={tabIndex === 0 ? 'save' : 'normal'}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </Stack>
            </Box>
        );
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>

                    {/* Main Content */}
                    <Box sx={{ flex: 1, maxWidth: 900 }}>
                        {/* Tabs */}
                        <Paper
                            component={motion.div}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                            elevation={0}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                mb: 1.5,
                            }}
                        >
                            {/* Title */}
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    mb: 1.5,
                                    color: 'text.primary',
                                    paddingTop: 3,
                                    paddingLeft: 3,
                                }}
                            >
                                {t("myJobs.title")}
                            </Typography>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                sx={{
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.95rem',
                                        minHeight: 56,
                                        px: 2.5,
                                    },
                                    '& .Mui-selected': {
                                        color: 'primary',
                                        fontWeight: 600,
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: 'primary',
                                        height: 3,
                                    },
                                }}
                            >
                                <Tab
                                    label={
                                        <Badge
                                            badgeContent={jobCounts.applied}
                                            color="primary"
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    bgcolor: activeTab === 0 ? 'primary' : 'grey.400',
                                                    color: 'white',
                                                    minWidth: 20,
                                                    height: 20,
                                                    fontSize: '0.75rem',
                                                },
                                            }}
                                        >
                                            <Box component="span" sx={{ px: 1 }}>
                                                {t("myJobs.tabs.applied")}
                                            </Box>
                                        </Badge>
                                    }
                                />
                                <Tab
                                    label={
                                        <Badge
                                            badgeContent={jobCounts.saved}
                                            color="primary"
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    bgcolor: activeTab === 1 ? 'primary' : 'grey.400',
                                                    color: 'white',
                                                    minWidth: 20,
                                                    height: 20,
                                                    fontSize: '0.75rem',
                                                },
                                            }}
                                        >
                                            <Box component="span" sx={{ px: 1 }}>
                                                {t("myJobs.tabs.saved")}
                                            </Box>
                                        </Badge>
                                    }
                                />
                                <Tab
                                    label={
                                        <Badge
                                            badgeContent={jobCounts.recentView}
                                            color="primary"
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    bgcolor: activeTab === 2 ? 'primary' : 'grey.400',
                                                    color: 'white',
                                                    minWidth: 20,
                                                    height: 20,
                                                    fontSize: '0.75rem',
                                                },
                                            }}
                                        >
                                            <Box component="span" sx={{ px: 1 }}>
                                                {t("myJobs.tabs.recentViewed")}
                                            </Box>
                                        </Badge>
                                    }
                                />
                                <Tab
                                    label={
                                        <Badge
                                            badgeContent={jobCounts.invited}
                                            color="primary"
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    bgcolor: activeTab === 3 ? 'primary' : 'grey.400',
                                                    color: 'white',
                                                    minWidth: 20,
                                                    height: 20,
                                                    fontSize: '0.75rem',
                                                },
                                            }}
                                        >
                                            <Box component="span" sx={{ px: 1 }}>
                                                {t("myJobs.tabs.invited")}
                                            </Box>
                                        </Badge>
                                    }
                                />
                            </Tabs>
                        </Paper>

                        {/* Info Message (only for Applied Jobs tab) */}
                        <AnimatePresence>
                            {activeTab === 0 && (
                                <Box
                                    component={motion.div}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.75,
                                        height: 18,
                                        p: 1.5,
                                        mb: 1.5,
                                        bgcolor: 'grey.50',
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <InfoIcon sx={{ fontSize: 14, color: 'text.secondary', alignSelf: 'center' }} />
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1, display: 'inline-flex', alignItems: 'center' }}>
                                        {t("myJobs.infoMessage")}
                                    </Typography>
                                </Box>
                            )}
                        </AnimatePresence>

                        {/* Tab Content */}
                        <Paper
                            component={motion.div}
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            elevation={0}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                minHeight: 400,
                            }}
                        >
                            <TabPanel value={activeTab} index={0}>
                                {renderTabContent(0)}
                            </TabPanel>

                            <TabPanel value={activeTab} index={1}>
                                {renderTabContent(1)}
                            </TabPanel>

                            <TabPanel value={activeTab} index={2}>
                                {renderTabContent(2)}
                            </TabPanel>

                            <TabPanel value={activeTab} index={3}>
                                {renderTabContent(3)}
                            </TabPanel>
                        </Paper>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

