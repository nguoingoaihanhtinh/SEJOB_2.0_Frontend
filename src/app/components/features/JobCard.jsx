import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Chip,
    Card,
    CardContent,
    IconButton,
    Stack,
    Paper,
    Divider,
    Portal,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { BookmarkBorder, Bookmark } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from '../common/Button';

// Helper functions
const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed === '' || trimmed === 'string') return false;
    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
};

const normalizeUrl = (url, website_url) => {
    const rawUrl = url || website_url;
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    const trimmed = rawUrl.trim();
    if (trimmed === '' || trimmed === 'string' || (!trimmed.startsWith('http://') && !trimmed.startsWith('https://'))) {
        return null;
    }
    return trimmed;
};

const getJobId = (job) => job.id || job.job_id || job.jobId || job._id;

const isValidValue = (value) => {
    if (!value) return false;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed !== '' && trimmed !== 'string' && trimmed !== 'null' && trimmed !== 'undefined';
    }
    return true;
};

const getTimeAgo = (dateString) => {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Vừa đăng';
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
        return `${Math.floor(diffDays / 30)} tháng trước`;
    } catch {
        return null;
    }
};

const normalizeNumber = (value) => {
    if (value === null || value === undefined) return null;
    const cleaned = String(value).replace(/[^\d]/g, '');
    if (!cleaned) return null;
    return parseInt(cleaned, 10);
};

const formatSalary = (amount, shouldFormatVnd = false) => {
    const normalized = normalizeNumber(amount);
    if (normalized === null || Number.isNaN(normalized)) return '';

    if (shouldFormatVnd) {
        // 1 triệu = 1,000,000 VND
        const millions = normalized / 1_000_000;
        if (millions >= 1) {
            const display = Number.isInteger(millions) ? millions : millions.toFixed(1);
            return `${display} triệu`;
        }
    }

    // Default: format with comma separator (e.g., 1,000,000)
    return normalized.toLocaleString('en-US');
};

const tryParseSalaryText = (text) => {
    if (!text || typeof text !== 'string') return null;
    const numberGroups = text.match(/[\d.,]+/g);
    if (!numberGroups || numberGroups.length === 0) return null;

    const [fromRaw, toRaw] = numberGroups;
    const from = normalizeNumber(fromRaw);
    const to = normalizeNumber(toRaw);

    if ((from === null || Number.isNaN(from)) && (to === null || Number.isNaN(to))) return null;

    const currencyHint = /vnd|₫/i.test(text) ? 'VND' : null;
    return { from, to, currencyHint };
};

// ============================================================================
// Bookmark Button Component
// ============================================================================

const BookmarkButton = ({ isBookmarked, onClick, size = 'small' }) => (
    <IconButton
        size={size}
        onClick={onClick}
        sx={{
            color: isBookmarked ? 'error.main' : 'text.disabled',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                color: isBookmarked ? 'error.dark' : 'text.secondary',
                transform: 'scale(1.1)',
            }
        }}
    >
        {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
    </IconButton>
);

// ============================================================================
// Main Component
// ============================================================================

