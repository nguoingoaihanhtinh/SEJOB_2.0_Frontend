import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getTopicSuggestions } from '../../../../../modules/services/recommendationService';
import { Box, Button, Typography, Paper, Chip, Stack, Grid } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

export default function AITopicsCard() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { topicSuggestions, isRequestingTopics, error } = useSelector(state => state.recommendations);

    const handleGetSuggestions = () => {
        dispatch(getTopicSuggestions());
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
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                mt: 3,
                background: 'linear-gradient(to right, #f8fafc, #eff6ff)'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon color="primary" /> AI Career Advice
                </Typography>
                {!topicSuggestions && !isRequestingTopics && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGetSuggestions}
                        startIcon={<AutoAwesomeIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Analyze My Profile
                    </Button>
                )}
            </Box>

            {isRequestingTopics && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        AI is reviewing your skills and experience...
                    </Typography>
                </Box>
            )}

            {error && (
                <Typography color="error" variant="body2">{error}</Typography>
            )}

            {topicSuggestions && topicSuggestions.suggestions && (
                <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Based on your profile, here are 5 topics you should learn next:
                    </Typography>
                    <Grid container spacing={2}>
                        {topicSuggestions.suggestions.map((item, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Box
                                    sx={{
                                        p: 2,
                                        height: '100%',
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'grey.200',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.dark', lineHeight: 1.2 }}>
                                            {item.topic}
                                        </Typography>
                                        <Chip
                                            label={item.difficulty}
                                            size="small"
                                            color={item.difficulty === 'Beginner' ? 'success' : item.difficulty === 'Intermediate' ? 'warning' : 'error'}
                                            variant="outlined"
                                            sx={{ ml: 1, shrink: 0, height: 20, fontSize: '0.7rem' }}
                                        />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                                        {item.reason}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Stack>
            )}
        </Paper>
    );
}
