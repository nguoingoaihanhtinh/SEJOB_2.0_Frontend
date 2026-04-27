import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../AxiosInstance";
import { message } from "antd";

export const fetchPublicReviews = createAsyncThunk(
  "reviews/fetchPublicReviews",
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/reviews/company/${companyId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchApplicationReviews = createAsyncThunk(
  "reviews/fetchApplicationReviews",
  async (applicationId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/reviews/application/${applicationId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createReview = createAsyncThunk(
  "reviews/createReview",
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/reviews`, reviewData);
      message.success("Review submitted successfully!");
      return response.data;
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to submit review");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAdminReviews = createAsyncThunk(
  "reviews/fetchAdminReviews",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/reviews/admin`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const approveReview = createAsyncThunk(
  "reviews/approveReview",
  async ({ id, is_approved }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/reviews/${id}/approve`, { is_approved });
      message.success(is_approved ? "Review approved!" : "Review unapproved!");
      return response.data;
    } catch (error) {
      message.error("Failed to update review status");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/reviews/${id}`);
      message.success("Review deleted!");
      return id;
    } catch (error) {
      message.error("Failed to delete review");
      return rejectWithValue(error.response?.data);
    }
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    publicReviews: [],
    applicationReviews: [],
    adminReviews: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Public Reviews
      .addCase(fetchPublicReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPublicReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.publicReviews = action.payload.data;
      })
      .addCase(fetchPublicReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Application Reviews
      .addCase(fetchApplicationReviews.fulfilled, (state, action) => {
        state.applicationReviews = action.payload.data;
      })
      // Fetch Admin Reviews
      .addCase(fetchAdminReviews.fulfilled, (state, action) => {
        state.adminReviews = action.payload.data;
      })
      // Approve Review
      .addCase(approveReview.fulfilled, (state, action) => {
        const index = state.adminReviews.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.adminReviews[index] = action.payload;
        }
      })
      // Delete Review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.adminReviews = state.adminReviews.filter(r => r.id !== action.payload);
      });
  },
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
