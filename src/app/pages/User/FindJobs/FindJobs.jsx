import React, { useState, useRef, useEffect, useMemo } from "react";
import { Container, Box, Stack, useMediaQuery, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { JobListSection, HeroSection, FilterDialog, FilterToolbar } from "../../../components";
import JobDescription from "../JobDescription";
import TopCVDescription from "../TopCVDescription";
import { layoutType } from "../../../lib";
import useSearch from "../../../hooks/useSearch";
import { useDispatch, useSelector } from 'react-redux';
import { getLevels } from '../../../modules/services/levelsService';
import { getEmploymentTypes } from '../../../modules/services/employmentTypeService';
import { X } from "lucide-react";

export default function FindJobs() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const theme = useTheme();

    const [selectedJob, setSelectedJob] = useState(null);
    const isSmall = useMediaQuery(theme.breakpoints.down('md'));
    const jobDescRef = useRef(null);

    const levels = useSelector(state => state.levels);
    const employmentTypes = useSelector(state => state.employmentTypes);
    useEffect(() => {
        dispatch(getLevels());
        dispatch(getEmploymentTypes());
    }, [dispatch]);

    useEffect(() => {
        if (selectedJob && jobDescRef.current) {
            try {
                jobDescRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (e) {
                // fallback for non-scrollable elements
                jobDescRef.current.scrollTop = 0;
            }
        }
    }, [selectedJob]);

    // Note: TopCVDescription component will handle fetching TopCV job data internally
    // No need to fetch here to avoid double requests

    // Sử dụng custom hook để quản lý search và filter
    const {
        queryParams,
        appliedFilters,
        isFilterOpen,
        focusSection,
        activeFilterCount,
        handleSearch,
        handlePageChange,
        handleApplyFilters,
        handleQuickFilter,
        handleClearFilter,
        handleClearFilterAll,
        handleQuickFilterChange,
        openFilter,
        closeFilter,
    } = useSearch();

    // Reset selected job when search/filter changes
    useEffect(() => {
        setSelectedJob(null);
    }, [queryParams]);

    // Helper function to check if job is from TopCV
    const isTopCVJob = (job) => {
        if (!job) return false;
        const jobUrl = job.url || job.website_url;
        return jobUrl && typeof jobUrl === 'string' && jobUrl.includes('topcv.vn');
    };

    const handleJobSelect = (job) => {
        if (isSmall) {
            const jobId = job?.id ?? '';
            if (isTopCVJob(job)) {
                navigate(`/topcv-job?id=${jobId}`);
            } else {
                navigate(`/job?id=${jobId}`);
            }
            return;
        }

        setSelectedJob(job);
    };

    // Check if selected job is TopCV job
    const selectedJobIsTopCV = useMemo(() => {
        return isTopCVJob(selectedJob);
    }, [selectedJob]);

    return (
        <>
            <HeroSection onSearch={handleSearch} initialKeyword={queryParams.keyword} />
            <div className="w-full px-10 py-2 md:py-3 space-y-3 md:space-y-5">
                {/* Top filter toolbar */}
                <FilterToolbar
                    onFilterClick={openFilter}
                    onQuickFilterClick={handleQuickFilter}
                    onQuickFilterChange={handleQuickFilterChange}
                    onClearFilter={handleClearFilter}
                    activeFilterCount={activeFilterCount}
                    appliedFilters={appliedFilters}
                />

                <div
                    className="items-start space-x-3 md:space-x-5 flex flex-col md:flex-row"
                >
                    {/* LEFT - Job List */}
                    <Box className={`${selectedJob ? 'flex-2' : 'flex-1'} w-full min-w-0 transition-all`}>
                        <JobListSection
                            onPageChange={handlePageChange}
                            onJobSelect={handleJobSelect}
                            onClearFilters={handleClearFilterAll}
                            selectedJob={selectedJob}
                        />
                    </Box>

                    {/* Right - Job Description (hidden on small screens) */}
                    {selectedJob ? (
                        <Box
                            ref={jobDescRef}
                            className={`${selectedJob ? 'flex-3' : 'flex-2'} min-w-0 hidden md:block sticky top-[7vh] rounded-xl border border-gray-200 shadow-sm`}
                            sx={{
                                overflow: 'auto',
                                maxHeight: '92vh',
                                scrollbarWidth: 'none', // Firefox
                                '&::-webkit-scrollbar': { width: 0, height: 0 }, // WebKit
                            }}
                        >
                            <X onClick={() => setSelectedJob(null)} className="h-5 w-5 absolute z-20 top-2 right-3 text-center hover:text-red-500 hover:font-semibold transition-all cursor-pointer" />
                            {selectedJobIsTopCV ? (
                                <TopCVDescription
                                    jobId={selectedJob?.id}
                                    layout={layoutType.preview}
                                />
                            ) : (
                                <JobDescription
                                    initialJob={selectedJob}
                                    layout={layoutType.preview}
                                />
                            )}
                        </Box>
                    ) : null}
                </div>
            </div>

            {/* Filter popup component */}
            <FilterDialog
                open={isFilterOpen}
                onClose={closeFilter}
                onApply={handleApplyFilters}
                title="Filter Jobs"
                focusSection={focusSection}
                initialFilters={appliedFilters}
                salaryMin={0}
                salaryMax={100000000}
            />
        </>
    );
}
