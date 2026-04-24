import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:3000/api/chat/conversations", {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/chat/conversations/${conversationId}/messages`, {
        withCredentials: true,
      });
      return { conversationId, messages: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const initiateChat = createAsyncThunk(
  "chat/initiateChat",
  async ({ studentId, jobId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/chat/conversations",
        { studentId, jobId },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversationsList: [],
    activeChats: [], // [{ conversationId: Number, participantInfo: Object, isMinimized: boolean, messages: [] }]
    status: "idle",
  },
  reducers: {
    openChatWindow: (state, action) => {
      // action.payload: { conversation, participantInfo }
      const exists = state.activeChats.find((c) => c.conversationId === action.payload.conversation.id);
      if (!exists) {
        state.activeChats.push({
          conversationId: action.payload.conversation.id,
          participantInfo: action.payload.participantInfo,
          employerId: action.payload.conversation.employer_id,
          studentId: action.payload.conversation.student_id,
          jobInfo: action.payload.conversation.job,
          isMinimized: false,
          messages: [],
        });
      } else {
        exists.isMinimized = false;
      }
    },
    closeChatWindow: (state, action) => {
      state.activeChats = state.activeChats.filter((c) => c.conversationId !== action.payload);
    },
    toggleMinimizeChat: (state, action) => {
      const chat = state.activeChats.find((c) => c.conversationId === action.payload);
      if (chat) {
        chat.isMinimized = !chat.isMinimized;
      }
    },
    receiveMessage: (state, action) => {
      console.log("Reducer receiveMessage:", action.payload);
      const chat = state.activeChats.find((c) => c.conversationId === action.payload.conversation_id);
      if (chat) {
        console.log("Appending to existing chat window");
        chat.messages.push(action.payload);
      } else {
        console.log("No existing window, looking in conversationsList...");
        const convInfo = state.conversationsList.find(c => c.id === action.payload.conversation_id);
        if (convInfo) {
          console.log("Found conversation info, opening new window");
          // Determine participant (the one who is NOT me)
          // We don't have current userId here easily, but we can check if sender is employer_id
          const isSenderEmployer = action.payload.sender_id === convInfo.employer_id;
          state.activeChats.push({
            conversationId: convInfo.id,
            participantInfo: isSenderEmployer ? convInfo.employer : convInfo.student,
            employerId: convInfo.employer_id,
            studentId: convInfo.student_id,
            jobInfo: convInfo.job,
            isMinimized: false,
            messages: [action.payload],
          });
        } else {
            console.warn("Could not find conversation info for auto-open", action.payload.conversation_id);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsList = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const chat = state.activeChats.find((c) => c.conversationId === action.payload.conversationId);
        if (chat) {
          chat.messages = action.payload.messages;
        }
      });
  },
});

export const { openChatWindow, closeChatWindow, toggleMinimizeChat, receiveMessage } = chatSlice.actions;

export default chatSlice.reducer;
