import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Box,
    Paper,
    InputAdornment,
    Autocomplete,
    CircularProgress,
} from '@mui/material';
import { Search, LocationOn, Clear } from '@mui/icons-material';
import Input from '../common/Input';
import Button from '../common/Button';
import { jobApi } from '../../../api';

// Hard-coded TopCV city list
const TOPCV_CITIES = [
    { id: 1, name: "Hà Nội" },
    { id: 2, name: "Hồ Chí Minh" },
    { id: 3, name: "Bình Dương" },
    { id: 4, name: "Bắc Ninh" },
    { id: 5, name: "Đồng Nai" },
    { id: 6, name: "Hưng Yên" },
    { id: 7, name: "Hải Dương" },
    { id: 8, name: "Đà Nẵng" },
    { id: 9, name: "Hải Phòng" },
    { id: 10, name: "An Giang" },
    { id: 11, name: "Bà Rịa-Vũng Tàu" },
    { id: 12, name: "Bắc Giang" },
    { id: 13, name: "Bắc Kạn" },
    { id: 14, name: "Bạc Liêu" },
    { id: 15, name: "Bến Tre" },
    { id: 16, name: "Bình Định" },
    { id: 17, name: "Bình Phước" },
    { id: 18, name: "Bình Thuận" },
    { id: 19, name: "Cà Mau" },
    { id: 20, name: "Cần Thơ" },
    { id: 21, name: "Cao Bằng" },
    { id: 22, name: "Cửu Long" },
    { id: 23, name: "Đắk Lắk" },
    { id: 24, name: "Đắc Nông" },
    { id: 25, name: "Điện Biên" },
    { id: 26, name: "Đồng Tháp" },
    { id: 27, name: "Gia Lai" },
    { id: 28, name: "Hà Giang" },
    { id: 29, name: "Hà Nam" },
    { id: 30, name: "Hà Tĩnh" },
    { id: 31, name: "Hậu Giang" },
    { id: 32, name: "Hòa Bình" },
    { id: 33, name: "Khánh Hòa" },
    { id: 34, name: "Kiên Giang" },
    { id: 35, name: "Kon Tum" },
    { id: 36, name: "Lai Châu" },
    { id: 37, name: "Lâm Đồng" },
    { id: 38, name: "Lạng Sơn" },
    { id: 39, name: "Lào Cai" },
    { id: 40, name: "Long An" },
    { id: 41, name: "Miền Bắc" },
    { id: 42, name: "Miền Nam" },
    { id: 43, name: "Miền Trung" },
    { id: 44, name: "Nam Định" },
    { id: 45, name: "Nghệ An" },
    { id: 46, name: "Ninh Bình" },
    { id: 47, name: "Ninh Thuận" },
    { id: 48, name: "Phú Thọ" },
    { id: 49, name: "Phú Yên" },
    { id: 50, name: "Quảng Bình" },
    { id: 51, name: "Quảng Nam" },
    { id: 52, name: "Quảng Ngãi" },
    { id: 53, name: "Quảng Ninh" },
    { id: 54, name: "Quảng Trị" },
    { id: 55, name: "Sóc Trăng" },
    { id: 56, name: "Sơn La" },
    { id: 57, name: "Tây Ninh" },
    { id: 58, name: "Thái Bình" },
    { id: 59, name: "Thái Nguyên" },
    { id: 60, name: "Thanh Hóa" },
    { id: 61, name: "Thừa Thiên Huế" },
    { id: 62, name: "Tiền Giang" },
    { id: 63, name: "Toàn Quốc" },
    { id: 64, name: "Trà Vinh" },
    { id: 65, name: "Tuyên Quang" },
    { id: 66, name: "Vĩnh Long" },
    { id: 67, name: "Vĩnh Phúc" },
    { id: 68, name: "Yên Bái" },
    { id: 100, name: "Nước Ngoài" },
];

const DEFAULT_LOCATION = { label: 'Tất cả thành phố', value: null };

