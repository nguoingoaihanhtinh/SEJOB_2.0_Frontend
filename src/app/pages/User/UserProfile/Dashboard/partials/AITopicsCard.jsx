import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getCareerAdvice } from '../../../../../modules/services/recommendationService';
import { Box, Button, Typography, Paper, Chip, Stack, Grid, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import WorkIcon from '@mui/icons-material/Work';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

export default function AITopicsCard() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { careerAdvice, isRequestingAdvice, error } = useSelector(state => state.recommendations);

    const handleGetAdvice = () => {
        dispatch(getCareerAdvice());
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemAnim = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                mt: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* Background Decorative Element */}
            <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                opacity: 0.05,
                transform: 'rotate(15deg)'
            }}>
                <AutoAwesomeIcon sx={{ fontSize: 150 }} color="primary" />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, position: 'relative' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                    <AutoAwesomeIcon sx={{ color: '#0ea5e9' }} /> AI Career Mentor
                </Typography>
                {!careerAdvice && !isRequestingAdvice && (
                    <Button
                        variant="contained"
                        onClick={handleGetAdvice}
                        startIcon={<AutoAwesomeIcon />}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 3,
                            px: 3,
                            py: 1,
                            fontWeight: 700,
                            background: 'linear-gradient(to right, #0ea5e9, #2563eb)',
                            boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.39)',
                            '&:hover': {
                                background: 'linear-gradient(to right, #0284c7, #1d4ed8)',
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        Analyze My Career
                    </Button>
                )}
            </Box>

            {isRequestingAdvice && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#0ea5e9' }} spin />} />
                    <Typography variant="h6" sx={{ mt: 3, fontWeight: 600, color: 'text.secondary' }}>
                        Synthesizing your career roadmap...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Comparing your profile with 10,000+ market requirements
                    </Typography>
                </Box>
            )}

            {error && (
                <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 2, border: '1px solid', borderColor: 'error.light' }}>
                    <Typography color="error.main" variant="body2" sx={{ fontWeight: 500 }}>{error}</Typography>
                </Box>
            )}

            {careerAdvice && (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    <Stack spacing={4}>
                        {/* Profile Analysis */}
                        <motion.div variants={itemAnim}>
                            <Box sx={{ p: 2.5, bgcolor: 'rgba(14, 165, 233, 0.04)', borderRadius: 3, border: '1px dashed', borderColor: '#0ea5e9' }}>
                                <Typography variant="overline" sx={{ color: '#0ea5e9', fontWeight: 900, letterSpacing: 1.2 }}>
                                    Professional Assessment
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 1, color: 'text.primary', lineHeight: 1.6, fontWeight: 500 }}>
                                    {careerAdvice.profile_analysis}
                                </Typography>
                            </Box>
                        </motion.div>

                        <Grid container spacing={3}>
                            {/* Skill Gaps & Career Paths */}
                            <Grid item xs={12} md={6}>
                                <motion.div variants={itemAnim}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <TrendingUpIcon sx={{ color: '#f59e0b' }} /> Skill Gaps to Bridge
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        {careerAdvice.skill_gaps.map((skill, i) => (
                                            <Chip
                                                key={i}
                                                label={skill}
                                                sx={{
                                                    borderRadius: 1.5,
                                                    fontWeight: 600,
                                                    bgcolor: '#fff7ed',
                                                    color: '#9a3412',
                                                    border: '1px solid #ffedd5',
                                                    mb: 1
                                                }}
                                            />
                                        ))}
                                    </Stack>

                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, mt: 4, mb: 2 }}>
                                        <SchoolIcon sx={{ color: '#10b981' }} /> Recommended Paths
                                    </Typography>
                                    <List dense disablePadding>
                                        {careerAdvice.recommended_career_paths.map((path, i) => (
                                            <ListItem key={i} sx={{ px: 0 }}>
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={path}
                                                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </motion.div>
                            </Grid>

                            {/* Actionable Steps */}
                            <Grid item xs={12} md={6}>
                                <motion.div variants={itemAnim}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <AssignmentTurnedInIcon sx={{ color: '#6366f1' }} /> Immediate Action Plan
                                    </Typography>
                                    <Stack spacing={1.5}>
                                        {careerAdvice.actionable_steps.map((step, i) => (
                                            <Box
                                                key={i}
                                                sx={{
                                                    p: 2,
                                                    bgcolor: '#f5f3ff',
                                                    borderRadius: 2,
                                                    borderLeft: '4px solid #6366f1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2
                                                }}
                                            >
                                                <Typography variant="h6" sx={{ color: '#6366f1', fontWeight: 900, opacity: 0.5 }}>0{i + 1}</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4338ca' }}>
                                                    {step}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </motion.div>
                            </Grid>
                        </Grid>

                        {/* Top Matched Jobs */}
                        <motion.div variants={itemAnim}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, mt: 3, mb: 2 }}>
                                <WorkIcon sx={{ color: '#0ea5e9' }} /> Targeted Opportunities
                            </Typography>
                            <Grid container spacing={2}>
                                {careerAdvice.top_matched_jobs.map((match, i) => (
                                    <Grid item xs={12} key={i}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                bgcolor: 'white',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    borderColor: '#0ea5e9',
                                                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.08)',
                                                    transform: 'translateX(4px)'
                                                }
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                                "{match.reason}"
                                            </Typography>
                                            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                                                    onClick={() => window.open(`/jobs/${match.job_id}`, '_blank')}
                                                >
                                                    View Job Opening
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Button
                                size="small"
                                color="inherit"
                                onClick={handleGetAdvice}
                                sx={{ opacity: 0.6, fontSize: '0.7rem' }}
                                startIcon={<AutoAwesomeIcon sx={{ fontSize: 12 }} />}
                            >
                                Re-analyze Profile
                            </Button>
                        </Box>
                    </Stack>
                </motion.div>
            )}
        </Paper>
    );
}
