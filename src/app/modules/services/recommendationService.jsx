import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../AxiosInstance";

const apiBaseUrl = "/api/recommendations";

export const getRecommendedJobs = createAsyncThunk(
    "recommendations/getRecommendedJobs",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = {
                limit: params.limit || 20,
                ...Object.fromEntries(
                    Object.entries(params).filter(
                        ([key, value]) => key !== 'limit' && value !== undefined && value !== null && value !== ""
                    )
                )
            };

            const response = await api.get(`${apiBaseUrl}/jobs`, {
                params: queryParams,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);


export const getRecommendedJobsWithCustomWeights = createAsyncThunk(
    "recommendations/getRecommendedJobsWithCustomWeights",
    async ({ weights = {}, limit = 20 }, { rejectWithValue }) => {
        try {
            const response = await api.post(`${apiBaseUrl}/jobs/custom`, weights, {
                params: { limit },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);


export const getSimilarJobs = createAsyncThunk(
    "recommendations/getSimilarJobs",
    async ({ jobId, limit = 10 }, { rejectWithValue }) => {
        try {
            if (!jobId) {
                return rejectWithValue("Job ID is required");
            }

            const response = await api.get(`${apiBaseUrl}/jobs/${jobId}/similar`, {
                params: { limit },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

export const getMatchingStudents = createAsyncThunk(
    "recommendations/getMatchingStudents",
    async ({ jobId, limit = 20 }, { rejectWithValue }) => {
        try {
            if (!jobId) {
                return rejectWithValue("Job ID is required");
            }

            const response = await api.get(`${apiBaseUrl}/students/${jobId}`, {
                params: { limit },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);


export const getRecommendedJobsWithTopCV = createAsyncThunk(
    "recommendations/getRecommendedJobsWithTopCV",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = {
                limit: params.limit || 20,
                page: params.page || 1,
                ...Object.fromEntries(
                    Object.entries(params).filter(
                        ([key, value]) => !['limit', 'page'].includes(key) && value !== undefined && value !== null && value !== ""
                    )
                )
            };

            const response = await api.get(`api/jobs/recommendation/me`, {
                params: queryParams,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

export const getTopicSuggestions = createAsyncThunk(
    "recommendations/getTopicSuggestions",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`${apiBaseUrl}/topics`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

const initialState = {
    recommendedJobs: [],
    similarJobs: [],
    matchingStudents: [],
    pagination: null,
    topicSuggestions: null,
    isRequestingTopics: false,
    status: "idle",
    error: null,
};

const recommendationSlice = createSlice({
    name: "recommendations",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // getRecommendedJobs
        builder
            .addCase(getRecommendedJobs.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getRecommendedJobs.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.recommendedJobs = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(getRecommendedJobs.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });

        // getRecommendedJobsWithCustomWeights
        builder
            .addCase(getRecommendedJobsWithCustomWeights.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getRecommendedJobsWithCustomWeights.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.recommendedJobs = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(getRecommendedJobsWithCustomWeights.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });

        // getSimilarJobs
        builder
            .addCase(getSimilarJobs.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getSimilarJobs.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.similarJobs = action.payload.data || [];
            })
            .addCase(getSimilarJobs.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });

        // getMatchingStudents
        builder
            .addCase(getMatchingStudents.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getMatchingStudents.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.matchingStudents = action.payload.data || [];
            })
            .addCase(getMatchingStudents.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });

        // getRecommendedJobsWithTopCV
        builder
            .addCase(getRecommendedJobsWithTopCV.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getRecommendedJobsWithTopCV.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.recommendedJobs = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(getRecommendedJobsWithTopCV.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });

        // getTopicSuggestions
        builder
            .addCase(getTopicSuggestions.pending, (state) => {
                state.isRequestingTopics = true;
                state.error = null;
            })
            .addCase(getTopicSuggestions.fulfilled, (state, action) => {
                state.isRequestingTopics = false;
                state.topicSuggestions = action.payload.data;
            })
            .addCase(getTopicSuggestions.rejected, (state, action) => {
                state.isRequestingTopics = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = recommendationSlice.actions;
export default recommendationSlice.reducer;
