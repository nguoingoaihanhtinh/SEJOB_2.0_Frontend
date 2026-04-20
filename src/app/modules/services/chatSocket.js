import { io } from "socket.io-client";
import { receiveMessage } from "./chatService";
import store from "../../../store";

let socket = null;

export const initChatSocket = () => {
  if (socket) return socket;

  socket = io("http://localhost:3000", {
    withCredentials: true, // sends cookies automatically
  });

  socket.on("connect", () => {
    console.log("✅ Connected to chat socket");
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  socket.on("receive_message", (message) => {
    console.log("📨 Message received from socket:", message);
    const state = store.getState().chat;
    const exists = state.activeChats.find(c => c.conversationId === message.conversation_id) || 
                   state.conversationsList.find(c => c.id === message.conversation_id);
    
    if (!exists) {
      console.log("🔍 Unknown conversation, refreshing list...");
      store.dispatch(fetchConversations()).then(() => {
        store.dispatch(receiveMessage(message));
      });
    } else {
      store.dispatch(receiveMessage(message));
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Disconnected from chat socket");
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const sendChatMessage = (conversationId, receiverId, content) => {
  // Auto-init socket if it wasn't initialized yet
  if (!socket) {
    initChatSocket();
  }
  
  if (socket && socket.connected) {
    socket.emit("send_message", {
      conversationId,
      receiverId,
      content,
    });
  } else {
    console.error("Socket not connected yet, retrying in 1s...");
    // Retry after a short delay
    setTimeout(() => {
      if (socket && socket.connected) {
        socket.emit("send_message", {
          conversationId,
          receiverId,
          content,
        });
      } else {
        console.error("Socket still not connected. Please refresh the page.");
      }
    }, 1000);
  }
};
