import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../AxiosInstance";

const apiBaseUrl = "/api/jobs";

export const getJobs = createAsyncThunk(
    "jobs/getJobs",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = Object.fromEntries(
                Object.entries(params).filter(
                    ([, value]) => value !== undefined && value !== null && value !== ""
                )
            );

            const response = await api.get(`${apiBaseUrl}/`, {
                params: queryParams,
                // withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

export const getJobById = createAsyncThunk(
    "jobs/getJobById",
    async (payload, { rejectWithValue }) => {
        try {
            // Support both formats:
            // 1. getJobById(jobId) - for backward compatibility
            // 2. getJobById({ jobId, formatTopCv }) - new format with options
            const jobId = typeof payload === 'object' ? payload.jobId : payload;
            const formatTopCv = typeof payload === 'object' ? payload.formatTopCv : undefined;

            const params = {};
            if (formatTopCv !== undefined) {
                params.formatTopCv = formatTopCv;
            }

            const response = await api.get(`${apiBaseUrl}/${jobId}`, {
                params,
                // withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

export const getMergedJobs = createAsyncThunk(
    "jobs/getMergedJobs",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = Object.fromEntries(
                Object.entries(params).filter(
                    ([, value]) => value !== undefined && value !== null && value !== ""
                )
            );

            const response = await api.get(`${apiBaseUrl}/`, { params: queryParams });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

export const getJobsByCompanyId = createAsyncThunk(
    "jobs/getJobsByCompanyId",
    async ({ companyId, page, limit }, { rejectWithValue }) => {
        try {
            const response = await api.get(`${apiBaseUrl}/company/${companyId}`, {
                params: { page: page, limit: limit },
                // withCredentials: true,
            });
            // Return both data and pagination
            return {
                data: response.data.data || [],
                pagination: response.data.pagination || null
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

export const createJob = createAsyncThunk(
    "jobs/createJob",
    async (jobData, { rejectWithValue }) => {
        try {
            const response = await api.post(`${apiBaseUrl}/`, jobData, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

export const updateJob = createAsyncThunk(
    "jobs/updateJob",
    async ({ jobId, jobData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`${apiBaseUrl}/${jobId}`, jobData, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    });

export const deleteJob = createAsyncThunk(
    "jobs/deleteJob",
    async (jobId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`${apiBaseUrl}/${jobId}`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

const initialState = {
    job: null,
    jobs: [],
    pagination: null,
    status: "idle",
    error: null,
}

const jobsSlice = createSlice({
    name: "jobs",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getJobs.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.pagination = null;
            })
            .addCase(getJobs.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.jobs = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(getJobs.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
                state.pagination = null;
            })
            .addCase(getJobById.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getJobById.fulfilled, (state, action) => {
                state.status = "succeeded";
                const jobData = action.payload.formattedJob || action.payload.data || action.payload;
                state.job = jobData;
            })
            .addCase(getJobById.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(getJobsByCompanyId.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.pagination = null;
            })
            .addCase(getJobsByCompanyId.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.jobs = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
                state.pagination = action.payload?.pagination || null;
            })
            .addCase(getJobsByCompanyId.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
                state.pagination = null;
            })
            .addCase(createJob.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(createJob.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.jobs.push(action.payload.data);
            })
            .addCase(createJob.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(updateJob.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(updateJob.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.jobs.findIndex(job => job.id === action.payload.data.id);
                if (index !== -1) {
                    state.jobs[index] = action.payload.data;
                }
            })
            .addCase(updateJob.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(deleteJob.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(deleteJob.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.jobs = state.jobs.filter(job => job.id !== action.payload.data.id);
            })
            .addCase(deleteJob.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(getMergedJobs.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.pagination = null;
            })
            .addCase(getMergedJobs.fulfilled, (state, action) => {
                state.status = "succeeded";
                const responseData = action.payload.data || {};
                state.jobs = [
                    ...(responseData|| []),
                ];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(getMergedJobs.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
                state.pagination = null;
            });
    },
});

export default jobsSlice.reducer;