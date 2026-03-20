import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../AxiosInstance";

const apiBaseUrl = "/api/chatbot";

export const sendChatMessage = createAsyncThunk(
  "chatbot/sendMessage",
  async ({ message, history = [], userRole }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const authToken = state.auth?.token;

      const response = await api.post(
        `${apiBaseUrl}/chat`,
        {
          message,
          history,
          userRole,
        },
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : "",
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message");
    }
  },
);

export const getChatSuggestions = createAsyncThunk(
  "chatbot/getSuggestions",
  async ({ input = "", userRole }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const authToken = state.auth?.token;

      const response = await api.get(`${apiBaseUrl}/suggestions`, {
        params: { input, userRole },
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : "",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to get suggestions");
    }
  },
);

export const getFAQs = createAsyncThunk("chatbot/getFAQs", async (role, { rejectWithValue }) => {
  try {
    const response = await api.get(`${apiBaseUrl}/faqs`, {
      params: { role },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to get FAQs");
  }
});

export const getFAQById = createAsyncThunk("chatbot/getFAQById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`${apiBaseUrl}/faqs/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "FAQ not found");
  }
});

const initialState = {
  messages: [],
  suggestions: [],
  faqs: [],
  selectedFaq: null,
  status: "idle",
  error: null,
  isOpen: false,
  isTyping: false,
};

const chatbotSlice = createSlice({
  name: "chatbot",
  initialState,
  reducers: {
    toggleChatbot: (state) => {
      state.isOpen = !state.isOpen;
    },
    openChatbot: (state) => {
      state.isOpen = true;
    },
    closeChatbot: (state) => {
      state.isOpen = false;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // sendChatMessage
      .addCase(sendChatMessage.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.isTyping = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isTyping = false;
        if (action.payload?.data) {
          state.suggestions = action.payload.data.suggestions || [];
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.status = "failed";
        state.isTyping = false;
        state.error = action.payload;
      })

      // getChatSuggestions
      .addCase(getChatSuggestions.pending, (state) => {
        state.error = null;
      })
      .addCase(getChatSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload?.data || [];
      })
      .addCase(getChatSuggestions.rejected, (state, action) => {
        state.error = action.payload;
      })

      // getFAQs
      .addCase(getFAQs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getFAQs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.faqs = action.payload?.data || [];
      })
      .addCase(getFAQs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(getFAQById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getFAQById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedFaq = action.payload?.data || null;
      })
      .addCase(getFAQById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { toggleChatbot, openChatbot, closeChatbot, addMessage, clearMessages, setTyping } = chatbotSlice.actions;

export default chatbotSlice.reducer;
