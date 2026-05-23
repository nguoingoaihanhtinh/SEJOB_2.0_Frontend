import api from "../AxiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const apiBaseUrl = "/api/cvs";

export const getCvs = createAsyncThunk(
    "cvs/getCvs",
    async (options = {}, { rejectWithValue }) => {
        try {
            const params = Object.fromEntries(
                Object.entries(options).filter(
                    ([, value]) => value !== undefined && value !== null && value !== ""
                )
            );
            const response = await api.get(`${apiBaseUrl}/`, {
                params: Object.keys(params).length > 0 ? params : undefined
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

export const getCvsByStudentId = createAsyncThunk(
    "cvs/getCvsByStudentId",
    async ({ studentId, options = {} }, { rejectWithValue }) => {
        try {
            const params = Object.fromEntries(
                Object.entries(options).filter(
                    ([, value]) => value !== undefined && value !== null && value !== ""
                )
            );
            const response = await api.get(`${apiBaseUrl}/student/${studentId}`, {
                params: Object.keys(params).length > 0 ? params : undefined
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

export const getCvById = createAsyncThunk(
    "cvs/getCvById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`${apiBaseUrl}/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

export const createCv = createAsyncThunk(
    "cvs/createCv",
    async (cvData, { rejectWithValue }) => {
        try {
            const filteredData = Object.fromEntries(
                Object.entries(cvData).filter(
                    ([, value]) => value !== undefined && value !== null && value !== ""
                )
            );
            const response = await api.post(`${apiBaseUrl}/`, filteredData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

export const updateCv = createAsyncThunk(
    "cvs/updateCv",
    async ({ id, cvData }, { rejectWithValue }) => {
        try {
            const filteredData = Object.fromEntries(
                Object.entries(cvData).filter(
                    ([, value]) => value !== undefined && value !== null && value !== ""
                )
            );
            const response = await api.put(`${apiBaseUrl}/${id}`, filteredData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

export const deleteCv = createAsyncThunk(
    "cvs/deleteCv",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`${apiBaseUrl}/${id}`);
            return {
                id: id,
                data: response.data
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

const initialState = {
    cvs: [],
    cv: null,
    pagination: null,
    status: "idle",
    error: null,
};

const cvSlice = createSlice({
    name: "cvs",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCvs.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getCvs.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.cvs = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(getCvs.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(getCvById.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getCvById.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.cv = action.payload.data || null;
            })
            .addCase(getCvById.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(getCvsByStudentId.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getCvsByStudentId.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.cvs = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(getCvsByStudentId.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(createCv.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(createCv.fulfilled, (state, action) => {
                state.status = "succeeded";
                if (action.payload.created) {
                    state.cvs.push(action.payload.created);
                } else if (action.payload.data) {
                    state.cvs.push(action.payload.data);
                }
            })
            .addCase(createCv.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(updateCv.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(updateCv.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.cvs.findIndex(cv => cv.id === action.payload.data?.id);
                if (index !== -1 && action.payload.data) {
                    state.cvs[index] = action.payload.data;
                }
            })
            .addCase(updateCv.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(deleteCv.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(deleteCv.fulfilled, (state, action) => {
                state.status = "succeeded";
                const deletedId = action.payload?.id ||
                    action.payload?.data?.cvid ||
                    action.payload?.data?.id ||
                    action.payload?.data?.cv_id;

                if (deletedId) {
                    state.cvs = state.cvs.filter(cv => {
                        const cvId = cv.cvid || cv.id || cv.cv_id;
                        return cvId != null && cvId !== deletedId;
                    });
                }
            })
            .addCase(deleteCv.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export default cvSlice.reducer;