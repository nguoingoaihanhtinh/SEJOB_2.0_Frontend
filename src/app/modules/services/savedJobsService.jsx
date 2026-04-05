import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../AxiosInstance";

const apiBaseUrl = "/api/saved-jobs";

export const getSavedJobs = createAsyncThunk(
    "savedJobs/getSavedJobs", async (requestData, { rejectWithValue }) => {
    try {
        const response = await api.get(`${apiBaseUrl}/`, { params: requestData }, { withCredentials: true });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
});
export const addSavedJob = createAsyncThunk(
    "savedJobs/addSavedJob", async (jobId, { rejectWithValue }) => {
    try {   
        const response = await api.post(`${apiBaseUrl}/`, { job_id: jobId }, { withCredentials: true });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
});
export const removeSavedJob = createAsyncThunk(
    "savedJobs/removeSavedJob", async (jobId, { rejectWithValue }) => {
    try {
        const response = await api.delete(`${apiBaseUrl}/${jobId}`, { withCredentials: true });
        return response.data;
    }

    catch (error) {
        return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }       
});

const initialState = {
    savedJobs: [],
    status: "idle",
    error: null,
};

const savedJobsSlice = createSlice({
    name: "savedJobs",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getSavedJobs.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getSavedJobs.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.savedJobs = action.payload.data || [];
            }
            )
            .addCase(getSavedJobs.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(addSavedJob.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(addSavedJob.fulfilled, (state, action) => {
                state.status = "succeeded";
                // Backend returns { success: true, saved }
                if (action.payload?.saved) {
                    state.savedJobs.push(action.payload.saved);
                }
            })
            .addCase(addSavedJob.rejected, (state, action) => { 
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(removeSavedJob.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(removeSavedJob.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.savedJobs = state.savedJobs.filter(job => job.job_id !== action.meta.arg);
            })
            .addCase(removeSavedJob.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});
export default savedJobsSlice.reducer;