export default function SearchBar({
    onSearch,
    placeholder = "Job title, keywords, or company",
    locationPlaceholder = "City, state, or remote",
    showLocation = true,
    fullWidth = true,
    initialKeyword = '',
    initialLocation = DEFAULT_LOCATION
}) {
    const [keyword, setKeyword] = useState(initialKeyword || '');
    const [location, setLocation] = useState(initialLocation || DEFAULT_LOCATION);
    const [isHighlighted, setIsHighlighted] = useState(false);

    // Suggestion state
    const [suggestions, setSuggestions] = useState([]);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const keywordInputRef = useRef(null);
    const searchBarRef = useRef(null);
    const debounceTimer = useRef(null);

    // If parent updates initial values (e.g. URL changed), sync local state
    useEffect(() => {
        setKeyword(initialKeyword || '');
    }, [initialKeyword]);

    useEffect(() => {
        setLocation(initialLocation || DEFAULT_LOCATION);
    }, [initialLocation]);

    const normalizeText = (text) => text.trim().replace(/\s+/g, ' ');

    const triggerSearch = useCallback((kw) => {
        const q = normalizeText(kw !== undefined ? kw : keyword);
        setShowSuggestions(false);
        setIsHighlighted(false);
        onSearch({ keyword: q, location: location?.value ? location : null });
    }, [keyword, location, onSearch]);

    const handleSearch = () => triggerSearch();

    const handleSuggestionClick = (text) => {
        setKeyword(text);
        triggerSearch(text);
    };

    const handleKeyDown = (event) => {
        if (!showSuggestions) {
            if (event.key === 'Enter') triggerSearch();
            return;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, -1));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                handleSuggestionClick(suggestions[activeIndex]);
            } else {
                triggerSearch();
            }
        } else if (event.key === 'Escape') {
            setShowSuggestions(false);
            setActiveIndex(-1);
        }
    };

    const handleClearKeyword = () => {
        setKeyword('');
        setSuggestions([]);
        setShowSuggestions(false);
        setIsHighlighted(true);
        setTimeout(() => keywordInputRef.current?.focus(), 0);
    };

    // Debounced suggestion fetch
    useEffect(() => {
        clearTimeout(debounceTimer.current);
        const trimmed = keyword.trim();
        if (trimmed.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        debounceTimer.current = setTimeout(async () => {
            setSuggestLoading(true);
            try {
                const results = await jobApi.suggestJobs(trimmed, 8);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
                setActiveIndex(-1);
            } catch {
                setSuggestions([]);
            } finally {
                setSuggestLoading(false);
            }
        }, 300);
        return () => clearTimeout(debounceTimer.current);
    }, [keyword]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                setIsHighlighted(false);
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = React.useMemo(() => {
        return [
            DEFAULT_LOCATION,
            ...TOPCV_CITIES.map(city => ({
                label: city.name,
                value: city.id
            }))
        ];
    }, []);

    return (
        <>
            {/* Backdrop overlay with blur effect */}
            {isHighlighted && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        zIndex: 1300,
                        animation: 'fadeIn 0.2s ease-in',
                        '@keyframes fadeIn': {
                            from: {
                                opacity: 0,
                            },
                            to: {
                                opacity: 1,
                            },
                        },
                    }}
                />
            )}
            <Paper
                ref={searchBarRef}
                elevation={0}
                sx={{
                    bgcolor: 'transparent',
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: { xs: 1, md: 1 },
                    alignItems: "stretch",
                    flexWrap: "wrap",
                    maxWidth: "90%",
                    width: "100%",
                    position: 'relative',
                    zIndex: isHighlighted ? 1301 : 'auto',
                    transition: 'all 0.2s ease-in-out',
                }}
            >
                {showLocation && (
                    <Box
                        sx={{
                            flex: 1,
                            minWidth: { xs: "100%", md: "25%", lg: "20%" },
                            width: { xs: "100%", md: "auto" },
                        }}
                    >
                        <Autocomplete
                            options={options}
                            value={location || DEFAULT_LOCATION}
                            onChange={(event, newValue) => {
                                setLocation(newValue || DEFAULT_LOCATION);
                            }}
                            clearIcon={location === DEFAULT_LOCATION ? null : undefined}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            getOptionLabel={(option) => option?.label || ''}
                            renderInput={(params) => (
                                <Input
                                    {...params}
                                    placeholder={locationPlaceholder}
                                    onKeyDown={handleKeyDown}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOn color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Box>
                )}

                <Box
                    sx={{
                        flex: 1,
                        minWidth: { xs: "100%", md: "55%", lg: "60%" },
                        width: { xs: "100%", md: "auto" },
                        position: 'relative',
                        zIndex: isHighlighted ? 1302 : 'auto',
                        transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
                        transition: 'transform 0.2s ease-in-out',
                    }}
                >
                    <Input
                        inputRef={keywordInputRef}
                        placeholder={placeholder}
                        value={keyword}
                        onChange={(e) => { setKeyword(e.target.value); setIsHighlighted(true); }}
                        onFocus={() => { setIsHighlighted(true); if (suggestions.length > 0) setShowSuggestions(true); }}
                        onKeyDown={handleKeyDown}
                        sx={{
                            ...(isHighlighted && {
                                '& .MuiOutlinedInput-root': {
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                    borderColor: 'primary.main',
                                    '&:hover': { borderColor: 'primary.main' },
                                    '&.Mui-focused': { borderColor: 'primary.main' },
                                },
                            }),
                        }}
                        startAdornment={
                            <InputAdornment position="start">
                                {suggestLoading
                                    ? <CircularProgress size={18} />
                                    : <Search color="action" />}
                            </InputAdornment>
                        }
                        endAdornment={
                            keyword && (
                                <InputAdornment position="end">
                                    <Clear
                                        sx={{ cursor: 'pointer', color: 'action.active', '&:hover': { color: 'action.hover' } }}
                                        onClick={handleClearKeyword}
                                    />
                                </InputAdornment>
                            )
                        }
                    />

                    {/* ── Suggestion Dropdown ── */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: 0,
                            right: 0,
                            zIndex: 1400,
                            background: '#fff',
                            borderRadius: 8,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                            border: '1px solid #e0e0e0',
                            animation: 'sgSlideDown 0.15s ease-out',
                        }}>
                            <style>{`
                                @keyframes sgSlideDown {
                                    from { opacity: 0; transform: translateY(-6px); }
                                    to   { opacity: 1; transform: translateY(0); }
                                }
                                .sg-item:hover, .sg-item.active {
                                    background: #f5f5f5;
                                }
                                .sg-item .sg-text {
                                    font-size: 14px;
                                    color: #333;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                }
                                .sg-item.active .sg-text {
                                    font-weight: 600;
                                }
                            `}</style>

                            {/* Header */}
                            <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                                GỢI Ý TÌM KIẾM
                            </div>

                            {/* Items */}
                            <div style={{ paddingBottom: 4 }} >
                                {suggestions.map((text, idx) => (
                                    <div
                                        key={idx}
                                        className={`sg-item${idx === activeIndex ? ' active' : ''}`}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(text); }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            padding: '8px 16px',
                                            cursor: 'pointer',
                                            background: idx === activeIndex ? '#f5f5f5' : 'transparent',
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#aaa" style={{ flexShrink: 0 }}>
                                            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                        </svg>
                                        <span className="sg-text">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Box>

                <Button
                    variant="contained"
                    onClick={handleSearch}
                    sx={{
                        minWidth: { xs: "100%", md: 120 },
                        width: { xs: "100%", md: "auto" },
                    }}
                >
                    Search
                </Button>
            </Paper>
        </>
    );

    // accept initial values from parent (e.g., from URL query) and sync when they change
    // add optional props handled by parent
}