export default function JobCard({
    job = {},
    onBookmark,
    onClick,
    isBookmarked,
    showPopup = true,
    variant = 'grid',
    showFeatured = true
}) {
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('md'));
    const currentUser = useSelector(state => state.auth?.user);
    const isAuthenticated = useSelector(state => state.auth?.isAuthenticated);

    const [isHovered, setIsHovered] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    const [popupPosition, setPopupPosition] = useState({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    });
    const cardRef = useRef(null);

    const openDelay = 300;
    const closeDelay = 300;


    const calculatePopupPosition = useCallback(() => {
        if (!cardRef.current) {
            return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }

        const cardRect = cardRef.current.getBoundingClientRect();
        const popupWidth = 420;
        const popupHeight = Math.min(window.innerHeight * 0.7, 600);
        const padding = 16;
        const gap = 8;

        const spaceOnRight = window.innerWidth - cardRect.right - padding;
        const spaceOnLeft = cardRect.left - padding;

        let left;
        if (spaceOnRight >= popupWidth + gap) {
            left = cardRect.right + gap;
        } else if (spaceOnLeft >= popupWidth + gap) {
            left = cardRect.left - popupWidth - gap;
        } else if (spaceOnRight > spaceOnLeft) {
            left = Math.min(cardRect.right + gap, window.innerWidth - popupWidth - padding);
        } else {
            left = Math.max(cardRect.left - popupWidth - gap, padding);
        }

        let top = cardRect.top;
        const maxTop = window.innerHeight - popupHeight - padding;
        top = Math.max(padding, Math.min(top, maxTop));

        return { top: `${top}px`, left: `${left}px`, transform: 'none' };
    }, []);


    // Extract unique provinces from company branches
    const getUniqueProvinces = useCallback(() => {
        if (!job.company_branches) return [];

        // Handle array of branches
        const branches = Array.isArray(job.company_branches)
            ? job.company_branches
            : [job.company_branches];

        if (branches.length === 0) return [];

        // Extract unique provinces
        const provinces = branches
            .map(branch => branch?.province?.name)
            .filter(Boolean);

        // Remove duplicates
        const uniqueProvinces = [...new Set(provinces)];
        return uniqueProvinces;
    }, [job.company_branches]);

    // Extract location from company branches (for single location display)
    const getLocationFromBranch = useCallback(() => {
        const uniqueProvinces = getUniqueProvinces();
        if (uniqueProvinces.length === 0) return null;

        // Join unique provinces with comma
        return uniqueProvinces.join(', ');
    }, [getUniqueProvinces]);

    // Extract locations array from all branches (grouped by unique provinces)
    const getLocationsFromBranches = useCallback(() => {
        const uniqueProvinces = getUniqueProvinces();
        if (uniqueProvinces.length === 0) return [];

        // Return array of unique provinces
        return uniqueProvinces;
    }, [getUniqueProvinces]);

    // Extract locations array
    const getLocationsArray = useCallback((locationFromBranch) => {
        // First, try to get locations from branches
        const branchLocations = getLocationsFromBranches();
        if (branchLocations.length > 0) return branchLocations;

        // Fallback to locationFromBranch (single location)
        if (locationFromBranch) return [locationFromBranch];

        // Fallback to other location fields
        if (Array.isArray(job.locations) && job.locations.length > 0) return job.locations;
        if (Array.isArray(job.workLocation) && job.workLocation.length > 0) return job.workLocation;
        if (job.location) return [job.location];
        if (job.shortCity) return [job.shortCity];
        return [];
    }, [job.locations, job.workLocation, job.location, job.shortCity, getLocationsFromBranches]);

    const normalizedJob = useMemo(() => {
        const locationFromBranch = getLocationFromBranch();

        return {
            title: job.title || "Job Title",
            company: job.company,
            location: locationFromBranch || (Array.isArray(job.locations) && job.locations[0]) || job.shortCity,
            type: job.type || (Array.isArray(job.employment_types)
                ? job.employment_types.map(et => et.name || et).join(', ')
                : null),
            salary_text: job.salary_text || job.salary?.text,
            salary_from: job.salary_from ?? job.salary?.from,
            salary_to: job.salary_to ?? job.salary?.to,
            salary_currency: job.salary_currency || job.salary?.currency,
            job_deadline: job.job_deadline || job.deadline,
            url: normalizeUrl(job.url, job.website_url),
            updatedAt: job.updatedAt || job.updated_at,
            publish: job.publish || job.created_at,
            experience: job.experience || (Array.isArray(job.levels)
                ? job.levels.map(l => l.name || l).join(', ')
                : null),
            locations: getLocationsArray(locationFromBranch),
            description: job.description,
            responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : (job.responsibilities ? [job.responsibilities] : []),
            requirement: Array.isArray(job.requirement) ? job.requirement : (job.requirement ? [job.requirement] : []),
            nice_to_haves: Array.isArray(job.nice_to_haves) ? job.nice_to_haves : (job.nice_to_haves ? [job.nice_to_haves] : []),
            working_time: job.working_time || (Array.isArray(job.workingTime) ? job.workingTime.join(', ') : null),
            logo: job.logo,
            isFeatured: job.isFeatured,
            is_diamond: job.is_diamond || job.isDiamond,
            is_job_flash_active: job.is_job_flash_active || job.isJobFlashActive,
            is_hot: job.is_hot || job.isHot,
            created_at: job.created_at || job.createdAt,
            createdAt: job.createdAt || job.created_at,
            position: job.position,
            quantity: job.quantity
        };
    }, [job, getLocationFromBranch, getLocationsArray]);

    const {
        title,
        company: companyData,
        location,
        type,
        salary_text,
        salary_from,
        salary_to,
        salary_currency,
        description,
        responsibilities,
        requirement,
        nice_to_haves,
        working_time,
        job_deadline,
        url: jobUrl,
        logo,
        isFeatured,
        is_diamond,
        is_job_flash_active,
        is_hot,
        created_at,
        createdAt,
        publish
    } = normalizedJob;

    // Company information
    const companyName = typeof companyData === 'string'
        ? companyData
        : companyData?.name || "Company Name";
    const companyLogoUrl = logo || companyData?.logo;
    const companyLogoInitial = "SE";

    // Bookmark state management (optimistic updates)
    const bookmarked = useMemo(() => {
        if (job?.isSaved !== undefined && job?.isSaved !== null) {
            return Boolean(job.isSaved);
        }
        return Boolean(isBookmarked);
    }, [job?.isSaved, isBookmarked]);

    const [localBookmarked, setLocalBookmarked] = useState(bookmarked);

    useEffect(() => {
        setLocalBookmarked(bookmarked);
    }, [bookmarked]);

    // Theme colors based on job source - calculate early since displaySalary depends on it
    const isTopCV = useMemo(() =>
        jobUrl && typeof jobUrl === 'string' && jobUrl.includes('topcv.vn'),
        [jobUrl]
    );

    const formatNumber = (num) => {
        return num.toLocaleString('en-US');
    };

    const formatVND = (amount) => {
        const num = Number(amount);
        if (isNaN(num) || num === 0) return null;

        if (num >= 1000000) {
            const millions = num / 1000000;
            return `${formatNumber(millions)} Triệu`;
        }
        return formatNumber(num);
    };

    const formatSalaryValue = (value, isVND) => {
        if (!isValidValue(value)) return null;
        const num = Number(value);
        if (isNaN(num) || num === 0) return null;
        return isVND ? formatVND(num) : formatNumber(num);
    };

    const displaySalary = useMemo(() => {
        // TopCV data - return as is
        if (isTopCV && isValidValue(salary_text)) {
            return salary_text;
        }

        const currency = (salary_currency || '').trim();
        const isVND = /vnd|₫/i.test(currency) || /vnd|₫/i.test(salary_text || '');
        const currencySuffix = isVND ? '' : ` ${currency || 'VND'}`;

        // Try parsing salary_text first
        if (isValidValue(salary_text)) {
            const parsed = tryParseSalaryText(salary_text);
            if (parsed) {
                const from = formatSalaryValue(parsed.from, isVND);
                const to = formatSalaryValue(parsed.to, isVND);

                // Both are 0 or invalid
                if (!from && !to) return "Thỏa thuận";

                if (from && to) return `${from} - ${to}${currencySuffix}`;
                if (from) return `Từ ${from}${currencySuffix}`;
                if (to) return `Lên đến ${to}${currencySuffix}`;
            }
            return salary_text;
        }

        // Use salary_from and salary_to
        const from = formatSalaryValue(salary_from, isVND);
        const to = formatSalaryValue(salary_to, isVND);

        // Both are 0 or invalid
        if (!from && !to) return "Thỏa thuận";

        if (from && to) return `${from} - ${to}${currencySuffix}`;
        if (from) return `Từ ${from}${currencySuffix}`;
        if (to) return `Lên đến ${to}${currencySuffix}`;

        return "Thỏa thuận";
    }, [salary_text, salary_from, salary_to, salary_currency, isTopCV]);


    const primaryColor = isTopCV ? '#00B14F' : '#1976d2';
    const primaryLightColor = isTopCV ? '#00B14F' : theme.palette.primary.light;
    const primaryDarkColor = isTopCV ? '#008B3D' : theme.palette.primary.dark;

    const isJobFeatured = useMemo(() => {
        const jobCreatedAt = created_at || createdAt;
        if (jobCreatedAt) {
            const createdDate = new Date(jobCreatedAt);
            const now = new Date();
            const diffDays = Math.ceil(Math.abs(now - createdDate) / (1000 * 60 * 60 * 24));
            if (diffDays < 7) return true;
        }
        if (isFeatured !== undefined) return isFeatured;
        return is_diamond || is_job_flash_active || is_hot || false;
    }, [created_at, createdAt, isFeatured, is_diamond, is_job_flash_active, is_hot]);

    const handleNavigate = useCallback(() => {
        if (onClick && typeof onClick === 'function') {
            onClick(job);
        } else {
            const jobId = getJobId(job);
            if (jobId) {
                // Check if it's a TopCV job and navigate to TopCV description page
                if (isValidUrl(jobUrl) && jobUrl.includes('topcv.vn')) {
                    navigate(`/topcv-job?id=${jobId}`);
                } else {
                    navigate(`/job?id=${jobId}`);
                }
            }
        }
    }, [jobUrl, onClick, job, navigate]);

    const handleCardClick = useCallback((e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('[role="button"]')) return;
        handleNavigate();
    }, [handleNavigate]);

    const handleHoverStart = useCallback(() => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        const timeout = setTimeout(() => {
            try {
                if (!cardRef.current) return;
                const position = calculatePopupPosition();
                setPopupPosition(position);
                setIsHovered(true);
            } catch (err) {
                console.error('JobCard hover error:', err);
            }
        }, openDelay);
        setHoverTimeout(timeout);
    }, [hoverTimeout, calculatePopupPosition, openDelay]);

    const handleHoverEnd = useCallback(() => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        const timeout = setTimeout(() => setIsHovered(false), closeDelay);
        setHoverTimeout(timeout);
    }, [hoverTimeout, closeDelay]);

    const handleBookmarkClick = useCallback((e) => {
        e?.stopPropagation();

        // Check if user is authenticated
        if (!isAuthenticated || !currentUser) {
            alert('Vui lòng đăng nhập vào hệ thống để lưu công việc');
            return;
        }


        if (typeof onBookmark !== 'function') return;

        // Optimistic update
        const nextState = !localBookmarked;
        setLocalBookmarked(nextState);

        // Call backend
        const jobId = getJobId(job);
        const action = nextState ? 'save' : 'unsave';

        try {
            onBookmark(job, { action, jobId });
        } catch (err) {
            console.error('Bookmark toggle error:', err);
            // Revert on error
            setLocalBookmarked(!nextState);
        }
    }, [localBookmarked, job, onBookmark, isAuthenticated, currentUser, navigate]);

    const hoverProps = showPopup && !isSmall ? {
        onMouseEnter: handleHoverStart,
        onMouseLeave: handleHoverEnd,
        onFocus: handleHoverStart,
        onBlur: handleHoverEnd
    } : {};

    return (
        <Box sx={{ position: 'relative' }} className="h-full">
            <Card
                ref={cardRef}
                onClick={handleCardClick}
                sx={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    minHeight: '120px',
                    minWidth: '280px',
                    maxWidth: '100%',
                    cursor: onClick ? 'pointer' : 'default',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        bgcolor: primaryColor,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                    },
                    '&:hover': {
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                        borderColor: 'transparent',
                        transform: 'translateY(-4px)',
                        '&::before': { opacity: 1 },
                    }
                }}
            >
                <CardContent sx={{
                    flexGrow: 1,
                    p: 2.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexDirection: 'column',
                    gap: 1.5,
                    '&:last-child': {
                        paddingBottom: 2.5
                    }
                }}>
                    {variant === 'list' && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: -0.5 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4caf50' }}></span>
                                {getTimeAgo(created_at || createdAt) || publish || 'Đăng gần đây'}
                            </Typography>
                            <div className='space-x-2 flex items-center'>
                                {isTopCV && (
                                    <Chip
                                        label="TopCV"
                                        size="small"
                                        sx={{
                                            background: 'linear-gradient(135deg, #00B14F 0%, #00d25e 100%)',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            height: '22px',
                                            borderRadius: '6px',
                                            boxShadow: '0 2px 6px rgba(0, 177, 79, 0.25)',
                                            '& .MuiChip-label': { px: 1.25 }
                                        }}
                                    />
                                )}
                                {isJobFeatured && showFeatured && (
                                    <Chip
                                        label="New"
                                        size="small"
                                        sx={{
                                            background: 'linear-gradient(135deg, #FF6B2C 0%, #ff8c5a 100%)',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            height: '22px',
                                            borderRadius: '6px',
                                            boxShadow: '0 2px 6px rgba(255, 107, 44, 0.25)',
                                            '& .MuiChip-label': { px: 1.25 }
                                        }}
                                    />
                                )}
                                {!isTopCV && (
                                    <BookmarkButton
                                        isBookmarked={localBookmarked}
                                        onClick={handleBookmarkClick}
                                    />
                                )}
                            </div>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar
                            src={companyLogoUrl || undefined}
                            variant="square"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                            sx={{
                                bgcolor: isValidUrl(companyLogoUrl) ? '#ffffff' : primaryColor,
                                width: variant === 'list' ? 68 : 60,
                                height: variant === 'list' ? 68 : 60,
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                borderRadius: 2,
                                flexShrink: 0,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                p: 0.5,
                                '& img': {
                                    objectFit: 'contain',
                                }
                            }}
                        >
                            {companyLogoInitial}
                        </Avatar>

                        <Box sx={{ flexGrow: 1, minWidth: 0, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }} {...hoverProps}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: variant === 'list' ? '1.05rem' : '0.95rem',
                                        lineHeight: 1.4,
                                        cursor: showPopup ? 'pointer' : 'default',
                                        color: 'text.primary',
                                        transition: 'color 0.2s ease-in-out',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        mb: 0.5,
                                        ...(showPopup && {
                                            '&:hover': {
                                                color: primaryColor
                                            }
                                        })
                                    }}
                                >
                                    {title}
                                </Typography>
                                {!isTopCV && variant !== 'list' && (
                                    <BookmarkButton
                                        isBookmarked={localBookmarked}
                                        onClick={handleBookmarkClick}
                                    />
                                )}
                            </Box>

                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: '0.8125rem',
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {companyName}
                            </Typography>
                        </Box>
                    </Box>



                    {variant === 'list' ? (
                        <Stack direction="row" sx={{ flexWrap: 'wrap', rowGap: 1, columnGap: 1, mt: 0.5 }} >
                            <Chip
                                label={displaySalary}
                                size="small"
                                sx={{
                                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryLightColor || '#5cb85c'} 100%)`,
                                    color: 'white',
                                    fontSize: '0.8125rem',
                                    fontWeight: 700,
                                    height: '28px',
                                    borderRadius: '6px',
                                    boxShadow: `0 2px 8px rgba(0,0,0,0.15)`,
                                    '& .MuiChip-label': {
                                        px: 1.5,
                                    }
                                }}
                            />

                            {normalizedJob.locations && Array.isArray(normalizedJob.locations) && normalizedJob.locations.length > 0 ? (
                                normalizedJob.locations
                                    .filter(loc => isValidValue(loc))
                                    .slice(0, 2)
                                    .map((loc, index) => {
                                        const truncatedLoc = loc.length > 35 ? loc.substring(0, 35) + '...' : loc;
                                        return (
                                            <Chip
                                                key={index}
                                                label={truncatedLoc}
                                                title={loc}
                                                size="small"
                                                icon={<span style={{ marginLeft: 8, fontSize: '12px' }}></span>}
                                                sx={{
                                                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                                                    color: 'text.secondary',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    '& .MuiChip-label': { px: 1.5 }
                                                }}
                                            />
                                        );
                                    })
                            ) : location && isValidValue(location) ? (
                                <Chip
                                    label={location.length > 35 ? location.substring(0, 35) + '...' : location}
                                    title={location}
                                    size="small"
                                    icon={<span style={{ marginLeft: 8, fontSize: '12px' }}></span>}
                                    sx={{
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                        color: 'text.secondary',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        height: '28px',
                                        borderRadius: '6px',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '& .MuiChip-label': { px: 1.5 }
                                    }}
                                />
                            ) : null}

                            {normalizedJob.experience && isValidValue(normalizedJob.experience) && (
                                <Chip
                                    label={normalizedJob.experience}
                                    size="small"
                                    icon={<span style={{ marginLeft: 8, fontSize: '12px' }}></span>}
                                    sx={{
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                        color: 'text.secondary',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        height: '28px',
                                        borderRadius: '6px',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '& .MuiChip-label': { px: 1.5 }
                                    }}
                                />
                            )}
                        </Stack>
                    ) : (
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                alignItems: 'center',
                                flexWrap: 'nowrap',
                                pl: 0,
                                mt: 0.5
                            }}
                        >
                            <Chip
                                label={displaySalary}
                                size="small"
                                sx={{
                                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryLightColor || '#5cb85c'} 100%)`,
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    height: '26px',
                                    borderRadius: '6px',
                                    boxShadow: `0 2px 6px rgba(0,0,0,0.15)`,
                                    flexShrink: 0,
                                    '& .MuiChip-label': {
                                        px: 1.25,
                                    }
                                }}
                            />
                            {location && isValidValue(location) && (
                                <Chip
                                    label={location.length > 25 ? location.substring(0, 25) + '...' : location}
                                    title={location}
                                    size="small"
                                    icon={<span style={{ marginLeft: 6, fontSize: '10px' }}></span>}
                                    sx={{
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                        color: 'text.secondary',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        height: '26px',
                                        borderRadius: '6px',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        flexShrink: 0,
                                        '& .MuiChip-label': { px: 1.25 }
                                    }}
                                />
                            )}
                        </Stack>
                    )}
                </CardContent>
            </Card>

            {showPopup && isHovered && !isSmall && (
                <Portal>
                    <Paper
                        onMouseEnter={() => {
                            if (hoverTimeout) clearTimeout(hoverTimeout);
                            setIsHovered(true);
                        }}
                        onMouseLeave={() => {
                            if (hoverTimeout) clearTimeout(hoverTimeout);
                            const timeout = setTimeout(() => setIsHovered(false), closeDelay);
                            setHoverTimeout(timeout);
                        }}
                        elevation={8}
                        sx={{
                            position: 'fixed',
                            top: popupPosition.top,
                            left: popupPosition.left,
                            transform: popupPosition.transform,
                            p: 2.5,
                            zIndex: 9999,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            minWidth: '350px',
                            maxWidth: '450px',
                            maxHeight: '70vh',
                            overflowY: 'auto',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            animation: 'fadeIn 0.15s ease-out',
                            touchAction: 'pan-y',
                            '@keyframes fadeIn': {
                                from: {
                                    opacity: 0,
                                    transform: `${popupPosition.transform} translateY(-8px)`
                                },
                                to: {
                                    opacity: 1,
                                    transform: popupPosition.transform
                                }
                            }
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '1.1rem' }}>
                            {title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, fontSize: '0.9rem' }}>
                            {companyName}
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                            {displaySalary && (
                                <Chip
                                    label={displaySalary}
                                    size="small"
                                    sx={{
                                        bgcolor: primaryColor,
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        height: '24px'
                                    }}
                                />
                            )}
                            {location && (
                                <Chip
                                    label={location}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem', height: '24px' }}
                                />
                            )}
                            {type && (
                                <Chip
                                    label={type}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem', height: '24px' }}
                                />
                            )}
                            {working_time && (
                                <Chip
                                    label={working_time}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem', height: '24px' }}
                                />
                            )}
                        </Stack>

                        {description && (
                            <>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
                                    Mô tả công việc
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        fontSize: '0.85rem',
                                        lineHeight: 1.6,
                                        mb: 2
                                    }}
                                >
                                    {description}
                                </Typography>
                            </>
                        )}

                        {responsibilities?.length > 0 && (
                            <>
                                <Divider sx={{ my: 1.5 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Trách nhiệm
                                </Typography>
                                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                                    {responsibilities.slice(0, 5).map((item, index) => (
                                        <Typography
                                            key={index}
                                            component="li"
                                            variant="body2"
                                            sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 0.5 }}
                                        >
                                            {item}
                                        </Typography>
                                    ))}
                                </Box>
                            </>
                        )}

                        {(requirement?.length > 0) && (
                            <>
                                <Divider sx={{ my: 1.5 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Yêu cầu
                                </Typography>
                                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                                    {(requirement || []).slice(0, 5).map((item, index) => (
                                        <Typography
                                            key={index}
                                            component="li"
                                            variant="body2"
                                            sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 0.5 }}
                                        >
                                            {item}
                                        </Typography>
                                    ))}
                                </Box>
                            </>
                        )}

                        {(nice_to_haves?.length > 0) && (
                            <>
                                <Divider sx={{ my: 1.5 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Nice to have
                                </Typography>
                                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                                    {(nice_to_haves || []).slice(0, 3).map((item, index) => (
                                        <Typography
                                            key={index}
                                            component="li"
                                            variant="body2"
                                            sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 0.5 }}
                                        >
                                            {item}
                                        </Typography>
                                    ))}
                                </Box>
                            </>
                        )}

                        {job_deadline && (
                            <>
                                <Divider sx={{ my: 1.5 }} />
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                    <strong>Hạn nộp hồ sơ:</strong> {isNaN(new Date(job_deadline)) ? job_deadline : new Date(job_deadline).toLocaleDateString('vi-VN')}
                                </Typography>
                            </>
                        )}

                        <Box sx={{ position: 'sticky', bottom: 0, mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleNavigate}
                                sx={{
                                    bgcolor: primaryColor,
                                    color: 'white',
                                    fontWeight: 600,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    '&:hover': {
                                        bgcolor: primaryDarkColor
                                    }
                                }}
                            >
                                Xem chi tiết
                            </Button>
                        </Box>
                    </Paper>
                </Portal>
            )}
        </Box>
    );
}